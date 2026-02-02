import { useState, useEffect } from "react"
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from "../firebase/config"

export const useDocument = (_collection, id) => {

    const [document, setDocument] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {

        const ref = doc(db, _collection, id)
        const unsub = onSnapshot(ref, (doc) => {
            // console.log("Current data: ", doc.data())

            if (doc.data()) {
                const obj = doc.data()
                setDocument(obj)
            } else {
                setError('something went wrong')
            }

        }, err => {
            setError(err.message)
            console.log(err)
        })


        return () => unsub()


    }, [_collection, id])


    return { error, document }

}