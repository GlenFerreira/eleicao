import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, Users, Calendar, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { surveyService } from '../services/api'

interface QuestionAnswer {
  id: string
  questionId: string
  questionText: string
  questionType: string
  questionOrder: number
  answerText?: string
  selectedOptions?: any
  ratingValue?: number
}

interface SurveyResponse {
  id: string
  submittedAt: string
  answers: QuestionAnswer[]
}

interface Survey {
  id: string
  title: string
  companyId: string
}

interface SurveyResponsesData {
  survey: Survey
  responses: SurveyResponse[]
  totalResponses: number
}

const SurveyResponses: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>()
  const navigate = useNavigate()
  
  const [data, setData] = useState<SurveyResponsesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar respostas da API
  useEffect(() => {
    const loadResponses = async () => {
      if (!surveyId) return

      try {
        setLoading(true)
        setError(null)
        
        const response = await surveyService.getSurveyResponses(surveyId)
        
        if (response.success) {
          setData(response.data)
        } else {
          setError('Erro ao carregar respostas')
        }
      } catch (err: any) {
        console.error('Erro ao carregar respostas:', err)
        setError(err.message || 'Erro ao carregar respostas')
      } finally {
        setLoading(false)
      }
    }

    loadResponses()
  }, [surveyId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatAnswer = (answer: QuestionAnswer) => {
    switch (answer.questionType) {
      case 'text':
        return answer.answerText || 'Sem resposta'
      
      case 'multiple_choice':
        if (answer.selectedOptions && Array.isArray(answer.selectedOptions)) {
          return answer.selectedOptions.join(', ')
        }
        return answer.answerText || 'Sem resposta'
      
      case 'rating':
        return answer.ratingValue ? `${answer.ratingValue}/5` : 'Sem resposta'
      
      default:
        return answer.answerText || 'Sem resposta'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando respostas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
          <p className="text-gray-600">Não foi possível carregar as respostas do questionário.</p>
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
                onClick={() => navigate('/surveys')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                <h1 className="text-xl font-semibold text-gray-900">Respostas do Questionário</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Survey Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.survey.title}</h2>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{data.totalResponses} respostas</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Última atualização: {formatDate(new Date().toISOString())}</span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{data.totalResponses}</p>
              <p className="text-sm text-gray-600">Total de Respostas</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {data.responses.length > 0 ? Math.round((data.responses.filter(r => r.answers.length > 0).length / data.responses.length) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Taxa de Completude</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {data.responses.length > 0 ? data.responses[0].answers.length : 0}
              </p>
              <p className="text-sm text-gray-600">Perguntas por Resposta</p>
            </div>
          </div>
        </div>

        {/* Responses List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lista de Respostas</h2>
          </div>
          
          {data.responses.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma resposta encontrada</h3>
              <p className="text-gray-600">Este questionário ainda não recebeu respostas.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {data.responses.map((response, index) => (
                <div key={response.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Resposta #{index + 1}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Enviada em: {formatDate(response.submittedAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Answers */}
                  <div className="space-y-4">
                    {response.answers.map((answer) => (
                      <div key={answer.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {answer.questionOrder}. {answer.questionText}
                          </h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {answer.questionType === 'text' ? 'Texto' :
                             answer.questionType === 'multiple_choice' ? 'Múltipla Escolha' :
                             answer.questionType === 'rating' ? 'Avaliação' : answer.questionType}
                          </span>
                        </div>
                        <p className="text-gray-700 bg-white p-3 rounded border">
                          {formatAnswer(answer)}
                        </p>
                      </div>
                    ))}
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

export default SurveyResponses
