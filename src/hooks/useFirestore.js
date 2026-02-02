// firebase imports
import { db } from "../firebase/config"
import { collection, doc, addDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { useReducer } from "react"

const firestoreReducer = (state, action) => {

    switch (action) {
        case "Pending":
            return {
                isPending: true,
                document: null,
                success: false,
                error: null
            }
        case "Added_doc":
            return {
                isPending: false,
                document: action.payload,
                success: true,
                error: null
            }
        case "Deleted_doc":
            return {
                isPending: false,
                document: null,
                success: true,
                error: null
            }
        case 'Updated_doc':
            return {
                isPending: false,
                document: action.payload,
                success: true,
                error: null
            }
        case 'ERROR':
            return {
                isPending: false,
                document: null,
                success: false,
                error: action.payload
            }

        default:
            return state;
    }
}

export const useFirestore = () => {

    const [response, dispatch] = useReducer(firestoreReducer, {
        document: null,
        isPending: false,
        error: null,
        success: null
    })


    // Adding a document to a collection
    const addDocument = async (_collection, _doc) => {

        dispatch({ type: 'Pending' })

        try {
            const docRef = await addDoc(collection(db, _collection), {
                ..._doc
            })

            //adding the id of the doc in the doc data
            await updateDoc(docRef, {
                id: docRef.id
            })

            dispatch({ type: 'Added_doc', payload: docRef })

            return (docRef.id)
        } catch (err) {
            dispatch({ type: 'Error', payload: err.message })
            console.error(err.message)

        }
    }

    // setting new doc in database
    const setDocument = async (_collection, id, dataToUpload) => {

        dispatch({ type: 'Pending' })

        try {
            const userDocRef = doc(db, _collection, id)

            await setDoc(userDocRef, {
                ...dataToUpload
            })

            dispatch({ type: 'set_doc', payload: userDocRef })

        } catch (err) {
            dispatch({ type: 'Error', payload: err.message })
            console.log(err.message)
        }
    }

    //deleting a document
    const deleteDocument = async (_collection, id) => {
        dispatch({ type: 'Pending' })

        try {
            console.log('colletion and id:', _collection, id)

            const docRef = doc(db, _collection, id)
            await deleteDoc(docRef)

            dispatch({ type: 'Deleted_doc', payload: docRef })

        } catch (err) {
            dispatch({ type: 'Error', payload: err.message })
            console.log(err.message)
        }

    }


    //Updating a document in a collection
    const updateDocument = async (_collection, _doc, dataToUpdate) => {

        dispatch({ type: 'Pending' })

        try {
            const docRef = doc(db, _collection, _doc);

            const updatedDoc = await updateDoc(docRef, {
                ...dataToUpdate
            })

            dispatch({ type: 'Updated_doc', payload: docRef })

        } catch (err) {
            dispatch({ type: 'Error', payload: err.message })
            console.log(err.message)
        }
    }


    return { response, addDocument, updateDocument, setDocument, deleteDocument }
}