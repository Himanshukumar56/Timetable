import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Auth Functions
export const registerUser = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const observeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore Functions
export const getUserDocRef = (userId) => doc(db, "users", userId);
export const getScheduleCollectionRef = (userId) =>
  collection(db, "users", userId, "schedule");
export const getNotesCollectionRef = (userId) =>
  collection(db, "users", userId, "notes");
export const getSubjectsCollectionRef = (userId) =>
  collection(db, "users", userId, "subjects");
export const getTemplatesCollectionRef = (userId) =>
  collection(db, "users", userId, "templates");
export const getStudyHistoryCollectionRef = (userId) =>
  collection(db, "users", userId, "studyHistory");

export const getGradesCollectionRef = (userId) =>
  collection(db, "users", userId, "grades");

export const getExamsCollectionRef = (userId) =>
  collection(db, "users", userId, "exams");

export const getCompletedTasksCollectionRef = (userId) =>
  collection(db, "users", userId, "completedTasks");

export const saveUserData = async (userId, data) => {
  await setDoc(getUserDocRef(userId), data, { merge: true });
};

export const getUserData = async (userId) => {
  const docSnap = await getDoc(getUserDocRef(userId));
  return docSnap.exists() ? docSnap.data() : null;
};

// Generic add/update/delete functions for collections
export const addDocument = async (collectionRef, data) => {
  return await addDoc(collectionRef, data);
};

export const updateDocument = async (docRef, data) => {
  await updateDoc(docRef, data);
};

export const deleteDocument = async (docRef) => {
  await deleteDoc(docRef);
};

export const subscribeToCollection = (collectionRef, callback) => {
  return onSnapshot(collectionRef, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const getCollectionData = async (collectionRef) => {
  const querySnapshot = await getDocs(collectionRef);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getFilteredCollectionData = async (
  collectionRef,
  field,
  operator,
  value
) => {
  const q = query(collectionRef, where(field, operator, value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
