import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFirestoreCollection = vi.fn();
const mockFirestoreAddDoc = vi.fn();
const mockFirestoreOnSnapshot = vi.fn();
const mockFirestoreQuery = vi.fn();
const mockFirestoreOrderBy = vi.fn();
const mockFirestoreLimit = vi.fn();
const mockFirestoreGetDocs = vi.fn();
const mockFirestoreUpdateDoc = vi.fn();
const mockFirestoreDoc = vi.fn();
const mockFirestoreServerTimestamp = vi.fn(() => 'TS');
const mockFirestoreStartAfter = vi.fn();

const mockStorageRef = vi.fn();
const mockUploadBytes = vi.fn();
const mockGetDownloadURL = vi.fn();

vi.mock('firebase/firestore', () => ({
  addDoc: mockFirestoreAddDoc,
  collection: mockFirestoreCollection,
  doc: mockFirestoreDoc,
  getDocs: mockFirestoreGetDocs,
  limit: mockFirestoreLimit,
  onSnapshot: mockFirestoreOnSnapshot,
  orderBy: mockFirestoreOrderBy,
  query: mockFirestoreQuery,
  serverTimestamp: mockFirestoreServerTimestamp,
  startAfter: mockFirestoreStartAfter,
  updateDoc: mockFirestoreUpdateDoc,
}));

vi.mock('firebase/storage', () => ({
  getDownloadURL: mockGetDownloadURL,
  ref: mockStorageRef,
  uploadBytes: mockUploadBytes,
}));

describe('localService dual mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.resetModules();
  });

  it('uses local fallback when firebase is not configured', async () => {
    vi.doMock('../services/firebase', () => ({
      auth: null,
      db: null,
      storage: null,
      isFirebaseConfigured: false,
    }));

    const localService = await import('../services/localService');

    const heartsCollection = localService.collection({}, 'hearts');
    const docRef = await localService.addDoc(heartsCollection, {
      message: 'Local message',
      timestamp: new Date(),
    });

    const snapshots: any[] = [];
    localService.onSnapshot(localService.query(heartsCollection), (snapshot) => snapshots.push(snapshot));

    expect(docRef.id).toContain('local_');
    expect(snapshots[0].docs.length).toBe(1);
    expect(snapshots[0].docs[0].data().message).toBe('Local message');
    expect(mockFirestoreAddDoc).not.toHaveBeenCalled();
  });

  it('uses firebase collections scoped to user when available', async () => {
    const user = { uid: 'user-42' };
    vi.doMock('../services/firebase', () => ({
      auth: { currentUser: user },
      db: { __db: true },
      storage: { __storage: true },
      isFirebaseConfigured: true,
    }));

    mockFirestoreCollection.mockReturnValue({ __heartsCollection: true });
    mockFirestoreAddDoc.mockResolvedValue({ id: 'firestore-id' });
    mockStorageRef.mockReturnValue({ __storageRef: true });
    mockUploadBytes.mockResolvedValue({ ref: { __storageRef: true } });
    mockGetDownloadURL.mockResolvedValue('https://cdn/image.png');

    const localService = await import('../services/localService');
    const heartsCollection = localService.collection({}, 'hearts');
    await localService.addDoc(heartsCollection, { message: 'Firebase message' });
    const storageRef = localService.ref({}, 'homework/image.png');
    await localService.uploadBytes(storageRef, new File(['x'], 'x.png', { type: 'image/png' }));
    await localService.getDownloadURL(storageRef);

    expect(mockFirestoreCollection).toHaveBeenCalledWith({ __db: true }, 'users', 'user-42', 'hearts');
    expect(mockFirestoreAddDoc).toHaveBeenCalled();
    expect(mockStorageRef).toHaveBeenCalledWith({ __storage: true }, 'users/user-42/homework/image.png');
    expect(mockUploadBytes).toHaveBeenCalled();
    expect(mockGetDownloadURL).toHaveBeenCalled();
  });

  it('supports local pagination with startAfter + limit', async () => {
    vi.doMock('../services/firebase', () => ({
      auth: null,
      db: null,
      storage: null,
      isFirebaseConfigured: false,
    }));

    const localService = await import('../services/localService');
    const heartsCollection = localService.collection({}, 'hearts');

    await localService.addDoc(heartsCollection, { message: 'A', timestamp: new Date('2024-01-01T10:00:00Z') });
    await localService.addDoc(heartsCollection, { message: 'B', timestamp: new Date('2024-01-01T10:01:00Z') });
    await localService.addDoc(heartsCollection, { message: 'C', timestamp: new Date('2024-01-01T10:02:00Z') });

    const firstPage = await localService.getDocs(
      localService.query(heartsCollection, localService.limit(2))
    );
    const secondPage = await localService.getDocs(
      localService.query(
        heartsCollection,
        localService.startAfter(firstPage.docs[1]),
        localService.limit(2)
      )
    );

    expect(firstPage.docs).toHaveLength(2);
    expect(secondPage.docs).toHaveLength(1);
  });
});
