const API_BASE_URL = `${(import.meta as any).env?.VITE_API_URL || 'https://preview-5pug.onrender.com/api'}/public`

// Função auxiliar para fazer requisições HTTP
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    // Garantir que não há barras duplas na URL
    const url = `${API_BASE_URL}${endpoint}`.replace(/\/+/g, '/').replace(':/', '://')
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Tratamento específico para erro 404 (nenhum questionário encontrado)
      if (response.status === 404) {
        throw new Error('Nenhum questionário ativo encontrado para esta empresa')
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// Serviços de Questionários Públicos
export const publicSurveyService = {
  // Obter questionário por slug da empresa
  async getSurvey(companySlug: string) {
    return apiRequest(`/${companySlug}`)
  },

  // Enviar respostas do questionário
  async submitResponses(companySlug: string, data: any) {
    return apiRequest(`/${companySlug}/responses`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export default {
  publicSurveyService
}
