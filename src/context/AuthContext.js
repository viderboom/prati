import { createContext, useEffect, useReducer, useContext } from 'react'
import { auth } from '../firebase/config'
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth'

// Create AuthContext
export const AuthContext = createContext()

// Reducer to manage auth state
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SIGNUP':
    case 'SIGNIN':
      return { ...state, user: action.payload }
    case 'LOGOUT':
      return { ...state, user: null }
    case 'AUTH_IS_READY':
      return { ...state, user: action.payload, authIsReady: true }
    default:
      return state
  }
}

// AuthContextProvider Component
export function AuthContextProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    authIsReady: false,
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get the custom claims for the authenticated user
          const idTokenResult = await getIdTokenResult(user)
          const claims = idTokenResult.claims // This will contain the custom claims like `admin`, `manager`, etc.
          
          // Dispatch the user with claims
          dispatch({ type: 'AUTH_IS_READY', payload: { ...user, claims } })
        } catch (error) {
          console.error('Error fetching user claims:', error)
        }
      } else {
        dispatch({ type: 'AUTH_IS_READY', payload: null })
      }
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ ...state, dispatch }}>{children}</AuthContext.Provider>
}

// Custom Hook: useAuthContext
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthContextProvider')
  }
  return context
}
