import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import NotFound from './NotFound'
import { publicSurveyService } from '../services/api'

interface SurveyQuestion {
  id: string
  questionText: string
  questionType: 'text' | 'multiple_choice' | 'rating'
  isRequired: boolean
  orderIndex: number
  options: QuestionOption[]
}

interface QuestionOption {
  id: string
  optionText: string
  optionValue: string
  orderIndex: number
}

interface Survey {
  id: string
  title: string
  description: string
  companyName: string
  collectContactInfo: {
    name: boolean
    email: boolean
    phone: boolean
    newsletter: boolean
  }
  questions: SurveyQuestion[]
}

interface SurveyResponse {
  surveyId: string
  companyId: string
  contactInfo: {
    name?: string
    email?: string
    phone?: string
    newsletter?: boolean
  }
  answers: {
    questionId: string
    answer: string | string[]
  }[]
}

const SurveyPage: React.FC = () => {
  const { companySlug } = useParams<{ companySlug: string }>()
  const navigate = useNavigate()
  
  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState<SurveyResponse>({
    surveyId: '',
    companyId: '',
    contactInfo: {},
    answers: []
  })

  // Carregar questionário da API
  useEffect(() => {
    const loadSurvey = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('CompanySlug recebido:', companySlug)
        
        if (companySlug) {
          console.log('Tentando carregar questionário para empresa:', companySlug)
          
          // Buscar questionário da API
          const response = await publicSurveyService.getSurvey(companySlug)
          
          console.log('Resposta da API:', response)
          
          if (response.success) {
            const apiSurvey = response.data.survey
            
            console.log('Dados do questionário recebidos:', apiSurvey)
            
            // Converter dados da API para o formato local
            const localSurvey: Survey = {
              id: apiSurvey.id,
              title: apiSurvey.title,
              description: apiSurvey.description,
              companyName: apiSurvey.companyName,
              collectContactInfo: apiSurvey.collect_contact_info || {
                name: false,
                email: false,
                phone: false,
                newsletter: false
              },
              questions: apiSurvey.questions.map((q: any) => ({
                id: q.id,
                questionText: q.questionText,
                questionType: q.questionType,
                isRequired: q.isRequired,
                orderIndex: q.orderIndex,
                options: q.options || []
              }))
            }
            
            console.log('Questionário convertido:', localSurvey)
            
            setSurvey(localSurvey)
            setFormData(prev => ({
              ...prev,
              surveyId: localSurvey.id,
              companyId: apiSurvey.company_id
            }))
          } else {
            console.error('API retornou erro:', response)
            setError('Erro ao carregar questionário')
          }
        } else {
          console.log('Sem companySlug, mostrando tela de boas-vindas')
          // Rota raiz - mostrar lista de empresas disponíveis
          setSurvey({
            id: 'welcome',
            title: 'Bem-vindo aos Questionários Raed',
            description: 'Escolha uma empresa para responder ao questionário:',
            companyName: 'Raed',
            collectContactInfo: {
              name: false,
              email: false,
              phone: false,
              newsletter: false
            },
            questions: []
          })
        }
      } catch (err: any) {
        console.error('Erro ao carregar questionário:', err)
        if (companySlug) {
          setError(err.message || 'Empresa não encontrada')
        } else {
          setError('Erro ao carregar dados')
        }
      } finally {
        setLoading(false)
      }
    }

    loadSurvey()
  }, [companySlug])

  const handleContactInfoChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }))
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setFormData(prev => {
      const existingAnswerIndex = prev.answers.findIndex(a => a.questionId === questionId)
      
      if (existingAnswerIndex >= 0) {
        const newAnswers = [...prev.answers]
        newAnswers[existingAnswerIndex] = { questionId, answer }
        return { ...prev, answers: newAnswers }
      } else {
        return { ...prev, answers: [...prev.answers, { questionId, answer }] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!survey || !companySlug) return
    
    // Validações
    const requiredQuestions = survey.questions.filter(q => q.isRequired)
    const answeredQuestions = formData.answers.filter(a => 
      a.answer && (typeof a.answer === 'string' ? a.answer.trim() : a.answer.length > 0)
    )
    
    if (answeredQuestions.length < requiredQuestions.length) {
      alert('Por favor, responda todas as perguntas obrigatórias.')
      return
    }
    
    // Validar campos de contato obrigatórios
    if (survey.collectContactInfo.name && !formData.contactInfo.name?.trim()) {
      alert('Por favor, informe seu nome.')
      return
    }
    
    if (survey.collectContactInfo.email && !formData.contactInfo.email?.trim()) {
      alert('Por favor, informe seu email.')
      return
    }

    try {
      setSubmitting(true)
      
      // Preparar dados para a API
      const submitData = {
        contactInfo: formData.contactInfo,
        answers: formData.answers
      }
      
      // Enviar para a API
      const response = await publicSurveyService.submitResponses(companySlug, submitData)
      
      if (response.success) {
        setSubmitted(true)
      } else {
        alert('Erro ao enviar respostas. Tente novamente.')
      }
      
    } catch (err: any) {
      console.error('Erro ao enviar respostas:', err)
      alert(`Erro ao enviar respostas: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando questionário...</p>
        </div>
      </div>
    )
  }

  if (error) {
    // Verificar se é erro 404 (nenhum questionário encontrado)
    const isNotFoundError = error.includes('404') || error.includes('não encontrado') || error.includes('not found')
    
    if (isNotFoundError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Nenhum Questionário Disponível</h1>
            <p className="text-gray-600 mb-6">
              No momento, não há questionários ativos disponíveis para a empresa <strong>{companySlug}</strong>.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Possíveis motivos:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 text-left">
                <li>• O questionário ainda não foi criado</li>
                <li>• O questionário foi temporariamente desativado</li>
                <li>• O questionário foi removido</li>
              </ul>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Verificar Novamente
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      )
    }
    
    // Para outros tipos de erro, mostrar a tela de erro padrão
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

  if (!survey) {
    return <NotFound />
  }

  // Se não há companySlug, mostrar tela de boas-vindas
  if (!companySlug) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo aos Questionários Raed</h1>
            <p className="text-lg text-gray-600 mb-8">Escolha uma empresa para responder ao questionário:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                   onClick={() => navigate('/PSB')}>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-lg">PSB</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">PSB</h3>
                <p className="text-gray-600 text-sm">Pesquisa de Satisfação</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Se há companySlug mas o survey tem id 'welcome', significa que houve erro
  if (survey && survey.id === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar questionário</h3>
          <p className="text-gray-600 mb-4">Não foi possível carregar o questionário da empresa {companySlug}</p>
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Obrigado!</h1>
          <p className="text-gray-600 mb-6">
            Suas respostas foram enviadas com sucesso. Agradecemos sua participação!
          </p>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Empresa:</strong> {survey?.companyName}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Questionário:</strong> {survey?.title}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{survey.companyName}</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">{survey.companyName}</span>
            </div>
            <div className="text-sm text-gray-500">
              Questionário
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Formulário do questionário */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Survey Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{survey.title}</h1>
            {survey.description && (
              <p className="text-lg text-gray-600">{survey.description}</p>
            )}
          </div>

        {/* Contact Info Fields */}
        {(survey.collectContactInfo.name || survey.collectContactInfo.email || 
          survey.collectContactInfo.phone || survey.collectContactInfo.newsletter) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {survey.collectContactInfo.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome {survey.questions.some(q => q.isRequired) && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo.name || ''}
                    onChange={(e) => handleContactInfoChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Seu nome completo"
                    required={survey.collectContactInfo.name}
                  />
                </div>
              )}
              
              {survey.collectContactInfo.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email {survey.questions.some(q => q.isRequired) && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="email"
                    value={formData.contactInfo.email || ''}
                    onChange={(e) => handleContactInfoChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="seu@email.com"
                    required={survey.collectContactInfo.email}
                  />
                </div>
              )}
              
              {survey.collectContactInfo.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={formData.contactInfo.phone || ''}
                    onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              )}
              
              {survey.collectContactInfo.newsletter && (
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.contactInfo.newsletter || false}
                      onChange={(e) => handleContactInfoChange('newsletter', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Quero receber novidades por email</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {survey.questions.map((question) => (
            <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Questão {question.orderIndex}
                  {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                </h4>
                <p className="text-gray-700 mt-2">{question.questionText}</p>
              </div>

              {/* Question Input */}
              {question.questionType === 'text' && (
                <textarea
                  value={formData.answers.find(a => a.questionId === question.id)?.answer as string || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Digite sua resposta aqui..."
                  required={question.isRequired}
                />
              )}

              {question.questionType === 'multiple_choice' && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option.optionValue}
                        checked={formData.answers.find(a => a.questionId === question.id)?.answer === option.optionValue}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mr-3"
                        required={question.isRequired}
                      />
                      <span className="text-gray-700">{option.optionText}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.questionType === 'rating' && (
                <div className="flex space-x-4">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <label key={rating} className="flex flex-col items-center">
                      <input
                        type="radio"
                        name={`rating_${question.id}`}
                        value={rating.toString()}
                        checked={formData.answers.find(a => a.questionId === question.id)?.answer === rating.toString()}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="mb-2"
                        required={question.isRequired}
                      />
                      <span className="text-sm text-gray-700">{rating}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              'Enviar Respostas'
            )}
          </button>
        </div>
      </form>
    </main>
  </div>
)
}

export default SurveyPage
