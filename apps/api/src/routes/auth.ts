import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase'
import { createError } from '../middleware/errorHandler'

const router = Router()

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw createError('Email e senha são obrigatórios', 400)
    }

    // Primeiro, tentar encontrar na tabela raed_users
    let { data: raedUser, error: raedError } = await supabase
      .from('raed_users')
      .select('id, email, password_hash, name, role, is_active')
      .eq('email', email)
      .single()

    let user = raedUser
    let userType = 'raed'

    // Se não encontrar, tentar na tabela company_admins
    if (raedError || !raedUser) {
      const { data: companyAdmin, error: companyError } = await supabase
        .from('company_admins')
        .select('id, email, password_hash, name, role, is_active, company_id')
        .eq('email', email)
        .single()

      if (companyError || !companyAdmin) {
        throw createError('Usuário não encontrado', 404)
      }

      user = companyAdmin
      userType = 'company'
    }

    // Verificar se o usuário está ativo
    if (!user || !user.is_active) {
      throw createError('Conta desativada', 403)
    }

    // Verificar senha (por enquanto, comparar diretamente para teste)
    // Em produção, usar bcrypt.compare(password, user.password_hash)
    if (password !== '123456') { // Temporário para teste
      throw createError('Senha incorreta', 401)
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        userType,
        companyId: (user as any).company_id
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    // Retornar dados do usuário e token
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType,
          companyId: (user as any).company_id
        },
        token
      }
    })

  } catch (error) {
    next(error)
  }
})

// Verificar token
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      throw createError('Token não fornecido', 401)
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (!decoded) {
      throw createError('Token inválido', 401)
    }

    res.json({
      success: true,
      data: {
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          userType: decoded.userType,
          companyId: decoded.companyId
        }
      }
    })

  } catch (error) {
    next(error)
  }
})

// Logout (opcional, pois JWT é stateless)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  })
})

export default router

