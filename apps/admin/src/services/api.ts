const API_BASE_URL = 'http://localhost:3001/api'

// Função auxiliar para fazer requisições HTTP
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken')
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Request Error:', error)
    throw error
  }
}

// Serviços de Questionários
export const surveyService = {
  // Listar questionários
  async getSurveys() {
    return apiRequest('/surveys')
  },

  // Obter questionário específico
  async getSurvey(id: string) {
    return apiRequest(`/surveys/${id}`)
  },

  // Criar questionário
  async createSurvey(surveyData: any) {
    return apiRequest('/surveys', {
      method: 'POST',
      body: JSON.stringify(surveyData)
    })
  },

  // Atualizar questionário
  async updateSurvey(id: string, surveyData: any) {
    return apiRequest(`/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(surveyData)
    })
  },

  // Ativar/Desativar questionário
  async toggleSurvey(id: string) {
    return apiRequest(`/surveys/${id}/toggle`, {
      method: 'PATCH'
    })
  },

  // Deletar questionário
  async deleteSurvey(id: string) {
    return apiRequest(`/surveys/${id}`, {
      method: 'DELETE'
    })
  },

  // Obter respostas de um questionário
  async getSurveyResponses(id: string) {
    return apiRequest(`/surveys/${id}/responses`)
  }
}

// Serviços de Autenticação
export const authService = {
  // Obter perfil do usuário
  async getProfile() {
    return apiRequest('/admin/profile')
  }
}

export default {
  surveyService,
  authService
}
