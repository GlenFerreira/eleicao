import { Router } from 'express'
import { supabase } from '../config/supabase'
import { createError } from '../middleware/errorHandler'

const router = Router()

// Listar questionários da empresa do usuário logado
router.get('/', async (req: any, res, next) => {
  try {
    console.log('Iniciando busca de questionários...')
    
    // Teste simples primeiro - apenas verificar se conseguimos conectar
    const { data: testData, error: testError } = await supabase
      .from('surveys')
      .select('id, title')
      .limit(1)
    
    if (testError) {
      console.error('Erro no teste simples:', testError)
      throw createError(`Erro de conexão: ${testError.message}`, 500)
    }
    
    console.log('Teste de conexão bem-sucedido, dados:', testData)
    
    // Buscar o ID da empresa PSB
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'PSB')
      .is('deleted_at', null)
      .single()

    if (companyError || !company) {
      console.error('Erro ao buscar empresa PSB:', companyError)
      throw createError('Empresa PSB não encontrada', 404)
    }

    const companyId = company.id
    console.log('Company ID encontrado:', companyId)
    
    // Agora buscar questionários da empresa PSB
    const { data: surveys, error: surveysError } = await supabase
      .from('surveys')
      .select(`
        id,
        title,
        description,
        is_active,
        created_at,
        updated_at,
        company_id,
        companies!inner(name)
      `)
      .eq('company_id', companyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (surveysError) {
      console.error('Erro Supabase:', surveysError)
      throw createError(`Erro ao buscar questionários: ${surveysError.message}`, 500)
    }

    console.log(`Encontrados ${surveys?.length || 0} questionários`)

    // Buscar contagens reais para cada questionário
    const processedSurveys = await Promise.all(
      surveys?.map(async (survey) => {
        // Contar perguntas
        const { count: questionsCount } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('survey_id', survey.id)
          .is('deleted_at', null)

        // Contar respostas
        const { count: responsesCount } = await supabase
          .from('survey_responses')
          .select('*', { count: 'exact', head: true })
          .eq('survey_id', survey.id)
          .is('deleted_at', null)

        return {
          id: survey.id,
          title: survey.title,
          description: survey.description,
          isActive: survey.is_active,
          createdAt: survey.created_at,
          updatedAt: survey.updated_at,
          questionsCount: questionsCount || 0,
          responsesCount: responsesCount || 0,
          collectContactInfo: {}, // Valor padrão vazio
          companyId: survey.company_id,
          companyName: (survey as any).companies?.name || 'PSB' // Nome da empresa
        }
      }) || []
    )

    res.json({
      success: true,
      data: { surveys: processedSurveys }
    })

  } catch (error) {
    console.error('Erro completo:', error)
    next(error)
  }
})

