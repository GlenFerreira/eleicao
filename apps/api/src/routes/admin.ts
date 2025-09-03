import { Router } from 'express'
import { supabase } from '../config/supabase'
import { createError } from '../middleware/errorHandler'

const router = Router()

// Rota para obter dados do usuário logado
router.get('/profile', async (req: any, res, next) => {
  try {
    const userId = req.user.id
    const userType = req.user.role === 'global_admin' ? 'raed' : 'company'

    if (userType === 'raed') {
      // Buscar dados do usuário Raed
      const { data: user, error } = await supabase
        .from('raed_users')
        .select('id, email, name, role, is_active, created_at')
        .eq('id', userId)
        .single()

      if (error || !user) {
        throw createError('Usuário não encontrado', 404)
      }

      res.json({
        success: true,
        data: { user, userType }
      })
    } else {
      // Buscar dados do company admin
      const { data: user, error } = await supabase
        .from('company_admins')
        .select(`
          id, 
          email, 
          name, 
          role, 
          is_active, 
          created_at,
          company_id,
          companies!inner(name)
        `)
        .eq('id', userId)
        .single()

      if (error || !user) {
        throw createError('Usuário não encontrado', 404)
      }

      res.json({
        success: true,
        data: { user, userType }
      })
    }

  } catch (error) {
    next(error)
  }
})

// Rota para Raed Global Admin - Listar todas as empresas
router.get('/companies', async (req: any, res, next) => {
  try {
    // Verificar se é Raed Global Admin
    if (req.user.role !== 'global_admin') {
      throw createError('Acesso negado. Apenas Raed Global Admin.', 403)
    }

    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, created_at, updated_at')
      .is('deleted_at', null)
      .order('name')

    if (error) {
      throw createError('Erro ao buscar empresas', 500)
    }

    res.json({
      success: true,
      data: { companies }
    })

  } catch (error) {
    next(error)
  }
})

// Rota para Company Admin - Obter dados da empresa
router.get('/company', async (req: any, res, next) => {
  try {
    // Verificar se é Company Admin
    if (req.user.role !== 'company_admin') {
      throw createError('Acesso negado. Apenas Company Admin.', 403)
    }

    const companyId = req.user.companyId

    const { data: company, error } = await supabase
      .from('companies')
      .select('id, name, created_at, updated_at')
      .eq('id', companyId)
      .is('deleted_at', null)
      .single()

    if (error || !company) {
      throw createError('Empresa não encontrada', 404)
    }

    res.json({
      success: true,
      data: { company }
    })

  } catch (error) {
    next(error)
  }
})

export default router

