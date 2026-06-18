import { Heart } from '../types';
import { auth, db as firebaseDb, isFirebaseConfigured, storage as firebaseStorage } from './firebase';
import {
  addDoc as firestoreAddDoc,
  collection as firestoreCollection,
  doc as firestoreDoc,
  getDocs as firestoreGetDocs,
  limit as firestoreLimit,
  onSnapshot as firestoreOnSnapshot,
  orderBy as firestoreOrderBy,
  query as firestoreQuery,
  serverTimestamp as firestoreServerTimestamp,
  startAfter as firestoreStartAfter,
  updateDoc as firestoreUpdateDoc,
  type CollectionReference,
  type DocumentData as FirestoreDocumentData,
  type Query as FirestoreQuery,
  type QueryDocumentSnapshot as FirestoreQueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  getDownloadURL as firebaseGetDownloadURL,
  ref as firebaseRef,
  uploadBytes as firebaseUploadBytes,
  type StorageReference,
  type UploadResult,
} from 'firebase/storage';

export type DocumentData = any;
export type QueryDocumentSnapshot = {
  id: string;
  data: () => DocumentData;
};
export type QuerySnapshot = {
  docs: QueryDocumentSnapshot[];
};

type LocalConstraint =
  | { type: 'orderBy'; field: string; dir: string }
  | { type: 'limit'; n: number }
  | { type: 'startAfter'; doc: any };

type LocalCollection = { __local: true; name: string };
type LocalQuery = { __local: true; col: LocalCollection; constraints: LocalConstraint[] };
type LocalDocRef = { __local: true; col: string; id: string };
type LocalStorageRef = { __local: true; path: string };
type LocalUploadResult = { ref: { fullPath: string; dataUrl: string } };

const STORAGE_KEY = 'starlink_hearts_db';

const hasFirebaseBackend = () =>
  Boolean(isFirebaseConfigured && firebaseDb && firebaseStorage && auth?.currentUser);

const getCurrentUserId = () => auth?.currentUser?.uid ?? null;

const getLocalHearts = (): Heart[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return parsed.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch (e) {
    console.error('Failed to parse local DB', e);
    return [];
  }
};

const saveLocalHearts = (hearts: Heart[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hearts));
  window.dispatchEvent(new Event('local-db-update'));
};

const asWrappedSnapshot = (
  docs: Array<{ id: string; data: () => FirestoreDocumentData }>
): QuerySnapshot => ({
  docs: docs.map((item) => ({
    id: item.id,
    data: item.data,
  })),
});

const isLocalCollection = (value: unknown): value is LocalCollection =>
  Boolean(value && typeof value === 'object' && '__local' in (value as any));

const isLocalQuery = (value: unknown): value is LocalQuery =>
  Boolean(value && typeof value === 'object' && '__local' in (value as any) && 'constraints' in (value as any));

const isLocalDocRef = (value: unknown): value is LocalDocRef =>
  Boolean(value && typeof value === 'object' && '__local' in (value as any) && 'id' in (value as any) && 'col' in (value as any));

const isLocalStorageRef = (value: unknown): value is LocalStorageRef =>
  Boolean(value && typeof value === 'object' && '__local' in (value as any) && 'path' in (value as any));

export const db = firebaseDb ?? {};
export const storage = firebaseStorage ?? {};

export const collection = (_db: any, name: string) => {
  if (hasFirebaseBackend() && firebaseDb) {
    const userId = getCurrentUserId();
    if (userId) {
      return firestoreCollection(firebaseDb, 'users', userId, name);
    }
  }
  return { __local: true, name } satisfies LocalCollection;
};

export const orderBy = (field: string, dir: string) => {
  if (hasFirebaseBackend()) {
    return firestoreOrderBy(field, dir as 'asc' | 'desc');
  }
  return { type: 'orderBy', field, dir } satisfies LocalConstraint;
};

export const limit = (n: number) => {
  if (hasFirebaseBackend()) {
    return firestoreLimit(n);
  }
  return { type: 'limit', n } satisfies LocalConstraint;
};

export const startAfter = (doc: any) => {
  if (hasFirebaseBackend()) {
    return firestoreStartAfter(doc as FirestoreQueryDocumentSnapshot<FirestoreDocumentData>);
  }
  return { type: 'startAfter', doc } satisfies LocalConstraint;
};

export const query = (col: any, ...constraints: any[]) => {
  if (hasFirebaseBackend() && !isLocalCollection(col)) {
    return firestoreQuery(
      col as CollectionReference<FirestoreDocumentData>,
      ...constraints
    );
  }
  return { __local: true, col, constraints } satisfies LocalQuery;
};

