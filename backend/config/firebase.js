const admin = require("firebase-admin");
const axios = require("axios");
const path = require("path");

// Load env vars (dotenv is already called in server.js)
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "green-kar";
const FIREBASE_API_KEY =
  process.env.FIREBASE_API_KEY || "AIzaSyANqzbG3-13xc35__7cYTdI3NaaLmya6J4";
const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

let adminApp = null;
let db = null;
let auth = null;
let adminDb = null;

if (SERVICE_ACCOUNT_PATH) {
  try {
    // Resolve path relative to the backend directory
    const absolutePath = path.resolve(
      __dirname,
      "..",
      SERVICE_ACCOUNT_PATH.replace(/^\.\//, "")
    );
    const serviceAccount = require(absolutePath);
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: FIREBASE_PROJECT_ID,
    });
    db = adminApp.firestore();
    adminDb = adminApp.firestore();
    auth = adminApp.auth();
    console.log("✅ Firebase Admin SDK initialized with service account");
  } catch (e) {
    console.warn(
      "⚠️ Failed to load service account, falling back to REST client:",
      e.message
    );
  }
}

// ---------- REST client (fallback, unauthenticated) ----------
if (!db) {
  class FirestoreCollection {
    constructor(collectionName) {
      this.collectionName = collectionName;
      this.baseUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
    }
    async doc(docId) {
      const url = `${this.baseUrl}/${this.collectionName}/${docId}`;
      return {
        get: async () => {
          try {
            const res = await axios.get(`${url}?key=${FIREBASE_API_KEY}`);
            return {
              exists: true,
              id: docId,
              data: () => this._convertFirestoreData(res.data.fields),
            };
          } catch {
            return { exists: false, id: docId, data: () => null };
          }
        },
        set: async (data) => {
          const payload = { fields: this._toFirestoreFormat(data) };
          await axios.patch(
            `${url}?key=${FIREBASE_API_KEY}&currentDocument.exists=false`,
            payload
          );
        },
        update: async (data) => {
          const payload = { fields: this._toFirestoreFormat(data) };
          await axios.patch(`${url}?key=${FIREBASE_API_KEY}`, payload);
        },
      };
    }
    where() {
      return new QueryBuilder(this);
    }
    orderBy() {
      return new QueryBuilder(this);
    }
    async add(data) {
      const docId = Date.now().toString();
      const payload = { fields: this._toFirestoreFormat(data) };
      await axios.post(
        `${this.baseUrl}/${this.collectionName}?key=${FIREBASE_API_KEY}&documentId=${docId}`,
        payload
      );
      return { id: docId };
    }
    _toFirestoreFormat(data) {
      const out = {};
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === "string") out[k] = { stringValue: v };
        else if (typeof v === "number") out[k] = { doubleValue: v };
        else if (typeof v === "boolean") out[k] = { booleanValue: v };
        else if (v === null) out[k] = { nullValue: null };
        else out[k] = { stringValue: JSON.stringify(v) };
      }
      return out;
    }
    _convertFirestoreData(fields) {
      if (!fields) return {};
      const out = {};
      for (const [k, v] of Object.entries(fields)) {
        if (v.stringValue !== undefined) out[k] = v.stringValue;
        else if (v.doubleValue !== undefined) out[k] = v.doubleValue;
        else if (v.integerValue !== undefined)
          out[k] = parseInt(v.integerValue);
        else if (v.booleanValue !== undefined) out[k] = v.booleanValue;
      }
      return out;
    }
  }
  class QueryBuilder {
    constructor(collection) {
      this.collection = collection;
      this._limit = null;
      this._order = null;
      this._where = [];
    }
    where(field, operator, value) {
      this._where.push({ field, operator, value });
      return this;
    }
    limit(num) {
      this._limit = num;
      return this;
    }
    orderBy(field, direction) {
      this._order = { field, direction };
      return this;
    }
    async get() {
      const url = `${this.collection.baseUrl}/${this.collection.collectionName}?key=${FIREBASE_API_KEY}`;
      const res = await axios.get(url);
      let docs = (res.data.documents || []).map((doc) => ({
        id: doc.name.split("/").pop(),
        ...doc,
      }));

      // Apply where filters
      if (this._where.length > 0) {
        docs = docs.filter((doc) => {
          return this._where.every((filter) => {
            const field = doc.fields[filter.field];
            const fieldValue =
              field?.stringValue ??
              field?.doubleValue ??
              field?.integerValue ??
              field?.booleanValue ??
              null;

            switch (filter.operator) {
              case "==":
                return fieldValue === filter.value;
              case "!=":
                return fieldValue !== filter.value;
              case "<":
                return fieldValue < filter.value;
              case "<=":
                return fieldValue <= filter.value;
              case ">":
                return fieldValue > filter.value;
              case ">=":
                return fieldValue >= filter.value;
              default:
                return true;
            }
          });
        });
      }

      if (this._order) {
        docs.sort((a, b) => {
          const av = a.fields[this._order.field];
          const bv = b.fields[this._order.field];
          const aVal =
            av?.stringValue ?? av?.doubleValue ?? av?.integerValue ?? 0;
          const bVal =
            bv?.stringValue ?? bv?.doubleValue ?? bv?.integerValue ?? 0;
          if (aVal < bVal) return this._order.direction === "desc" ? 1 : -1;
          if (aVal > bVal) return this._order.direction === "desc" ? -1 : 1;
          return 0;
        });
      }
      if (this._limit !== null) docs = docs.slice(0, this._limit);
      return {
        empty: docs.length === 0,
        docs: docs.map((d) => ({
          id: d.id,
          data: () => this.collection._convertFirestoreData(d.fields),
        })),
      };
    }
  }
  db = { collection: (name) => new FirestoreCollection(name) };
  adminDb = db;
}

module.exports = { admin: adminApp, db, auth, adminDb };
