import React from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const authToken = localStorage.getItem('authToken')
  const userData = localStorage.getItem('userData')

  if (!authToken || !userData) {
    return <Navigate to="/login" replace />
  }

  try {
    const user = JSON.parse(userData)
    if (!user.id || !user.email) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      return <Navigate to="/login" replace />
    }
  } catch (error) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