export const onSnapshot = (
  queryObj: any,
  callback: (snapshot: QuerySnapshot) => void,
  onError?: (error: any) => void
) => {
  if (hasFirebaseBackend() && !isLocalQuery(queryObj)) {
    return firestoreOnSnapshot(
      queryObj as FirestoreQuery<FirestoreDocumentData>,
      (snapshot) => callback(asWrappedSnapshot(snapshot.docs)),
      (error) => onError?.(error)
    );
  }

  const runLocalQuery = () => {
    let hearts = getLocalHearts();
    hearts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const constraints = isLocalQuery(queryObj) ? queryObj.constraints : [];
    const limitConstraint = constraints.find(
      (constraint): constraint is Extract<LocalConstraint, { type: 'limit' }> =>
        constraint.type === 'limit'
    );

    const sliceLimit = limitConstraint?.n ?? 15;
    const sliced = hearts.slice(0, sliceLimit);

    callback({
      docs: sliced.map((heart) => ({
        id: heart.id || 'unknown',
        data: () => heart,
      })),
    });
  };

  runLocalQuery();
  const listener = () => runLocalQuery();
  window.addEventListener('local-db-update', listener);
  return () => window.removeEventListener('local-db-update', listener);
};

export const addDoc = async (col: any, data: any) => {
  if (hasFirebaseBackend() && !isLocalCollection(col)) {
    return firestoreAddDoc(col as CollectionReference<FirestoreDocumentData>, data);
  }

  const hearts = getLocalHearts();
  const newId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const heart: Heart = {
    ...data,
    id: newId,
    timestamp: new Date(),
  };

  hearts.push(heart);
  saveLocalHearts(hearts);
  return { id: newId };
};

export const updateDoc = async (docRef: any, data: any) => {
  if (hasFirebaseBackend() && !isLocalDocRef(docRef)) {
    await firestoreUpdateDoc(docRef, data);
    return;
  }

  const id = typeof docRef === 'string' ? docRef : docRef.id;
  const hearts = getLocalHearts();
  const index = hearts.findIndex((heart) => heart.id === id);
  if (index !== -1) {
    hearts[index] = { ...hearts[index], ...data };
    saveLocalHearts(hearts);
  }
};

export const doc = (_db: any, col: string, id: string) => {
  if (hasFirebaseBackend() && firebaseDb) {
    const userId = getCurrentUserId();
    if (userId) {
      return firestoreDoc(firebaseDb, 'users', userId, col, id);
    }
  }
  return { __local: true, col, id } satisfies LocalDocRef;
};

export const serverTimestamp = () => {
  if (hasFirebaseBackend()) {
    return firestoreServerTimestamp();
  }
  return new Date();
};

export const getDocs = async (queryObj: any) => {
  if (hasFirebaseBackend() && !isLocalQuery(queryObj)) {
    const snapshot = await firestoreGetDocs(queryObj as FirestoreQuery<FirestoreDocumentData>);
    return asWrappedSnapshot(snapshot.docs);
  }

  let hearts = getLocalHearts();
  hearts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const constraints = isLocalQuery(queryObj) ? queryObj.constraints : [];
  const startAfterConstraint = constraints.find(
    (constraint): constraint is Extract<LocalConstraint, { type: 'startAfter' }> =>
      constraint.type === 'startAfter'
  );
  const limitConstraint = constraints.find(
    (constraint): constraint is Extract<LocalConstraint, { type: 'limit' }> =>
      constraint.type === 'limit'
  );

  let startIndex = 0;
  if (startAfterConstraint) {
    const lastDoc = startAfterConstraint.doc;
    const lastId = lastDoc?.id;
    const lastIndex = hearts.findIndex((heart) => heart.id === lastId);
    if (lastIndex !== -1) startIndex = lastIndex + 1;
  }

  const n = limitConstraint?.n ?? 10;
  const sliced = hearts.slice(startIndex, startIndex + n);

  return {
    docs: sliced.map((heart) => ({
      id: heart.id || 'unknown',
      data: () => heart,
    })),
  };
};

export const ref = (_storage: any, path: string) => {
  if (hasFirebaseBackend() && firebaseStorage) {
    const userId = getCurrentUserId();
    const scopedPath = userId ? `users/${userId}/${path}` : path;
    return firebaseRef(firebaseStorage, scopedPath);
  }
  return { __local: true, path } satisfies LocalStorageRef;
};

export const uploadBytes = async (refObj: any, file: File): Promise<UploadResult | LocalUploadResult> => {
  if (hasFirebaseBackend() && !isLocalStorageRef(refObj)) {
    return firebaseUploadBytes(refObj as StorageReference, file);
  }

  return new Promise<LocalUploadResult>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        ref: {
          fullPath: refObj.path,
          dataUrl: String(reader.result ?? ''),
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const getDownloadURL = async (refObj: any): Promise<string> => {
  if (hasFirebaseBackend() && !isLocalStorageRef(refObj) && !('dataUrl' in (refObj || {}))) {
    return firebaseGetDownloadURL(refObj as StorageReference);
  }

  if ((refObj as any)?.dataUrl) {
    return String((refObj as any).dataUrl);
  }

  return '';
};
