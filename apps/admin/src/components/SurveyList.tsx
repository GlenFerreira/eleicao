import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Eye, BarChart3, Trash2, Copy, ExternalLink, FileText, Users } from 'lucide-react'
import { surveyService } from '../services/api'

// Base URL do site público (questionário) - normaliza espaços e barra final
const WEB_BASE_URL = (() => {
  const raw = ((import.meta as any).env?.VITE_WEB_URL || 'http://localhost:3003') as string
  const trimmed = raw.trim()
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
})()

interface Survey {
  id: string
  title: string
  description: string
  isActive: boolean
  createdAt: string
  responsesCount: number
  questionsCount: number
  collectContactInfo: any
  companyName: string
}

const SurveyList: React.FC = () => {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar questionários da API
  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await surveyService.getSurveys()
      
      if (response.success) {
        setSurveys(response.data.surveys)
      } else {
        setError('Erro ao carregar questionários')
      }
    } catch (err: any) {
      console.error('Erro ao carregar questionários:', err)
      setError(err.message || 'Erro ao carregar questionários')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSurvey = () => {
    navigate('/create-survey')
  }

  const handleEditSurvey = (surveyId: string) => {
    // TODO: Implementar edição de questionário
    console.log('Editar questionário:', surveyId)
  }

  const handleViewAnalytics = (surveyId: string) => {
    navigate(`/surveys/${surveyId}/analytics`)
  }

  const handleViewResponses = (surveyId: string) => {
    navigate(`/surveys/${surveyId}/responses`)
  }

  const handleDeleteAllResponses = async (surveyId: string, surveyTitle: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir TODAS as respostas do questionário "${surveyTitle}"?\n\nEsta ação não pode ser desfeita.`
    )
    
    if (!confirmed) return

    try {
      const response = await surveyService.deleteAllResponses(surveyId)
      
      if (response.success) {
        alert(response.message || 'Respostas excluídas com sucesso!')
        loadSurveys() // Recarregar a lista
      } else {
        alert('Erro ao excluir respostas')
      }
    } catch (error: any) {
      console.error('Erro ao excluir respostas:', error)
      alert(`Erro ao excluir respostas: ${error.message}`)
    }
  }

  const handleToggleActive = async (surveyId: string) => {
    try {
      const response = await surveyService.toggleSurvey(surveyId)
      
      if (response.success) {
        // Atualizar estado local
        setSurveys(prev => prev.map(survey => 
          survey.id === surveyId 
            ? { ...survey, isActive: !survey.isActive }
            : survey
        ))
        
        // Mostrar mensagem de sucesso
        alert(response.message)
      }
    } catch (err: any) {
      console.error('Erro ao alterar status:', err)
      alert(`Erro ao alterar status: ${err.message}`)
    }
  }

  const handleDeleteSurvey = async (surveyId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este questionário? Esta ação não pode ser desfeita.')) {
      try {
        const response = await surveyService.deleteSurvey(surveyId)
        
        if (response.success) {
          // Remover do estado local
          setSurveys(prev => prev.filter(survey => survey.id !== surveyId))
          alert('Questionário deletado com sucesso')
        }
      } catch (err: any) {
        console.error('Erro ao deletar questionário:', err)
        alert(`Erro ao deletar questionário: ${err.message}`)
      }
    }
  }

  const handleCopyLink = (companySlug: string) => {
    const slug = (companySlug || '').toString().trim()
    const safeSlug = encodeURIComponent(slug)
    const link = `${WEB_BASE_URL}/${safeSlug}`
    navigator.clipboard.writeText(link)
    alert('Link copiado para a área de transferência!')
  }

  const handleOpenSurvey = (companySlug: string) => {
    const slug = (companySlug || '').toString().trim()
    const safeSlug = encodeURIComponent(slug)
    window.open(`${WEB_BASE_URL}/${safeSlug}`, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando questionários...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSurveys}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Meus Questionários</h1>
            </div>
            <button
              onClick={handleCreateSurvey}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Questionário
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{surveys.length}</p>
              <p className="text-sm text-gray-600">Total de Questionários</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {surveys.filter(s => s.isActive).length}
              </p>
              <p className="text-sm text-gray-600">Ativos</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {surveys.reduce((sum, s) => sum + s.responsesCount, 0)}
              </p>
              <p className="text-sm text-gray-600">Total de Respostas</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {surveys.length > 0 
                  ? Math.round(surveys.reduce((sum, s) => sum + s.questionsCount, 0) / surveys.length)
                  : 0
                }
              </p>
              <p className="text-sm text-gray-600">Média de Perguntas</p>
            </div>
          </div>
        </div>

        {/* Surveys List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lista de Questionários</h2>
          </div>
          
          {surveys.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum questionário criado</h3>
              <p className="text-gray-600 mb-4">Comece criando seu primeiro questionário para coletar feedback dos usuários.</p>
              <button
                onClick={handleCreateSurvey}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Criar Primeiro Questionário
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {surveys.map((survey) => (
                <div key={survey.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{survey.title}</h3>
                        <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                          survey.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {survey.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{survey.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>Criado em: {formatDate(survey.createdAt)}</span>
                        <span>{survey.questionsCount} perguntas</span>
                        <span>{survey.responsesCount} respostas</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenSurvey(survey.companyName || 'PSB')}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Abrir questionário"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleCopyLink(survey.companyName || 'PSB')}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                        title="Copiar link"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleViewAnalytics(survey.id)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                        title="Ver analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleViewResponses(survey.id)}
                        className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md"
                        title="Ver respostas"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEditSurvey(survey.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleActive(survey.id)}
                        className={`p-2 rounded-md ${
                          survey.isActive
                            ? 'text-green-600 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={survey.isActive ? 'Desativar' : 'Ativar'}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {survey.responsesCount > 0 && (
                        <button
                          onClick={() => handleDeleteAllResponses(survey.id, survey.title)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                          title="Excluir todas as respostas"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default SurveyList
