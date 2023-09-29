import { initializeApp } from "firebase/app"
import { getFirestore, doc, getDoc, getDocs, setDoc, collection, addDoc, updateDoc, onSnapshot, serverTimestamp, query, orderBy, limit, Timestamp, startAt, endAt, where } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
}


const app = initializeApp(firebaseConfig)
const db = getFirestore(app)


export const firestore = {
  db,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  limit,
  Timestamp,
  startAt,
  endAt,
  where
}