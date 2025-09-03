import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SurveyPage from './components/SurveyPage'
import NotFound from './components/NotFound'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Rota padrão */}
          <Route path="/" element={<SurveyPage />} />
          
          {/* Rota para questionários de empresas (incluindo PSB) */}
          <Route path="/:companySlug" element={<SurveyPage />} />
          
          {/* 404 para rotas não encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
