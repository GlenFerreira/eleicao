import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    companyId?: string
  }
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Token de acesso não fornecido' })
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    // Buscar dados do usuário no banco
    const { data: user, error } = await supabase
      .from('raed_users')
      .select('id, email, role, name')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      // Tentar buscar na tabela de company_admins
      const { data: companyAdmin, error: companyError } = await supabase
        .from('company_admins')
        .select('id, email, role, name, company_id')
        .eq('id', decoded.userId)
        .eq('is_active', true)
        .single()

      if (companyError || !companyAdmin) {
        return res.status(401).json({ error: 'Usuário não encontrado ou inativo' })
      }

      req.user = {
        id: companyAdmin.id,
        email: companyAdmin.email,
        role: companyAdmin.role,
        companyId: companyAdmin.company_id
      }
    } else {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      }
    }

    next()
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export default authMiddleware

