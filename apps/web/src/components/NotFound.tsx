import React from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'

const NotFound: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Página não encontrada</h1>
        <p className="text-gray-600 mb-6">
          A página que você está procurando não existe ou foi movida.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
        >
          <Home className="h-5 w-5 mr-2" />
          Voltar ao Início
        </button>
      </div>
    </div>
  )
}

export default NotFound
