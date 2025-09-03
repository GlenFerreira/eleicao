import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import CompanyAdminDashboard from './components/CompanyAdminDashboard'
import CreateSurvey from './components/CreateSurvey'
import SurveyList from './components/SurveyList'
import SurveyResponses from './components/SurveyResponses'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <CompanyAdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-survey" element={
            <ProtectedRoute>
              <CreateSurvey />
            </ProtectedRoute>
          } />
          <Route path="/surveys" element={
            <ProtectedRoute>
              <SurveyList />
            </ProtectedRoute>
          } />
          <Route path="/surveys/:surveyId/responses" element={
            <ProtectedRoute>
              <SurveyResponses />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
