import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, Users, MapPin, TrendingUp, Filter } from 'lucide-react'
import { analyticsService } from '../services/api'

interface AnalyticsData {
  survey: {
    id: string
    title: string
    federalIdeology: string | null
    stateIdeology: string | null
  }
  summary: {
    totalResponses: number
    cities: Array<{
      name: string
      totalResponses: number
      averageFederalRating: number
      averageStateRating: number
      politicalLeaning: { [key: string]: number }
    }>
    politicalLeaning: {
      left: number
      center: number
      right: number
      unknown: number
    }
    interestAreas: {
      security: number
      education: number
      health: number
      other: number
    }
  }
  ratings: {
    federal: { average: number; distribution: Array<{ rating: number; count: number }> }
    state: { average: number; distribution: Array<{ rating: number; count: number }> }
    city: { average: number; distribution: Array<{ rating: number; count: number }> }
  }
  multipleChoice: {
    [questionId: string]: {
      questionText: string
      questionOrder: number
      totalResponses: number
      options: Array<{
        optionId: string
        count: number
        percentage: number
      }>
    }
  }
  responses: Array<{
    id: string
    city: string
    createdAt: string
    federalRating: number | null
    stateRating: number | null
    cityRating: number | null
    interestAnswer: string | null
    politicalLeaning: string
  }>
}

const SurveyAnalytics: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<string>('all')

  useEffect(() => {
    if (surveyId) {
      loadAnalytics()
    }
  }, [surveyId, selectedCity])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await analyticsService.getSurveyAnalytics(surveyId!, selectedCity)
      
      if (response.success) {
        setAnalytics(response.data)
      } else {
        setError('Erro ao carregar analytics')
      }
    } catch (err: any) {
      console.error('Erro ao carregar analytics:', err)
      setError(err.message || 'Erro ao carregar analytics')
    } finally {
      setLoading(false)
    }
  }

  const getPoliticalLeaningColor = (leaning: string) => {
    switch (leaning) {
      case 'left': return 'text-red-600 bg-red-100'
      case 'right': return 'text-blue-600 bg-blue-100'
      case 'center': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPoliticalLeaningLabel = (leaning: string) => {
    switch (leaning) {
      case 'left': return 'Esquerda'
      case 'right': return 'Direita'
      case 'center': return 'Centro'
      default: return 'Indefinido'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
          <p className="text-gray-600">Não há respostas para este questionário ainda.</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas as cidades</option>
                  {analytics.summary.cities.map(city => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Survey Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{analytics.survey.title}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total de respostas: <strong>{analytics.summary.totalResponses}</strong></span>
            {analytics.survey.federalIdeology && (
              <span>Federal: <strong>{getPoliticalLeaningLabel(analytics.survey.federalIdeology)}</strong></span>
            )}
            {analytics.survey.stateIdeology && (
              <span>Estadual: <strong>{getPoliticalLeaningLabel(analytics.survey.stateIdeology)}</strong></span>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Respostas</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalResponses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Federal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(analytics.ratings.federal.average || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Estadual</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(analytics.ratings.state.average || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Municipal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(analytics.ratings.city.average || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Political Leaning Distribution */}
        <div className="mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendência Política</h3>
            <div className="space-y-3">
              {Object.entries(analytics.summary.politicalLeaning).map(([leaning, count]) => (
                <div key={leaning} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPoliticalLeaningColor(leaning)}`}>
                      {getPoliticalLeaningLabel(leaning)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${analytics.summary.totalResponses > 0 ? (count / analytics.summary.totalResponses) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Multiple Choice Questions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Áreas de Múltipla Escolha</h3>
          
          {Object.keys(analytics.multipleChoice).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(analytics.multipleChoice)
                .sort(([,a], [,b]) => a.questionOrder - b.questionOrder)
                .map(([questionId, questionData]) => (
                <div key={questionId} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    {questionData.questionText}
                  </h4>
                  <div className="space-y-3">
                    {questionData.options.map((option, index) => (
                      <div key={option.optionId} className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <span className={`text-lg font-bold ${
                            index === 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {option.optionText || `Opção ${index + 1}`}
                          </span>
                          {index === 0 && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              🏆 Mais votada
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-40 bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${
                                index === 0 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ 
                                width: `${option.percentage}%` 
                              }}
                            ></div>
                          </div>
                          <span className={`text-sm font-bold w-16 ${
                            index === 0 ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {option.count} ({option.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Total de respostas: {questionData.totalResponses}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pergunta de múltipla escolha</h4>
              <p className="text-gray-500 mb-4">
                Este questionário não possui perguntas de múltipla escolha ou ainda não há respostas.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Dica:</strong> Para ver esta seção, crie perguntas do tipo "Múltipla Escolha" no seu questionário.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cities Breakdown */}
        {analytics.summary.cities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise por Cidade</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Respostas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Federal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estadual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tendência
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.summary.cities.map((city) => (
                    <tr key={city.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {city.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {city.totalResponses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(city.averageFederalRating || 0).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(city.averageStateRating || 0).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-1">
                          {Object.entries(city.politicalLeaning).map(([leaning, count]) => (
                            <span 
                              key={leaning}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getPoliticalLeaningColor(leaning)}`}
                              title={`${getPoliticalLeaningLabel(leaning)}: ${count}`}
                            >
                              {count}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Responses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Respostas Recentes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Federal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estadual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Municipal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tendência
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.responses.slice(0, 10).map((response) => (
                  <tr key={response.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(response.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {response.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {response.federalRating || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {response.stateRating || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {response.cityRating || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPoliticalLeaningColor(response.politicalLeaning)}`}>
                        {getPoliticalLeaningLabel(response.politicalLeaning)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SurveyAnalytics
