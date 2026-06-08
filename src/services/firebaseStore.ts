import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
const app = firebaseEnabled ? (getApps()[0] ?? initializeApp(firebaseConfig)) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

type CollectionName = 'cards' | 'transactions' | 'debts' | 'bills';

async function getUserId() {
  if (!auth) return null;
  if (auth.currentUser) return auth.currentUser.uid;
  const credential = await signInAnonymously(auth);
  return credential.user.uid;
}

export async function saveFirebaseItem<T extends { id: string }>(collectionName: CollectionName, item: T) {
  if (!db) return;
  const uid = await getUserId();
  if (!uid) return;
  await setDoc(doc(db, 'users', uid, collectionName, item.id), item, { merge: true });
}

export async function deleteFirebaseItem(collectionName: CollectionName, id: string) {
  if (!db) return;
  const uid = await getUserId();
  if (!uid) return;
  await deleteDoc(doc(db, 'users', uid, collectionName, id));
}

export async function subscribeFirebaseCollection<T>(collectionName: CollectionName, callback: (items: T[]) => void) {
  if (!db) return () => {};
  const uid = await getUserId();
  if (!uid) return () => {};
  return onSnapshot(collection(db, 'users', uid, collectionName), (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T)));
  });
}
