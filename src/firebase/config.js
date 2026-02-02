import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import {getFunctions} from 'firebase/functions'

const firebaseConfig = {
	apiKey: 'AIzaSyAtx1OMwl4Te7H_pMBbZSgnhTWPVuaFna0',
	authDomain: 'prati-19b90.firebaseapp.com',
	projectId: 'prati-19b90',
	storageBucket: 'prati-19b90.firebasestorage.app',
	messagingSenderId: '568818360293',
	appId: '1:568818360293:web:b71471f6bc98037c54d90c',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// initialize firebase auth
const auth = getAuth()

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app)

const functions = getFunctions(app)

export { db, auth, functions }