// Obter um questionário específico com suas perguntas
router.get('/:id', async (req: any, res, next) => {
  try {
    const surveyId = req.params.id
    const userId = req.user.id
    const userType = req.user.role

    if (userType !== 'company_admin') {
      throw createError('Acesso negado. Apenas Company Admin.', 403)
    }

    // Verificar se o questionário pertence à empresa do usuário
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select(`
        id,
        title,
        description,
        is_active,
        collect_contact_info,
        company_id,
        created_at,
        updated_at
      `)
      .eq('id', surveyId)
      .is('deleted_at', null)
      .single()

    if (surveyError || !survey) {
      throw createError('Questionário não encontrado', 404)
    }

    // Verificar se o usuário tem acesso a este questionário
    const { data: companyAdmin, error: companyError } = await supabase
      .from('company_admins')
      .select('company_id')
      .eq('id', userId)
      .single()

    if (companyError || companyAdmin?.company_id !== survey.company_id) {
      throw createError('Acesso negado a este questionário', 403)
    }

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
          order_index,
          is_correct
        )
      `)
      .eq('survey_id', surveyId)
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
      options: question.question_options?.sort((a, b) => a.order_index - b.order_index) || []
    }))

    res.json({
      success: true,
      data: {
        survey: {
          ...survey,
          questions: processedQuestions
        }
      }
    })

  } catch (error) {
    next(error)
  }
})

// Criar novo questionário
router.post('/', async (req: any, res, next) => {
  try {
    console.log('Recebendo dados para criar questionário:', req.body)
    
    const { title, description, isActive, federalIdeology, stateIdeology, collectContactInfo, questions } = req.body

    if (!title || !questions || !Array.isArray(questions)) {
      throw createError('Dados inválidos', 400)
    }

    // TEMPORÁRIO: Para testes, usar company_id fixo da PSB
    // TODO: Restaurar autenticação quando implementar login
    
    // Buscar o ID da empresa PSB
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'PSB')
      .is('deleted_at', null)
      .single()

    if (companyError || !company) {
      console.error('Erro ao buscar empresa PSB:', companyError)
      throw createError('Empresa PSB não encontrada', 404)
    }

    const companyId = company.id
    console.log('Company ID encontrado:', companyId)

    // Inserir questionário
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .insert({
        title,
        description: description || '',
        is_active: isActive !== undefined ? isActive : true,
        federal_ideology: federalIdeology || null,
        state_ideology: stateIdeology || null,
        company_id: companyId
      })
      .select()
      .single()

    if (surveyError) {
      console.error('Erro ao criar questionário:', surveyError)
      throw createError(`Erro ao criar questionário: ${surveyError.message}`, 500)
    }

    console.log('Questionário criado:', survey)

    // Inserir perguntas
    const questionsToInsert = questions.map((q: any, index: number) => ({
      survey_id: survey.id,
      question_text: q.questionText,
      question_type: q.questionType,
      is_required: q.isRequired || false,
      order_index: q.orderIndex || index + 1
    }))

    console.log('Perguntas para inserir:', questionsToInsert)

    const { data: insertedQuestions, error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select()

    if (questionsError) {
      console.error('Erro ao criar perguntas:', questionsError)
      throw createError(`Erro ao criar perguntas: ${questionsError.message}`, 500)
    }

    console.log('Perguntas criadas:', insertedQuestions)

    // Inserir opções para perguntas de múltipla escolha
    const optionsToInsert: any[] = []
    questions.forEach((q: any, qIndex: number) => {
      if (q.questionType === 'multiple_choice' && q.options && Array.isArray(q.options)) {
        q.options.forEach((opt: any, optIndex: number) => {
          optionsToInsert.push({
            question_id: insertedQuestions[qIndex].id,
            option_text: opt.optionText,
            option_value: opt.optionValue,
            order_index: opt.orderIndex || optIndex + 1,
            is_correct: opt.isCorrect || false
          })
        })
      }
    })

    if (optionsToInsert.length > 0) {
      console.log('Opções para inserir:', optionsToInsert)
      
      const { error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsToInsert)

      if (optionsError) {
        console.error('Erro ao criar opções:', optionsError)
        throw createError(`Erro ao criar opções das perguntas: ${optionsError.message}`, 500)
      }
      
      console.log('Opções criadas com sucesso')
    }

    res.status(201).json({
      success: true,
      data: { 
        survey: {
          ...survey,
          questions: insertedQuestions
        }
      },
      message: 'Questionário criado com sucesso'
    })

  } catch (error) {
    console.error('Erro completo ao criar questionário:', error)
    next(error)
  }
})

// Atualizar questionário
router.put('/:id', async (req: any, res, next) => {
  try {
    const surveyId = req.params.id
    const userId = req.user.id
    const userType = req.user.role

    if (userType !== 'company_admin') {
      throw createError('Acesso negado. Apenas Company Admin.', 403)
    }

    const { title, description, isActive, collectContactInfo, questions } = req.body

    // Verificar se o questionário pertence à empresa do usuário
    const { data: existingSurvey, error: surveyError } = await supabase
      .from('surveys')
      .select('company_id')
      .eq('id', surveyId)
      .is('deleted_at', null)
      .single()

    if (surveyError || !existingSurvey) {
      throw createError('Questionário não encontrado', 404)
    }

    // Verificar se o usuário tem acesso a este questionário
    const { data: companyAdmin, error: companyError } = await supabase
      .from('company_admins')
      .select('company_id')
      .eq('id', userId)
      .single()

    if (companyError || companyAdmin?.company_id !== existingSurvey.company_id) {
      throw createError('Acesso negado a este questionário', 403)
    }

    // Atualizar questionário
    const { data: updatedSurvey, error: updateError } = await supabase
      .from('surveys')
      .update({
        title,
        description,
        is_active: isActive,
        collect_contact_info: collectContactInfo,
        updated_at: new Date().toISOString()
      })
      .eq('id', surveyId)
      .select()
      .single()

    if (updateError) {
      throw createError('Erro ao atualizar questionário', 500)
    }

    // Se houver perguntas, atualizar também
    if (questions && Array.isArray(questions)) {
      // Deletar perguntas existentes (soft delete)
      await supabase
        .from('questions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('survey_id', surveyId)

      // Inserir novas perguntas
      const questionsToInsert = questions.map((q: any, index: number) => ({
        survey_id: surveyId,
        question_text: q.questionText,
        question_type: q.questionType,
        is_required: q.isRequired || false,
        order_index: q.orderIndex || index + 1
      }))

      const { data: insertedQuestions, error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select()

      if (questionsError) {
        throw createError('Erro ao atualizar perguntas', 500)
      }

      // Inserir opções para perguntas de múltipla escolha
      const optionsToInsert: any[] = []
      questions.forEach((q: any, qIndex: number) => {
        if (q.questionType === 'multiple_choice' && q.options && Array.isArray(q.options)) {
          q.options.forEach((opt: any, optIndex: number) => {
            optionsToInsert.push({
              question_id: insertedQuestions[qIndex].id,
              option_text: opt.optionText,
              option_value: opt.optionValue,
              order_index: opt.orderIndex || optIndex + 1,
              is_correct: opt.isCorrect || false
            })
          })
        }
      })

      if (optionsToInsert.length > 0) {
        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(optionsToInsert)

        if (optionsError) {
          throw createError('Erro ao atualizar opções das perguntas', 500)
        }
      }
    }

    res.json({
      success: true,
      data: { survey: updatedSurvey },
      message: 'Questionário atualizado com sucesso'
    })

  } catch (error) {
    next(error)
  }
})

// Ativar/Desativar questionário
router.patch('/:id/toggle', async (req: any, res, next) => {
  try {
    const surveyId = req.params.id
    
    // TEMPORÁRIO: Para testes, remover verificação de autenticação
    // TODO: Restaurar autenticação quando implementar login

    // Verificar se o questionário existe
    const { data: existingSurvey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, is_active')
      .eq('id', surveyId)
      .is('deleted_at', null)
      .single()

    if (surveyError || !existingSurvey) {
      throw createError('Questionário não encontrado', 404)
    }

    // TEMPORÁRIO: Para testes, permitir alteração de qualquer questionário
    // TODO: Restaurar verificação de permissões quando implementar login

    // Alternar status
    const newStatus = !existingSurvey.is_active

    const { data: updatedSurvey, error: updateError } = await supabase
      .from('surveys')
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', surveyId)
      .select()
      .single()

    if (updateError) {
      throw createError('Erro ao atualizar status do questionário', 500)
    }

    res.json({
      success: true,
      data: { survey: updatedSurvey },
      message: `Questionário ${newStatus ? 'ativado' : 'desativado'} com sucesso`
    })

  } catch (error) {
    next(error)
  }
})

// Deletar questionário (soft delete)
router.delete('/:id', async (req: any, res, next) => {
  try {
    const surveyId = req.params.id
    
    // TEMPORÁRIO: Para testes, remover verificação de autenticação
    // TODO: Restaurar autenticação quando implementar login
    
    // Verificar se o questionário existe
    const { data: existingSurvey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, company_id')
      .eq('id', surveyId)
      .is('deleted_at', null)
      .single()

    if (surveyError || !existingSurvey) {
      throw createError('Questionário não encontrado', 404)
    }

    // TEMPORÁRIO: Para testes, permitir exclusão de qualquer questionário
    // TODO: Restaurar verificação de permissões quando implementar login

    // Soft delete do questionário
    const { error: deleteError } = await supabase
      .from('surveys')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', surveyId)

    if (deleteError) {
      throw createError('Erro ao deletar questionário', 500)
    }

    // Soft delete das perguntas relacionadas
    const { error: questionsDeleteError } = await supabase
      .from('questions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('survey_id', surveyId)

    if (questionsDeleteError) {
      console.warn('Aviso: Erro ao deletar perguntas relacionadas:', questionsDeleteError)
      // Não falhar se não conseguir deletar as perguntas
    }

    // Soft delete das opções relacionadas (via perguntas)
    // Primeiro buscar os IDs das perguntas
    const { data: questionIds, error: questionIdsError } = await supabase
      .from('questions')
      .select('id')
      .eq('survey_id', surveyId)
      .is('deleted_at', null)

    if (questionIdsError) {
      console.warn('Aviso: Erro ao buscar IDs das perguntas:', questionIdsError)
    } else if (questionIds && questionIds.length > 0) {
      const questionIdArray = questionIds.map(q => q.id)
      
      const { error: optionsDeleteError } = await supabase
        .from('question_options')
        .update({ deleted_at: new Date().toISOString() })
        .in('question_id', questionIdArray)

      if (optionsDeleteError) {
        console.warn('Aviso: Erro ao deletar opções relacionadas:', optionsDeleteError)
        // Não falhar se não conseguir deletar as opções
      }
    }

    res.json({
      success: true,
      message: 'Questionário deletado com sucesso'
    })

  } catch (error) {
    next(error)
  }
})

// Obter respostas de um questionário específico
router.get('/:id/responses', async (req: any, res, next) => {
  try {
    const surveyId = req.params.id
    
    // TEMPORÁRIO: Para testes, remover verificação de autenticação
    // TODO: Restaurar autenticação quando implementar login

    // Verificar se o questionário existe
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, title, company_id')
      .eq('id', surveyId)
      .is('deleted_at', null)
      .single()

    if (surveyError || !survey) {
      throw createError('Questionário não encontrado', 404)
    }

    // TEMPORÁRIO: Para testes, permitir acesso a qualquer questionário
    // TODO: Restaurar verificação de permissões quando implementar login

    // Buscar respostas do questionário
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select(`
        id,
        created_at,
        completed_at,
        contact_name,
        contact_email,
        contact_phone,
        wants_newsletter,
        city,
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

    // Processar respostas para um formato mais amigável
    const processedResponses = responses?.map(response => {
      const answers: any[] = []
      
      // Adicionar informações de contato
      if (response.contact_name || response.contact_email || response.contact_phone) {
        answers.push({
          id: 'contact_info',
          questionId: 'contact_info',
          questionText: 'Informações de Contato',
          questionType: 'contact',
          questionOrder: 1,
          answerText: `Nome: ${response.contact_name || 'N/A'}, Email: ${response.contact_email || 'N/A'}, Telefone: ${response.contact_phone || 'N/A'}, Newsletter: ${response.wants_newsletter ? 'Sim' : 'Não'}`
        })
      }

      // Adicionar cidade
      if (response.city) {
        answers.push({
          id: 'city_info',
          questionId: 'city_info',
          questionText: 'Cidade',
          questionType: 'text',
          questionOrder: 2,
          answerText: response.city
        })
      }
      
      // Adicionar respostas das perguntas da nova estrutura
      if (response.question_answers && Array.isArray(response.question_answers)) {
        response.question_answers.forEach((qa: any) => {
          if (qa.questions) {
            let answerText = ''
            
            if (qa.answer_text) {
              answerText = qa.answer_text
            } else if (qa.selected_options && Array.isArray(qa.selected_options)) {
              answerText = qa.selected_options.join(', ')
            } else if (qa.rating_value !== null) {
              answerText = qa.rating_value.toString()
            }
            
            if (answerText) {
              answers.push({
                id: qa.id,
                questionId: qa.question_id,
                questionText: qa.questions.question_text,
                questionType: qa.questions.question_type,
                questionOrder: qa.questions.order_index,
                answerText: answerText
              })
            }
          }
        })
      }
      
      return {
        id: response.id,
        submittedAt: response.completed_at || response.created_at,
        answers: answers.sort((a: any, b: any) => a.questionOrder - b.questionOrder)
      }
    }) || []

    res.json({
      success: true,
      data: {
        survey: {
          id: survey.id,
          title: survey.title,
          companyId: survey.company_id
        },
        responses: processedResponses,
        totalResponses: processedResponses.length
      }
    })

  } catch (error) {
    next(error)
  }
})

