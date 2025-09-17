import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Eye, BarChart3, Trash2, Copy, ExternalLink, FileText, Users, QrCode, X } from 'lucide-react'
import { surveyService } from '../services/api'
import QRCode from 'qrcode'

// Base URL do site público (questionário) - normaliza espaços e barra final
const WEB_BASE_URL = (() => {
  const raw = ((import.meta as any).env?.VITE_WEB_URL || 'http://localhost:3003') as string
  const trimmed = raw.trim()
  const result = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
  
  // Debug log para verificar a URL sendo usada
  console.log('🔗 WEB_BASE_URL configurada:', result)
  console.log('🔗 VITE_WEB_URL original:', raw)
  
  return result
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
  const [qrCodeModal, setQrCodeModal] = useState<{
    isOpen: boolean
    url: string
    qrCodeDataUrl: string
    surveyTitle: string
  }>({
    isOpen: false,
    url: '',
    qrCodeDataUrl: '',
    surveyTitle: ''
  })

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
    // Copiar sempre a URL da página inicial do site web
    const link = WEB_BASE_URL
    navigator.clipboard.writeText(link)
    alert('Link copiado para a área de transferência!')
  }

  const handleGenerateQRCode = async (companySlug: string, surveyTitle: string) => {
    try {
      // Por enquanto, apontar para a raiz do site até resolver o roteamento SPA
      const url = WEB_BASE_URL
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeModal({
        isOpen: true,
        url,
        qrCodeDataUrl,
        surveyTitle
      })
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
      alert('Erro ao gerar QR Code')
    }
  }

  const closeQRCodeModal = () => {
    setQrCodeModal({
      isOpen: false,
      url: '',
      qrCodeDataUrl: '',
      surveyTitle: ''
    })
  }

  const handleOpenSurvey = (companySlug: string) => {
    // Abrir sempre a página inicial do site web
    const finalUrl = WEB_BASE_URL
    
    // Debug log para verificar a URL final
    console.log('🚀 Abrindo questionário:')
    console.log('  - Company Slug:', companySlug)
    console.log('  - WEB_BASE_URL:', WEB_BASE_URL)
    console.log('  - URL Final:', finalUrl)
    
    window.open(finalUrl, '_blank')
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
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-md border border-blue-200 transition-colors duration-200"
                        title="Abrir questionário"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-xs font-medium">Abrir</span>
                      </button>
                      
                      <div className="relative group">
                        <button
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-md border border-green-200 transition-colors duration-200"
                          title="Opções de link"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="text-xs font-medium">Link</span>
                        </button>
                        
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleCopyLink(survey.companyName || 'PSB')}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Copy className="h-4 w-4" />
                              Copiar Link
                            </button>
                            <button
                              onClick={() => handleGenerateQRCode(survey.companyName || 'PSB', survey.title)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <QrCode className="h-4 w-4" />
                              Gerar QR Code
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleViewAnalytics(survey.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 rounded-md border border-purple-200 transition-colors duration-200"
                        title="Ver analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-xs font-medium">Stats</span>
                      </button>
                      
                      <button
                        onClick={() => handleViewResponses(survey.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 rounded-md border border-orange-200 transition-colors duration-200"
                        title="Ver respostas"
                      >
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-medium">Ver</span>
                      </button>
                      
                      <button
                        onClick={() => handleEditSurvey(survey.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-md border border-indigo-200 transition-colors duration-200"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="text-xs font-medium">Editar</span>
                      </button>
                      
                      <button
                        onClick={() => handleToggleActive(survey.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-md border transition-colors duration-200 ${
                          survey.isActive
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700 border-gray-200'
                        }`}
                        title={survey.isActive ? 'Desativar' : 'Ativar'}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          {survey.isActive ? 'Desativar' : 'Ativar'}
                        </span>
                      </button>
                      
                      {survey.responsesCount > 0 && (
                        <button
                          onClick={() => handleDeleteAllResponses(survey.id, survey.title)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-md border border-red-200 transition-colors duration-200"
                          title="Excluir todas as respostas"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-xs font-medium">Limpar</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-md border border-red-200 transition-colors duration-200"
                        title="Excluir questionário"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs font-medium">Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal do QR Code */}
      {qrCodeModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                QR Code - {qrCodeModal.surveyTitle}
              </h3>
              <button
                onClick={closeQRCodeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="mb-4">
                <img 
                  src={qrCodeModal.qrCodeDataUrl} 
                  alt="QR Code" 
                  className="mx-auto border border-gray-200 rounded-lg"
                />
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">URL do questionário:</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-xs text-gray-800 break-all">{qrCodeModal.url}</p>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(qrCodeModal.url)
                    alert('Link copiado para a área de transferência!')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Copiar Link
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.download = `qr-code-${qrCodeModal.surveyTitle.replace(/\s+/g, '-').toLowerCase()}.png`
                    link.href = qrCodeModal.qrCodeDataUrl
                    link.click()
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Baixar QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SurveyList
