import { Heart } from '../types';

// --- Types needed to mock Firebase ---
export type DocumentData = any;
export type QueryDocumentSnapshot = {
    id: string;
    data: () => DocumentData;
};
export type QuerySnapshot = {
    docs: QueryDocumentSnapshot[];
};

// --- Local Storage Management ---
const STORAGE_KEY = 'starlink_hearts_db';

const getLocalHearts = (): Heart[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
        const parsed = JSON.parse(saved);
        // Correctly restore Dates
        return parsed.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
        }));
    } catch (e) {
        console.error("Failed to parse local DB", e);
        return [];
    }
};

const saveLocalHearts = (hearts: Heart[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hearts));
    // Dispatch event for real-time updates within the same tab/window
    window.dispatchEvent(new Event('local-db-update'));
};

// --- Mock Firestore API ---

export const db = {}; // Mock object
export const storage = {}; // Mock object

export const collection = (db: any, name: string) => name;
export const orderBy = (field: string, dir: string) => ({ type: 'orderBy', field, dir });
export const limit = (n: number) => ({ type: 'limit', n });
export const startAfter = (doc: any) => ({ type: 'startAfter', doc });

export const query = (col: string, ...constraints: any[]) => {
    return { col, constraints };
};

export const onSnapshot = (queryObj: any, callback: (snapshot: QuerySnapshot) => void, onError?: (error: any) => void) => {
    
    const runQuery = () => {
        let hearts = getLocalHearts();
        
        // Apply sorts (default is typically DESC timestamp in this app)
        hearts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Apply limits (mock implementation, just taking top N for simplicity if limit exists)
        // Ideally we'd parse constraints properly, but for this specific app:
        // The main query is: query(heartsCollection, orderBy('timestamp', 'desc'), limit(15));
        
        // We will just return the latest 15 for the initial snapshot
        const sliced = hearts.slice(0, 15);

        const docs: QueryDocumentSnapshot[] = sliced.map(h => ({
            id: h.id || 'unknown',
            data: () => h
        }));

        callback({ docs });
    };

    // Initial run
    runQuery();

    // Listen for updates
    const listener = () => runQuery();
    window.addEventListener('local-db-update', listener);

    // Return unsubscribe function
    return () => window.removeEventListener('local-db-update', listener);
};

export const addDoc = async (col: string, data: any) => {
    const hearts = getLocalHearts();
    const newId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate server timestamp
    const heart: Heart = {
        ...data,
        id: newId,
        timestamp: new Date() // Date.now() in data is replaced by actual object
    };
    
    hearts.push(heart);
    saveLocalHearts(hearts);
    
    return { id: newId };
};

export const updateDoc = async (docRef: any, data: any) => {
    // docRef in this mock is just the ID wrapper or the ID itself if we change usage
    // expected usage: doc(db, 'hearts', heartId) -> we need to mock `doc` too
    
    const id = typeof docRef === 'string' ? docRef : docRef.id;
    const hearts = getLocalHearts();
    const index = hearts.findIndex(h => h.id === id);
    
    if (index !== -1) {
        // Simple merge
        hearts[index] = { ...hearts[index], ...data };
        saveLocalHearts(hearts);
    }
};

export const doc = (db: any, col: string, id: string) => ({ id });

export const serverTimestamp = () => new Date();

export const getDocs = async (queryObj: any) => {
    // Mocking pagination for "Load More"
    // query includes startAfter(lastVisible)
    
    let hearts = getLocalHearts();
    hearts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const constraints = queryObj.constraints || [];
    const startAfterConstraint = constraints.find((c: any) => c.type === 'startAfter');
    const limitConstraint = constraints.find((c: any) => c.type === 'limit');
    
    let startIndex = 0;
    if (startAfterConstraint) {
        const lastDoc = startAfterConstraint.doc;
        const lastId = lastDoc.id;
        const lastIndex = hearts.findIndex(h => h.id === lastId);
        if (lastIndex !== -1) startIndex = lastIndex + 1;
    }

    const n = limitConstraint ? limitConstraint.n : 10;
    const sliced = hearts.slice(startIndex, startIndex + n);

    return {
        docs: sliced.map(h => ({
            id: h.id || 'unknown',
            data: () => h
        }))
    };
};

// --- Mock Storage API ---

export const ref = (storage: any, path: string) => ({ path });

export const uploadBytes = async (ref: any, file: File) => {
    return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
             // We will store the base64 string in a separate "FILE_STORAGE" to avoid bloating the main DB
             // Or actually, for simplicity in this "quick setup", we can just return the DataURL directly.
             // The app expects `getDownloadURL` to return a URL. A DataURL is a valid URL.
             resolve({ ref: { fullPath: ref.path, dataUrl: reader.result } });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const getDownloadURL = async (ref: any) => {
    // In our uploadBytes mock, we passed the dataUrl access via the ref object effectively? 
    // No, standard Firebase `uploadBytes` returns a Result that has a `ref`. 
    // Then `getDownloadURL` takes that `ref`.
    // Since we can't easily persist the file "on the server", we have a challenge: 
    // Persisting large images in LocalStorage is bad. 
    // Trick: We will assume the `uploadBytes` result contains the DataURL we need, 
    // AND we will cheat by attaching it to the ref object in `uploadBytes`.
    
    if ((ref as any).dataUrl) return (ref as any).dataUrl;
    
    return ""; // Fallback
};

// Fix the `uploadBytes` to return a structure that `getDownloadURL` can use.
// We need to change the flow slightly.
// The app calls: snapshot = await uploadBytes(...); url = await getDownloadURL(snapshot.ref);
// So snapshot.ref needs to hold the DataURL.
