// src/firestoreRest.js

import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

const PROJECT_ID = "application13-12";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/**
 * Obtenir le token d'authentification via Capacitor
 */
async function getAuthToken() {
  try {
    const result = await FirebaseAuthentication.getIdToken();
    if (!result || !result.token) {
      throw new Error("User not authenticated");
    }
    return result.token;
  } catch (error) {
    console.error("[firestoreRest] Error getting token:", error);
    throw new Error("User not authenticated");
  }
}

/**
 * Créer ou remplacer un document (écrase complètement le document existant)
 */
export async function setDocument(path, data) {
  const token = await getAuthToken();
  
  const firestoreData = objectToFirestoreFields(data);
  
  const response = await fetch(`${BASE_URL}/${path}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: firestoreData }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Firestore REST error: ${error.error?.message || response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Mettre à jour un document (merge)
 */
export async function updateDocument(path, data) {
  const token = await getAuthToken();
  
  const firestoreData = objectToFirestoreFields(data);
  
  const updateMask = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join("&");
  
  const response = await fetch(`${BASE_URL}/${path}?${updateMask}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: firestoreData }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Firestore REST error: ${error.error?.message || response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Lire un document
 */
export async function getDocument(path) {
  const token = await getAuthToken();
  
  const response = await fetch(`${BASE_URL}/${path}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    const error = await response.json();
    throw new Error(`Firestore REST error: ${error.error?.message || response.statusText}`);
  }
  
  const doc = await response.json();
  return firestoreFieldsToObject(doc.fields);
}

/**
 * Supprimer des champs d'un document
 */
export async function deleteFields(path, fieldNames) {
  const token = await getAuthToken();
  
  // Construire l'updateMask pour tous les champs à supprimer
  const updateMask = fieldNames.map(f => `updateMask.fieldPaths=${f}`).join("&");
  
  // Construire le body avec tous les champs à null
  const fields = {};
  fieldNames.forEach(name => {
    fields[name] = { nullValue: null };
  });
  
  const response = await fetch(`${BASE_URL}/${path}?${updateMask}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error("[deleteFields] Error:", error);
    // Ne pas throw si le champ n'existe pas
    if (response.status === 404) return null;
    throw new Error(`Firestore REST error: ${error.error?.message || response.statusText}`);
  }
  
  return await response.json();
}

/**
 * Convertir objet JS → format Firestore
 */
function objectToFirestoreFields(obj) {
  const fields = {};
  
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = valueToFirestoreValue(value);
  }
  
  return fields;
}

/**
 * Convertir valeur JS → valeur Firestore
 */
function valueToFirestoreValue(value) {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  
  if (typeof value === "string") {
    return { stringValue: value };
  }
  
  if (typeof value === "number") {
    return Number.isInteger(value) 
      ? { integerValue: value.toString() }
      : { doubleValue: value };
  }
  
  if (typeof value === "boolean") {
    return { booleanValue: value };
  }
  
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }
  
  if (value === "SERVER_TIMESTAMP") {
    return { timestampValue: new Date().toISOString() };
  }
  
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(v => valueToFirestoreValue(v))
      }
    };
  }
  
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: objectToFirestoreFields(value)
      }
    };
  }
  
  throw new Error(`Unsupported value type: ${typeof value}`);
}

/**
 * Convertir format Firestore → objet JS
 */
function firestoreFieldsToObject(fields) {
  if (!fields) return {};
  
  const obj = {};
  
  for (const [key, value] of Object.entries(fields)) {
    obj[key] = firestoreValueToValue(value);
  }
  
  return obj;
}

/**
 * Convertir valeur Firestore → valeur JS
 */
function firestoreValueToValue(value) {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.timestampValue !== undefined) return new Date(value.timestampValue);
  if (value.nullValue !== undefined) return null;
  
  if (value.arrayValue) {
    return value.arrayValue.values?.map(v => firestoreValueToValue(v)) || [];
  }
  
  if (value.mapValue) {
    return firestoreFieldsToObject(value.mapValue.fields);
  }
  
  return null;
}

/**
 * Remplacer serverTimestamp()
 */
export function serverTimestamp() {
  return "SERVER_TIMESTAMP";
}