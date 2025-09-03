import { Router } from 'express'
import { supabase } from '../config/supabase'
import { createError } from '../middleware/errorHandler'

const router = Router()

// Função para classificar tendência política baseada nas respostas
const classifyPoliticalLeaning = (
  federalRating: number | null,
  stateRating: number | null,
  federalIdeology: string | null,
  stateIdeology: string | null
): 'left' | 'center' | 'right' | 'unknown' => {
  const supportThreshold = 7
  const opposeThreshold = 3

  // Se não temos as ideologias configuradas, não podemos classificar
  if (!federalIdeology || !stateIdeology) {
    return 'unknown'
  }

  // Se não temos as notas, não podemos classificar
  if (federalRating === null || stateRating === null) {
    return 'unknown'
  }

  // Determinar apoio/oposição para cada esfera
  const federalSupport = federalRating >= supportThreshold
  const federalOppose = federalRating <= opposeThreshold
  const stateSupport = stateRating >= supportThreshold
  const stateOppose = stateRating <= opposeThreshold

  // Mapear apoio/oposição para ideologia
  const federalLeaning = federalSupport ? federalIdeology : 
                        federalOppose ? (federalIdeology === 'left' ? 'right' : 
                                       federalIdeology === 'right' ? 'left' : 'center') : 'center'

  const stateLeaning = stateSupport ? stateIdeology : 
                      stateOppose ? (stateIdeology === 'left' ? 'right' : 
                                   stateIdeology === 'right' ? 'left' : 'center') : 'center'

  // Se ambas convergem, usar essa tendência
  if (federalLeaning === stateLeaning) {
    return federalLeaning as 'left' | 'center' | 'right'
  }

  // Se divergem, classificar como centro
  return 'center'
}

