'use client'

import { type FirebaseApp, getApps, initializeApp } from 'firebase/app'
import { type Auth, getAuth } from 'firebase/auth'
import { type FirebaseStorage, getStorage } from 'firebase/storage'

function buildConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
  }
}

export function isFirebaseConfigured(): boolean {
  const c = buildConfig()
  return Boolean(c.apiKey && c.authDomain && c.projectId && c.appId)
}

/** True when Auth + Storage env keys are set (needed for Cloud Storage uploads). */
export function isFirebaseStorageReady(): boolean {
  const c = buildConfig()
  return Boolean(
    c.apiKey && c.authDomain && c.projectId && c.appId && c.storageBucket
  )
}

let app: FirebaseApp | undefined

export function getFirebaseApp(): FirebaseApp | undefined {
  if (typeof window === 'undefined') return undefined
  if (!isFirebaseConfigured()) return undefined
  const existing = getApps()[0]
  if (existing) return existing
  app = initializeApp(buildConfig())
  return app
}

export function getFirebaseAuth(): Auth | undefined {
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) return undefined
  return getAuth(firebaseApp)
}

export function getFirebaseStorage(): FirebaseStorage | undefined {
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp || !isFirebaseStorageReady()) return undefined
  return getStorage(firebaseApp)
}
