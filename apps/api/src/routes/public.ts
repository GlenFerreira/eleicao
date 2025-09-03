import { Router } from 'express'
import { supabase } from '../config/supabase'
import { createError } from '../middleware/errorHandler'

const router = Router()

// Endpoint temporário para verificar se as tabelas existem
router.get('/check-tables', async (req, res, next) => {
  try {
    console.log('Verificando se as tabelas existem...')
    
    // Verificar se a tabela survey_responses existe
    const { data: responsesTable, error: responsesError } = await supabase
      .from('survey_responses')
      .select('id')
      .limit(1)
    
    console.log('Verificação da tabela survey_responses:', { responsesTable, responsesError })
    
    // Verificar se a tabela question_answers existe
    const { data: answersTable, error: answersError } = await supabase
      .from('question_answers')
      .select('id')
      .limit(1)
    
    console.log('Verificação da tabela question_answers:', { answersTable, answersError })
    
    res.json({
      success: true,
      data: {
        survey_responses: {
          exists: !responsesError,
          error: responsesError?.message || null
        },
        question_answers: {
          exists: !answersError,
          error: answersError?.message || null
        }
      }
    })
    
  } catch (error) {
    next(error)
  }
})

// Obter questionário público por slug da empresa
router.get('/:companySlug', async (req, res, next) => {
  try {
    const { companySlug } = req.params
    console.log('API Pública: Buscando questionário para empresa:', companySlug)

    if (!companySlug) {
      throw createError('Slug da empresa é obrigatório', 400)
    }

    // Buscar empresa pelo slug (assumindo que temos um campo slug ou name)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('name', companySlug) // TODO: Adicionar campo slug na tabela companies
      .is('deleted_at', null)
      .single()

    console.log('Resultado da busca por empresa:', { company, companyError })

    if (companyError || !company) {
      console.error('Erro ao buscar empresa:', companyError)
      throw createError('Empresa não encontrada', 404)
    }

    console.log('Empresa encontrada:', company)

    // Buscar questionário ativo da empresa - VERSÃO CORRIGIDA
    // Buscar o questionário mais recente (mais recentemente criado)
    const { data: surveys, error: surveysError } = await supabase
      .from('surveys')
      .select('*')
      .eq('company_id', company.id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)

    console.log('Resultado da busca por questionários:', { surveys, surveysError })
    console.log('Query executada para company_id:', company.id)

    if (surveysError || !surveys || surveys.length === 0) {
      console.error('Erro ao buscar questionário:', surveysError)
      throw createError('Nenhum questionário ativo encontrado para esta empresa', 404)
    }

    const survey = surveys[0] // Pegar o primeiro (mais recente)

    console.log('Questionário encontrado:', survey)

    // Buscar perguntas do questionário
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        question_type,
        is_required,
        order_index,
        question_options(
          id,
          option_text,
          option_value,
          order_index
        )
      `)
      .eq('survey_id', survey.id)
      .is('deleted_at', null)
      .order('order_index')

    if (questionsError) {
      throw createError('Erro ao buscar perguntas', 500)
    }

    // Processar perguntas para incluir opções ordenadas
    const processedQuestions = questions.map(question => ({
      id: question.id,
      questionText: question.question_text,
      questionType: question.question_type,
      isRequired: question.is_required,
      orderIndex: question.order_index,
      options: question.question_options?.map(opt => ({
        id: opt.id,
        optionText: opt.option_text,
        optionValue: opt.option_value,
        orderIndex: opt.order_index
      })).sort((a, b) => a.orderIndex - b.orderIndex) || []
    }))

    res.json({
      success: true,
      data: {
        survey: {
          ...survey,
          companyName: company.name,
          questions: processedQuestions
        }
      }
    })

  } catch (error) {
    next(error)
  }
})

// Enviar respostas do questionário
router.post('/:companySlug/responses', async (req, res, next) => {
  try {
    const { companySlug } = req.params
    const { contactInfo, answers, city } = req.body

    console.log('Recebendo respostas para empresa:', companySlug)
    console.log('Dados recebidos:', { contactInfo, answers, city })

    if (!companySlug || !answers || !Array.isArray(answers)) {
      throw createError('Dados inválidos', 400)
    }

    // Buscar empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('name', companySlug)
      .is('deleted_at', null)
      .single()

    console.log('Resultado da busca por empresa:', { company, companyError })

    if (companyError || !company) {
      throw createError('Empresa não encontrada', 404)
    }

    // Buscar questionário ativo
    const { data: surveys, error: surveysError } = await supabase
      .from('surveys')
      .select('id')
      .eq('company_id', company.id)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)

    console.log('Resultado da busca por questionários:', { surveys, surveysError })

    if (surveysError || !surveys || surveys.length === 0) {
      throw createError('Questionário não encontrado', 404)
    }

    const survey = surveys[0] // Pegar o primeiro (mais recente)

    // Criar resposta do questionário
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log('Tentando inserir resposta do questionário:', {
      survey_id: survey.id,
      company_id: company.id,
      session_token: sessionToken,
      city: city
    })

    // Preparar dados para inserção na estrutura normalizada
    const responseData: any = {
      survey_id: survey.id,
      company_id: company.id,
      session_token: sessionToken,
      completed_at: new Date().toISOString(),
      city: city || 'Não informado'
    }

    // Adicionar informações de contato se fornecidas
    if (contactInfo) {
      if (contactInfo.name) responseData.contact_name = contactInfo.name
      if (contactInfo.email) responseData.contact_email = contactInfo.email
      if (contactInfo.phone) responseData.contact_phone = contactInfo.phone
      if (contactInfo.newsletter !== undefined) responseData.wants_newsletter = contactInfo.newsletter
    }

    // Inserir resposta do questionário
    const { data: surveyResponse, error: responseError } = await supabase
      .from('survey_responses')
      .insert(responseData)
      .select()
      .single()

    if (responseError) {
      console.error('Erro ao criar resposta do questionário:', responseError)
      throw createError(`Erro ao salvar resposta do questionário: ${responseError.message}`, 500)
    }

    console.log('Resposta do questionário criada:', surveyResponse)

    // Inserir respostas individuais na tabela question_answers
    const answersToInsert = answers.map((answer: any) => ({
      survey_response_id: surveyResponse.id,
      question_id: answer.questionId,
      answer_text: typeof answer.answer === 'string' ? answer.answer : null,
      selected_options: Array.isArray(answer.answer) ? answer.answer : null,
      rating_value: typeof answer.answer === 'string' && !isNaN(Number(answer.answer)) ? Number(answer.answer) : null
    }))

    console.log('Preparando para inserir respostas individuais:', answersToInsert)

    if (answersToInsert.length > 0) {
      const { data: insertedAnswers, error: answersError } = await supabase
        .from('question_answers')
        .insert(answersToInsert)
        .select()

      if (answersError) {
        console.error('Erro ao inserir respostas individuais:', answersError)
        // Não falhar se não conseguir inserir as respostas individuais
        // A resposta principal já foi salva
      } else {
        console.log('Respostas individuais inseridas com sucesso:', insertedAnswers)
      }
    } else {
      console.log('Nenhuma resposta individual para inserir')
    }
    
    res.status(201).json({
      success: true,
      message: 'Respostas enviadas com sucesso!'
    })

  } catch (error) {
    next(error)
  }
})

export default router