// Obter analytics de um questionário específico
router.get('/:surveyId', async (req: any, res, next) => {
  try {
    const { surveyId } = req.params
    const { city } = req.query

    console.log('Buscando analytics para survey:', surveyId, 'cidade:', city)

    // Buscar questionário com ideologias
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, title, federal_ideology, state_ideology')
      .eq('id', surveyId)
      .is('deleted_at', null)
      .single()

    if (surveyError || !survey) {
      throw createError('Questionário não encontrado', 404)
    }

    // Buscar respostas com filtro de cidade se especificado
    let responsesQuery = supabase
      .from('survey_responses')
      .select(`
        id,
        city,
        created_at,
        question_answers(
          id,
          question_id,
          answer_text,
          selected_options,
          rating_value,
          questions(
            id,
            question_text,
            question_type,
            order_index
          )
        )
      `)
      .eq('survey_id', surveyId)
      .is('deleted_at', null)

    if (city && city !== 'all') {
      responsesQuery = responsesQuery.eq('city', city)
    }

    const { data: responses, error: responsesError } = await responsesQuery
      .order('created_at', { ascending: false })

    if (responsesError) {
      throw createError('Erro ao buscar respostas', 500)
    }

    console.log(`Encontradas ${responses?.length || 0} respostas`)
    


    // Processar dados para analytics
    const analytics = {
      survey: {
        id: survey.id,
        title: survey.title,
        federalIdeology: survey.federal_ideology,
        stateIdeology: survey.state_ideology
      },
      summary: {
        totalResponses: responses?.length || 0,
        cities: [] as any[],
        politicalLeaning: {
          left: 0,
          center: 0,
          right: 0,
          unknown: 0
        },
        interestAreas: {
          security: 0,
          education: 0,
          health: 0,
          other: 0
        }
      },
      ratings: {
        federal: { average: 0, distribution: [] as any[] },
        state: { average: 0, distribution: [] as any[] },
        city: { average: 0, distribution: [] as any[] }
      },
      multipleChoice: {} as any, // Nova seção para múltipla escolha
      responses: [] as any[]
    }

    if (responses && responses.length > 0) {
      // Agrupar por cidade
      const cityGroups: { [key: string]: any[] } = {}
      const federalRatings: number[] = []
      const stateRatings: number[] = []
      const cityRatings: number[] = []
      const politicalLeanings: { [key: string]: number } = { left: 0, center: 0, right: 0, unknown: 0 }
      const interestAreas: { [key: string]: number } = { security: 0, education: 0, health: 0, other: 0 }
      const multipleChoiceStats: { [questionId: string]: { [optionId: string]: number } } = {}

      responses.forEach(response => {
        // Agrupar por cidade
        const responseCity = response.city || 'Não informado'
        if (!cityGroups[responseCity]) {
          cityGroups[responseCity] = []
        }
        cityGroups[responseCity].push(response)

        // Extrair notas das perguntas (assumindo ordem: federal, state, city, interest, open)
        let federalRating: number | null = null
        let stateRating: number | null = null
        let cityRating: number | null = null
        let interestAnswer: string | null = null

        if (response.question_answers && Array.isArray(response.question_answers)) {
          response.question_answers.forEach((qa: any) => {
            if (qa.questions && qa.questions.order_index) {

              
              // Processar perguntas de múltipla escolha
              if (qa.questions.question_type === 'multiple_choice') {
                const questionId = qa.question_id
                if (!multipleChoiceStats[questionId]) {
                  multipleChoiceStats[questionId] = {}
                }
                
                // Processar respostas corretas (selected_options)
                if (qa.selected_options && Array.isArray(qa.selected_options)) {
                  qa.selected_options.forEach((optionId: string) => {
                    multipleChoiceStats[questionId][optionId] = (multipleChoiceStats[questionId][optionId] || 0) + 1
                  })
                }
                // Processar respostas incorretas (answer_text) - fallback para dados antigos
                else if (qa.answer_text && !qa.selected_options) {
                  const optionId = qa.answer_text
                  multipleChoiceStats[questionId][optionId] = (multipleChoiceStats[questionId][optionId] || 0) + 1
                }
              }

              switch (qa.questions.order_index) {
                case 1: // Federal
                  federalRating = qa.rating_value || (qa.answer_text ? parseInt(qa.answer_text) : null)
                  break
                case 2: // State
                  stateRating = qa.rating_value || (qa.answer_text ? parseInt(qa.answer_text) : null)
                  break
                case 3: // City
                  cityRating = qa.rating_value || (qa.answer_text ? parseInt(qa.answer_text) : null)
                  break
                case 4: // Interest
                  interestAnswer = qa.answer_text || null
                  break
              }
            }
          })
        }

        // Classificar tendência política
        const leaning = classifyPoliticalLeaning(
          federalRating,
          stateRating,
          survey.federal_ideology,
          survey.state_ideology
        )
        politicalLeanings[leaning]++

        // Coletar notas
        if (federalRating !== null) federalRatings.push(federalRating)
        if (stateRating !== null) stateRatings.push(stateRating)
        if (cityRating !== null) cityRatings.push(cityRating)

        // Classificar área de interesse
        if (interestAnswer) {
          const interest = String(interestAnswer).toLowerCase()
          // Normalizar texto removendo acentos e caracteres especiais
          const normalizedInterest = interest
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z\s]/g, '')
            .trim()
          
          console.log('Classificando interesse:', interest, '-> normalizado:', normalizedInterest)
          
          // Verificar se contém palavras-chave (mais flexível)
          const isSecurity = normalizedInterest.includes('seguranca') || 
                           normalizedInterest.includes('security') ||
                           normalizedInterest.includes('policia') ||
                           normalizedInterest.includes('crime')
          
          const isEducation = normalizedInterest.includes('educacao') || 
                            normalizedInterest.includes('education') ||
                            normalizedInterest.includes('escola') ||
                            normalizedInterest.includes('ensino') ||
                            normalizedInterest.includes('professor')
          
          const isHealth = normalizedInterest.includes('saude') || 
                         normalizedInterest.includes('health') ||
                         normalizedInterest.includes('hospital') ||
                         normalizedInterest.includes('medico') ||
                         normalizedInterest.includes('medicina')
          
          if (isSecurity) {
            interestAreas.security++
            console.log('Categorizado como SEGURANÇA:', interest)
          } else if (isEducation) {
            interestAreas.education++
            console.log('Categorizado como EDUCAÇÃO:', interest)
          } else if (isHealth) {
            interestAreas.health++
            console.log('Categorizado como SAÚDE:', interest)
          } else {
            interestAreas.other++
            console.log('Categorizado como OUTROS:', interest, '(normalizado:', normalizedInterest, ')')
          }
        }

        // Adicionar resposta processada
        analytics.responses.push({
          id: response.id,
          city: responseCity,
          createdAt: response.created_at,
          federalRating,
          stateRating,
          cityRating,
          interestAnswer,
          politicalLeaning: leaning
        })
      })

      // Calcular estatísticas por cidade
      analytics.summary.cities = Object.entries(cityGroups).map(([cityName, cityResponses]) => {
        const cityFederalRatings = cityResponses
          .map(r => analytics.responses.find(resp => resp.id === r.id)?.federalRating)
          .filter(r => r !== null) as number[]
        
        const cityStateRatings = cityResponses
          .map(r => analytics.responses.find(resp => resp.id === r.id)?.stateRating)
          .filter(r => r !== null) as number[]

        const cityPoliticalLeanings = cityResponses
          .map(r => analytics.responses.find(resp => resp.id === r.id)?.politicalLeaning)
          .reduce((acc: { [key: string]: number }, leaning) => {
            if (leaning) {
              acc[leaning] = (acc[leaning] || 0) + 1
            }
            return acc
          }, {})

        return {
          name: cityName,
          totalResponses: cityResponses.length,
          averageFederalRating: cityFederalRatings.length > 0 
            ? cityFederalRatings.reduce((a, b) => a + b, 0) / cityFederalRatings.length 
            : 0,
          averageStateRating: cityStateRatings.length > 0 
            ? cityStateRatings.reduce((a, b) => a + b, 0) / cityStateRatings.length 
            : 0,
          politicalLeaning: cityPoliticalLeanings as { [key: string]: number }
        }
      })

      // Calcular médias gerais
      analytics.ratings.federal.average = federalRatings.length > 0 
        ? federalRatings.reduce((a, b) => a + b, 0) / federalRatings.length 
        : 0
      analytics.ratings.state.average = stateRatings.length > 0 
        ? stateRatings.reduce((a, b) => a + b, 0) / stateRatings.length 
        : 0
      analytics.ratings.city.average = cityRatings.length > 0 
        ? cityRatings.reduce((a, b) => a + b, 0) / cityRatings.length 
        : 0

      // Distribuição das notas (0-10)
      const createDistribution = (ratings: number[]) => {
        const dist = Array(11).fill(0) // 0 a 10
        ratings.forEach(rating => {
          if (rating >= 0 && rating <= 10) {
            dist[Math.round(rating)]++
          }
        })
        return dist.map((count, rating) => ({ rating, count }))
      }

      analytics.ratings.federal.distribution = createDistribution(federalRatings)
      analytics.ratings.state.distribution = createDistribution(stateRatings)
      analytics.ratings.city.distribution = createDistribution(cityRatings)

      // Processar estatísticas de múltipla escolha
      analytics.multipleChoice = {}
      for (const [questionId, optionStats] of Object.entries(multipleChoiceStats)) {
        // Buscar informações da pergunta
        const questionInfo = responses[0]?.question_answers?.find((qa: any) => 
          qa.question_id === questionId
        )?.questions

        if (questionInfo) {
          // Buscar opções da pergunta para obter os textos
          const { data: questionOptions, error: optionsError } = await supabase
            .from('question_options')
            .select('option_text, option_value')
            .eq('question_id', questionId)
            .order('order_index')
          
          const optionsMap: { [key: string]: string } = {}
          if (questionOptions) {
            questionOptions.forEach((opt: any) => {
              optionsMap[opt.option_value] = opt.option_text
            })
          }

          analytics.multipleChoice[questionId] = {
            questionText: (questionInfo as any).question_text,
            questionOrder: (questionInfo as any).order_index,
            totalResponses: Object.values(optionStats).reduce((sum: number, count: number) => sum + count, 0),
            options: Object.entries(optionStats).map(([optionId, count]) => ({
              optionId,
              optionText: optionsMap[optionId] || `Opção ${optionId}`,
              count,
              percentage: Math.round((count / Object.values(optionStats).reduce((sum: number, c: number) => sum + c, 0)) * 100)
            })).sort((a, b) => b.count - a.count) // Ordenar por mais escolhida
          }
        }
      }





      // Atualizar resumos
      analytics.summary.politicalLeaning = politicalLeanings as any
      analytics.summary.interestAreas = interestAreas as any
    }

    res.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    next(error)
  }
})

