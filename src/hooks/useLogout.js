// hooks
import { useAuthContext } from './useAuthContext'
// firebase
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
// react
import { useEffect, useState } from 'react'

export const useLogout = () => {
    const [isCancelled, setIsCancelled] = useState(false)
    const [error, setError] = useState(null)
    const [isPending, setIsPending] = useState(false)
    const { dispatch } = useAuthContext()

    const logOut = () => {

        setError(null)
        setIsPending(true)

        // sign the user out
        signOut(auth).then(() => {

            // dispatch logout action
            dispatch({ type: 'logOut' })
            setIsPending(false)
            setError(null)

        }).catch((err) => {
            console.log(err.message)
            setError(err.message)
            setIsPending(false)
        })
    }



    return { logOut, error, isPending }

}