// Excluir todas as respostas de um questionário
router.delete('/:id/responses', async (req: any, res, next) => {
  try {
    const { id: surveyId } = req.params

    // Verificar se o questionário existe
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id, title')
      .eq('id', surveyId)
      .is('deleted_at', null)
      .single()

    if (surveyError || !survey) {
      throw createError('Questionário não encontrado', 404)
    }

    // Buscar todas as respostas do questionário
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('survey_id', surveyId)
      .is('deleted_at', null)

    if (responsesError) {
      throw createError('Erro ao buscar respostas', 500)
    }

    if (!responses || responses.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhuma resposta encontrada para excluir',
        deletedCount: 0
      })
    }

    // Excluir todas as respostas das perguntas primeiro
    const responseIds = responses.map(r => r.id)
    const { error: answersError } = await supabase
      .from('question_answers')
      .delete()
      .in('survey_response_id', responseIds)

    if (answersError) {
      throw createError('Erro ao excluir respostas das perguntas', 500)
    }

    // Excluir as respostas do questionário
    const { error: deleteError } = await supabase
      .from('survey_responses')
      .delete()
      .eq('survey_id', surveyId)

    if (deleteError) {
      throw createError('Erro ao excluir respostas do questionário', 500)
    }

    res.json({
      success: true,
      message: `${responses.length} respostas excluídas com sucesso`,
      deletedCount: responses.length
    })

  } catch (error) {
    next(error)
  }
})

export default router