// Endpoint temporário para debug das respostas
router.get('/debug/:surveyId', async (req: any, res, next) => {
  try {
    const { surveyId } = req.params

    // Buscar respostas com todas as informações
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select(`
        id,
        city,
        created_at,
        question_answers(
          id,
          question_id,
          answer_text,
          selected_options,
          rating_value,
          questions(
            id,
            question_text,
            question_type,
            order_index
          )
        )
      `)
      .eq('survey_id', surveyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (responsesError) {
      throw createError('Erro ao buscar respostas', 500)
    }

    // Processar para mostrar as respostas de interesse
    const debugData = responses?.map(response => {
      let interestAnswer = null
      
      if (response.question_answers && Array.isArray(response.question_answers)) {
        response.question_answers.forEach((qa: any) => {
          if (qa.questions && qa.questions.order_index === 4) { // Interest question
            interestAnswer = qa.answer_text
          }
        })
      }

      return {
        id: response.id,
        city: response.city,
        createdAt: response.created_at,
        interestAnswer: interestAnswer,
        allAnswers: response.question_answers?.map((qa: any) => ({
          order: qa.questions?.order_index,
          question: qa.questions?.question_text,
          answer: qa.answer_text,
          rating: qa.rating_value
        }))
      }
    }) || []

    res.json({
      success: true,
      data: {
        surveyId,
        totalResponses: debugData.length,
        responses: debugData
      }
    })

  } catch (error) {
    next(error)
  }
})

export default router
