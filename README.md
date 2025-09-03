# 🚀 SaaS Raed - Sistema de Questionários

## 📋 Descrição
O SaaS Raed é uma plataforma de questionários onde empresas podem criar pesquisas e usuários respondem sem necessidade de login. O sistema possui três níveis de acesso: Global Admin (Raed), Company Admin e User.

## 🏗️ Arquitetura do Sistema

### Níveis de Acesso
1. **Raed Global Admin** - Controla todas as empresas e admins
2. **Company Admin** - Gerencia questionários de sua empresa
3. **User** - Responde questionários (sem login)

### Fluxo de Funcionamento
```
Raed Global Admin → Cria Empresas → Define Company Admins
Company Admin → Cria Questionários → Gera Links Únicos
User → Acessa Link → Responde → Dados Salvos
```

## 🏢 Estrutura do Projeto (Monorepo)

```
Eleicao/
├── apps/                    # Aplicações principais
│   ├── admin/              # Painel administrativo (React + Vite)
│   ├── api/                # Backend API (Node.js + Express)
│   └── web/                # Aplicação pública (React + Vite)
├── packages/                # Pacotes compartilhados
│   ├── config/             # Configurações compartilhadas
│   ├── database/           # Schemas e migrações
│   ├── ui/                 # Componentes UI compartilhados
│   └── utils/              # Utilitários compartilhados
├── env.corrected            # Variáveis de ambiente
├── package.json             # Dependências raiz
└── turbo.json               # Configuração do Turborepo
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **`companies`**
Armazena as empresas cadastradas no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária única |
| `name` | TEXT | Nome da empresa |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |
| `deleted_at` | TIMESTAMP | Soft delete (NULL = ativo) |

#### 2. **`surveys`**
Questionários criados pelos company admins.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária única |
| `company_id` | UUID | Referência à empresa |
| `title` | TEXT | Título do questionário |
| `description` | TEXT | Descrição opcional |
| `is_active` | BOOLEAN | Se está ativo para respostas |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |
| `deleted_at` | TIMESTAMP | Soft delete (NULL = ativo) |

#### 3. **`questions`**
Perguntas dos questionários com tipos flexíveis.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária única |
| `survey_id` | UUID | Referência ao questionário |
| `question_text` | TEXT | Texto da pergunta |
| `question_type` | TEXT | Tipo (text, multiple_choice, rating) |
| `is_required` | BOOLEAN | Se é obrigatória |
| `order_index` | INTEGER | Ordem das perguntas |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |
| `deleted_at` | TIMESTAMP | Soft delete (NULL = ativa) |

#### 4. **`question_options`**
Opções para perguntas de múltipla escolha.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária única |
| `question_id` | UUID | Referência à pergunta |
| `option_text` | TEXT | Texto da opção |
| `option_value` | TEXT | Valor da opção |
| `order_index` | INTEGER | Ordem da opção |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |
| `deleted_at` | TIMESTAMP | Soft delete (NULL = ativa) |

#### 5. **`survey_responses`**
Respostas dos usuários aos questionários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária única |
| `survey_id` | UUID | Referência ao questionário |
| `company_id` | UUID | Referência à empresa |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |
| `deleted_at` | TIMESTAMP | Soft delete (NULL = ativa) |

#### 6. **`question_answers`**
Respostas específicas para cada pergunta.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária única |
| `survey_response_id` | UUID | Referência à resposta |
| `question_id` | UUID | Referência à pergunta |
| `answer_text` | TEXT | Resposta textual |
| `selected_options` | JSONB | Opções selecionadas |
| `rating_value` | INTEGER | Valor da avaliação |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |
| `deleted_at` | TIMESTAMP | Soft delete (NULL = ativa) |

## 🔗 Relacionamentos

```
companies (1) ←→ (N) surveys
surveys (1) ←→ (N) questions
questions (1) ←→ (N) question_options
surveys (1) ←→ (N) survey_responses
survey_responses (1) ←→ (N) question_answers
```

## 🔐 Políticas de Segurança (RLS)

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Soft Delete** implementado com campo `deleted_at`
- **Autenticação** via Supabase Auth (JWT)
- **Autorização** baseada em roles e company_id

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+
- pnpm
- Supabase CLI (opcional)

### 1. Instalar Dependências
```bash
# Na raiz do projeto
pnpm install
```

### 2. Configurar Variáveis de Ambiente
Criar arquivo `.env` na raiz com:
```env
# Supabase
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# Portas
ADMIN_PORT=3002
WEB_PORT=3003
API_PORT=3001
```

> **⚠️ IMPORTANTE**: O arquivo `.env` já existe na raiz do projeto e contém as configurações reais do Supabase e portas. Este arquivo não é visível nem acessível por questões de segurança (está no .gitignore), mas já está configurado e funcionando.

### 3. Executar Aplicações

#### Backend API
```bash
cd apps/api
npm run dev
# Servidor rodando em http://localhost:3001
```

#### Painel Admin
```bash
cd apps/admin
npm run dev
# Aplicação rodando em http://localhost:3002
```

#### Aplicação Web Pública
```bash
cd apps/web
npm run dev
# Aplicação rodando em http://localhost:3003
```

### 4. Acessar o Sistema

- **Admin**: http://localhost:3002
- **API**: http://localhost:3001
- **Questionário Público**: http://localhost:3003/PSB (ou nome da empresa)

## 🎯 Funcionalidades Implementadas

### ✅ Painel Administrativo
- [x] Dashboard para Company Admin
- [x] Criação de questionários
- [x] Tipos de pergunta: texto, múltipla escolha, avaliação
- [x] Configuração de opções para múltipla escolha
- [x] Lista de questionários criados
- [x] Ativação/desativação de questionários
- [x] Exclusão de questionários
- [x] Links para visualizar questionários

### ✅ API Backend
- [x] Endpoints para CRUD de questionários
- [x] Endpoints públicos para visualização
- [x] Integração com Supabase
- [x] Middleware de autenticação
- [x] Tratamento de erros
- [x] CORS configurado

### ✅ Aplicação Web Pública
- [x] Página de questionário responsiva
- [x] Suporte a diferentes tipos de pergunta
- [x] Validação de campos obrigatórios
- [x] Submissão de respostas
- [x] URLs dinâmicas por empresa

### ✅ Banco de Dados
- [x] Schema completo implementado
- [x] Soft delete em todas as tabelas
- [x] Relacionamentos configurados
- [x] Índices de performance

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para build e dev server
- **Tailwind CSS** para estilização
- **React Router DOM** para navegação
- **Lucide React** para ícones

### Backend
- **Node.js** com Express
- **TypeScript** para type safety
- **Supabase** para banco de dados e autenticação
- **CORS** configurado para apps locais

### Infraestrutura
- **Turborepo** para monorepo
- **pnpm** para gerenciamento de pacotes
- **PostgreSQL** via Supabase
- **Row Level Security (RLS)**

## 📱 Endpoints da API

### Admin (Protegidos)
- `GET /api/surveys` - Listar questionários da empresa
- `POST /api/surveys` - Criar novo questionário
- `PUT /api/surveys/:id` - Atualizar questionário
- `DELETE /api/surveys/:id` - Excluir questionário
- `PATCH /api/surveys/:id/toggle` - Ativar/desativar

### Públicos
- `GET /api/public/:companySlug` - Obter questionário da empresa
- `POST /api/public/:companySlug/responses` - Enviar respostas

## 🔄 Status do Desenvolvimento

### ✅ Concluído
- [x] Estrutura do monorepo
- [x] Schema do banco de dados
- [x] API backend básica
- [x] Painel admin funcional
- [x] Criação de questionários
- [x] Visualização pública
- [x] Submissão de respostas (modo teste)

### 🔄 Em Desenvolvimento
- [x] Integração completa backend-frontend
- [x] Sistema de autenticação

### 📋 Próximas Funcionalidades
- [ ] Edição de questionários existentes
- [ ] Templates de questionários
- [ ] Duplicação de questionários
- [ ] Mais tipos de pergunta (checkbox, data, etc.)
- [ ] Sistema de slugs para empresas
- [ ] Analytics de respostas
- [ ] Temas customizados por empresa
- [ ] Filtros e busca
- [ ] Paginação
- [ ] Criação das tabelas `survey_responses` e `question_answers`

## 🐛 Problemas Conhecidos

- **Tabelas de respostas**: As tabelas `survey_responses` e `question_answers` ainda não foram criadas no banco
- **Autenticação**: Temporariamente desabilitada para testes
- **TypeScript**: Alguns erros de configuração em `tsconfig.json`

## 🧪 Como Testar

1. **Criar Questionário**: Acesse http://localhost:3002 e crie um questionário
2. **Visualizar**: Acesse http://localhost:3003/PSB para ver o questionário público
3. **Responder**: Preencha e envie as respostas (modo teste)

## 📝 Notas de Desenvolvimento

- O sistema está configurado para a empresa "PSB" como exemplo
- As respostas dos questionários estão em modo de teste (não salvas no banco)
- A autenticação está temporariamente desabilitada para facilitar testes

---

**Desenvolvido por Raed** 🚀

*Última atualização: Janeiro 2025*
