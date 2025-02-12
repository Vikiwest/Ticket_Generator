import { openDB } from "idb";

const DB_NAME = "TicketAppDB";
const STORE_NAME = "formData";
const DB_VERSION = 1;
export const saveToIndexedDB = async (key, value) => {
  try {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => {
        db.close();
      };
    };
  } catch (error) {
    console.error("Error saving to IndexedDB:", error);
  }
};
export const getFromIndexedDB = async (key) => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION);
    return db.get(STORE_NAME, key);
  } catch (error) {
    console.error("Error getting from IndexedDB:", error);
    return null;
  }
};


export { DB_NAME, DB_VERSION, STORE_NAME };