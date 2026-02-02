// firebase
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'
// react
import { useState } from 'react'
// hooks
import { useAuthContext } from './useAuthContext'


export const useLogin = () => {

    const [error, setError] = useState(null)
    const [isPending, setIsPending] = useState(false)
    const { dispatch } = useAuthContext()

    const logIn = async (email, password) => {

        setError(null)
        setIsPending(true)

        // sign the user in
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)

            dispatch({ type: 'signin', payload: userCredential.user })
            setIsPending(false)
            setError(null)



        } catch (err) {
            console.log(err.message)
            setError(err.message)
            setIsPending(false)
        }


    }


    return { logIn, error, isPending }
}