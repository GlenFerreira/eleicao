import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import surveyRoutes from './routes/surveys.js'
import publicRoutes from './routes/public.js'
import analyticsRoutes from './routes/analytics.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authMiddleware } from './middleware/auth.js'

// Carregar .env da raiz do projeto (ES modules)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Carregar .env da raiz do monorepo (apps/api/src -> raiz: ../../../.env)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const app = express()
const PORT = process.env.PORT || 3001

// Middleware de segurança
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:3002',
    'http://localhost:3003',
    // Produção - Admin
    'https://eleicao.onrender.com',
    // Produção - Web (questionário público)
    'https://surv-rkzx.onrender.com',
    // Produção - Web alternativo (se existir)
    'https://eleicao-web.onrender.com'
  ],
  credentials: true
}))

// Middleware para parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rotas públicas
app.use('/api/auth', authRoutes)
app.use('/api/public', publicRoutes)

// Rotas protegidas
app.use('/api/admin', authMiddleware, adminRoutes)
app.use('/api/surveys', surveyRoutes) // Removido authMiddleware temporariamente
app.use('/api/analytics', analyticsRoutes) // Removido authMiddleware temporariamente

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Raed SaaS API está funcionando!'
  })
})

// Middleware de erro
app.use(errorHandler)

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📱 API disponível em: http://localhost:${PORT}`)
  console.log(`🔒 Modo: ${process.env.NODE_ENV || 'development'}`)
})

export default app
