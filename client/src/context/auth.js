import React from 'react'
import { useState, useContext, createContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: ''
  })

  useEffect(() => {
    // Set default axios header whenever auth token changes, adding "Bearer " prefix
    axios.defaults.headers.common['Authorization'] = auth?.token
      ? `Bearer ${auth.token}`
      : ''
  }, [auth?.token])

  useEffect(() => {
    const data = localStorage.getItem('auth')
    if (data) {
      const parseData = JSON.parse(data)
      setAuth({
        ...auth,
        user: parseData.user,
        token: parseData.token
      })
    }
    //eslint-disable-next-line
  }, [])
  return (
    <AuthContext.Provider value={[auth, setAuth]}>
      {children}
    </AuthContext.Provider>
  )
}

// custom hook
const useAuth = () => useContext(AuthContext)

export { useAuth, AuthProvider }
