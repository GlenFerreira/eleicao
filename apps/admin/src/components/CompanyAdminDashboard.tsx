import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Users, BarChart3, LogOut, Plus } from 'lucide-react'
import { surveyService } from '../services/api'

const CompanyAdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0
  })
  const [loading, setLoading] = useState(true)

  // Carregar estatísticas
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await surveyService.getSurveys()
      
      if (response.success) {
        const surveys = response.data.surveys
        setStats({
          totalSurveys: surveys.length,
          totalResponses: surveys.reduce((sum: number, survey: any) => sum + survey.responsesCount, 0),
          activeSurveys: surveys.filter((survey: any) => survey.isActive).length
        })
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    navigate('/login')
  }

  const handleCreateSurvey = () => {
    navigate('/create-survey')
  }

  const handleViewSurveys = () => {
    navigate('/surveys')
  }

  const handleViewResponses = () => {
    // Navegar para a lista de questionários onde o usuário pode escolher qual ver as respostas
    navigate('/surveys')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/Logo.svg" alt="Raed Logo" className="h-8 w-auto" />
              <span className="ml-3 text-xl font-semibold text-gray-900">Painel da Empresa</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Admin da Empresa</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Bem-vindo ao Painel da sua Empresa
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Crie questionários e acompanhe as respostas dos usuários
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Questionários</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {loading ? '...' : stats.totalSurveys}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Respostas</p>
                    <p className="text-2xl font-bold text-green-900">
                      {loading ? '...' : stats.totalResponses}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Ativos</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {loading ? '...' : stats.activeSurveys}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={handleCreateSurvey}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5 inline mr-2" />
                  Criar Questionário
                </button>
                <button 
                  onClick={handleViewSurveys}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="h-5 w-5 inline mr-2" />
                  Ver Questionários
                </button>
                <button 
                  onClick={handleViewResponses}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <BarChart3 className="h-5 w-5 inline mr-2" />
                  Ver Respostas
                </button>
              </div>
            </div>

            {/* Getting Started */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Começando</h3>
              <p className="text-gray-600 mb-4">
                Para começar a usar o sistema, crie seu primeiro questionário:
              </p>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Clique em "Criar Questionário"</li>
                <li>2. Adicione as perguntas obrigatórias (Questão1, Questão2, etc.)</li>
                <li>3. Configure campos opcionais (Nome, Email, Telefone)</li>
                <li>4. Publique e compartilhe o link</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default CompanyAdminDashboard

