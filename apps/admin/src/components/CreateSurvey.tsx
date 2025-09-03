import React, { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Save, Eye, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Question, QuestionOption, SurveyForm } from '../types/survey'
import { surveyService } from '../services/api'

const CreateSurvey: React.FC = () => {
  const navigate = useNavigate()
  const [surveyForm, setSurveyForm] = useState<SurveyForm>({
    title: '',
    description: '',
    isActive: true,
    questions: [],
    collectContactInfo: {
      name: false,
      email: false,
      phone: false,
      newsletter: false
    }
  })

  const [currentStep, setCurrentStep] = useState<'form' | 'preview'>('form')
  const [submitting, setSubmitting] = useState(false)

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      questionText: '',
      questionType: 'text',
      isRequired: true,
      orderIndex: surveyForm.questions.length + 1,
      options: []
    }
    setSurveyForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const addQuestionWithOptions = (type: 'text' | 'multiple_choice' | 'rating') => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      questionText: '',
      questionType: type,
      isRequired: true,
      orderIndex: surveyForm.questions.length + 1,
      options: type === 'multiple_choice' ? [
        { id: `opt_${Date.now()}_1`, optionText: 'Opção 1', optionValue: '1', orderIndex: 1 },
        { id: `opt_${Date.now()}_2`, optionText: 'Opção 2', optionValue: '2', orderIndex: 2 }
      ] : []
    }
    setSurveyForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }))
  }

  const removeQuestion = (questionId: string) => {
    setSurveyForm(prev => ({
      ...prev,
      questions: prev.questions
        .filter(q => q.id !== questionId)
        .map((q, index) => ({ ...q, orderIndex: index + 1 }))
    }))
  }

  const addOption = (questionId: string) => {
    const question = surveyForm.questions.find(q => q.id === questionId)
    if (!question) return

    const newOption: QuestionOption = {
      id: `opt_${Date.now()}`,
      optionText: '',
      optionValue: '',
      orderIndex: question.options.length + 1
    }

    updateQuestion(questionId, {
      options: [...question.options, newOption]
    })
  }

  const updateOption = (questionId: string, optionId: string, updates: Partial<QuestionOption>) => {
    const question = surveyForm.questions.find(q => q.id === questionId)
    if (!question) return

    const updatedOptions = question.options.map(opt => 
      opt.id === optionId ? { ...opt, ...updates } : opt
    )

    updateQuestion(questionId, { options: updatedOptions })
  }

  const removeOption = (questionId: string, optionId: string) => {
    const question = surveyForm.questions.find(q => q.id === questionId)
    if (!question) return

    const updatedOptions = question.options
      .filter(opt => opt.id !== optionId)
      .map((opt, index) => ({ ...opt, orderIndex: index + 1 }))

    updateQuestion(questionId, { options: updatedOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!surveyForm.title.trim()) {
      alert('Digite o título do questionário')
      return
    }
    
    if (surveyForm.questions.length === 0) {
      alert('Adicione pelo menos uma pergunta ao questionário')
      return
    }

    // Validar se todas as perguntas têm texto
    const invalidQuestions = surveyForm.questions.filter(q => !q.questionText.trim())
    if (invalidQuestions.length > 0) {
      alert('Todas as perguntas devem ter texto')
      return
    }

    // Validar questões de múltipla escolha
    const invalidMultipleChoice = surveyForm.questions.filter(q => 
      q.questionType === 'multiple_choice' && q.options.length < 2
    )
    if (invalidMultipleChoice.length > 0) {
      alert('Questões de múltipla escolha devem ter pelo menos 2 opções')
      return
    }

    // Validar opções de múltipla escolha
    const invalidOptions = surveyForm.questions.some(q => 
      q.questionType === 'multiple_choice' && 
      q.options.some(opt => !opt.optionText.trim() || !opt.optionValue.trim())
    )
    if (invalidOptions) {
      alert('Todas as opções de múltipla escolha devem ter texto e valor')
      return
    }

    try {
      setSubmitting(true)
      
      // Preparar dados para a API
      const surveyData = {
        title: surveyForm.title.trim(),
        description: surveyForm.description.trim(),
        isActive: surveyForm.isActive,
        collectContactInfo: surveyForm.collectContactInfo,
        questions: surveyForm.questions.map((q, index) => ({
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          isRequired: q.isRequired,
          orderIndex: index + 1,
          options: q.questionType === 'multiple_choice' ? q.options.map((opt, optIndex) => ({
            optionText: opt.optionText.trim(),
            optionValue: opt.optionValue.trim(),
            orderIndex: optIndex + 1,
            isCorrect: false // Por padrão, nenhuma opção é correta
          })) : []
        }))
      }

      // Enviar para a API
      const response = await surveyService.createSurvey(surveyData)
      
      if (response.success) {
        alert('Questionário criado com sucesso!')
        // Redirecionar para a lista de questionários
        navigate('/surveys')
      } else {
        alert('Erro ao criar questionário')
      }
    } catch (error: any) {
      console.error('Erro ao criar questionário:', error)
      alert(`Erro ao criar questionário: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const togglePreview = () => {
    setCurrentStep(currentStep === 'form' ? 'preview' : 'form')
  }

  if (currentStep === 'preview') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={togglePreview}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Voltar ao Editor
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePreview}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="h-4 w-4 inline mr-2" />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Preview Content */}
        <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{surveyForm.title || 'Título do Questionário'}</h1>
            {surveyForm.description && (
              <p className="text-gray-600 mb-8">{surveyForm.description}</p>
            )}

            {/* Contact Info Fields */}
            {(surveyForm.collectContactInfo.name || surveyForm.collectContactInfo.email || 
              surveyForm.collectContactInfo.phone || surveyForm.collectContactInfo.newsletter) && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {surveyForm.collectContactInfo.name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  )}
                  {surveyForm.collectContactInfo.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="seu@email.com"
                      />
                    </div>
                  )}
                  {surveyForm.collectContactInfo.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  )}
                  {surveyForm.collectContactInfo.newsletter && (
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">Quero receber novidades por email</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
              {surveyForm.questions.map((question, index) => (
                <div key={question.id} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Questão {question.orderIndex}
                      {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{question.questionText || 'Texto da pergunta'}</p>

                  {question.questionType === 'text' && (
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Digite sua resposta aqui..."
                    />
                  )}

                  {question.questionType === 'multiple_choice' && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label key={option.id} className="flex items-center">
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            className="mr-3"
                          />
                          <span className="text-gray-700">{option.optionText || 'Opção'}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.questionType === 'rating' && (
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <label key={rating} className="flex items-center">
                          <input
                            type="radio"
                            name={`rating_${question.id}`}
                            value={rating}
                            className="mr-1"
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
            <div className="mt-8 text-center">
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium">
                Enviar Respostas
              </button>
            </div>
          </div>
        </main>
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
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePreview}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Visualizar
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 inline mr-2" />
                )}
                {submitting ? 'Criando...' : 'Salvar Questionário'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Survey Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Questionário *
                </label>
                <input
                  type="text"
                  value={surveyForm.title}
                  onChange={(e) => setSurveyForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Pesquisa de Satisfação"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={surveyForm.description}
                  onChange={(e) => setSurveyForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descreva o objetivo deste questionário..."
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={surveyForm.isActive}
                    onChange={(e) => setSurveyForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Ativar questionário imediatamente</span>
                </label>
              </div>
            </div>
          </div>

          {/* Contact Info Collection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Coleta de Informações de Contato</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={surveyForm.collectContactInfo.name}
                  onChange={(e) => setSurveyForm(prev => ({
                    ...prev,
                    collectContactInfo: { ...prev.collectContactInfo, name: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Nome</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={surveyForm.collectContactInfo.email}
                  onChange={(e) => setSurveyForm(prev => ({
                    ...prev,
                    collectContactInfo: { ...prev.collectContactInfo, email: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Email</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={surveyForm.collectContactInfo.phone}
                  onChange={(e) => setSurveyForm(prev => ({
                    ...prev,
                    collectContactInfo: { ...prev.collectContactInfo, phone: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Telefone</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={surveyForm.collectContactInfo.newsletter}
                  onChange={(e) => setSurveyForm(prev => ({
                    ...prev,
                    collectContactInfo: { ...prev.collectContactInfo, newsletter: e.target.checked }
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Newsletter</span>
              </label>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Perguntas</h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => addQuestionWithOptions('text')}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dissertativa
                </button>
                <button
                  type="button"
                  onClick={() => addQuestionWithOptions('multiple_choice')}
                  className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Múltipla Escolha
                </button>
                <button
                  type="button"
                  onClick={() => addQuestionWithOptions('rating')}
                  className="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Avaliação
                </button>
              </div>
            </div>

            {surveyForm.questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhuma pergunta adicionada ainda</p>
                <p className="text-sm mt-2">Escolha o tipo de pergunta para começar</p>
              </div>
            ) : (
              <div className="space-y-6">
                {surveyForm.questions.map((question, index) => (
                  <div key={question.id} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        Questão {question.orderIndex}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Texto da Pergunta *
                        </label>
                        <input
                          type="text"
                          value={question.questionText}
                          onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Digite sua pergunta aqui..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Pergunta *
                        </label>
                        <select
                          value={question.questionType}
                          onChange={(e) => updateQuestion(question.id, { 
                            questionType: e.target.value as 'text' | 'multiple_choice' | 'rating',
                            options: e.target.value === 'multiple_choice' ? question.options : []
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="text">Dissertativa</option>
                          <option value="multiple_choice">Múltipla Escolha</option>
                          <option value="rating">Avaliação (1-5)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={question.isRequired}
                          onChange={(e) => updateQuestion(question.id, { isRequired: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Pergunta obrigatória</span>
                      </label>
                    </div>

                    {/* Options for Multiple Choice */}
                    {question.questionType === 'multiple_choice' && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="text-sm font-medium text-gray-700">Opções de Resposta</h5>
                          <button
                            type="button"
                            onClick={() => addOption(question.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar Opção
                          </button>
                        </div>

                        {question.options.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">Adicione pelo menos 2 opções</p>
                        ) : (
                          <div className="space-y-2">
                            {question.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option.optionText}
                                  onChange={(e) => updateOption(question.id, option.id, { optionText: e.target.value })}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Texto da opção"
                                  required
                                />
                                <input
                                  type="text"
                                  value={option.optionValue}
                                  onChange={(e) => updateOption(question.id, option.id, { optionValue: e.target.value })}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Valor"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => removeOption(question.id, option.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                  disabled={question.options.length <= 2}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}

export default CreateSurvey
