# 🏗️ Monorepo Raed SaaS

## 📁 Estrutura do Projeto

```
raed-saas/
├── apps/
│   ├── web/                 # Frontend Vite + React (página de questionário)
│   ├── admin/               # Painel admin Vite + React
│   └── api/                 # Backend Node.js/Express
├── packages/
│   ├── database/            # Schemas e tipos do Supabase
│   ├── ui/                  # Componentes compartilhados
│   ├── utils/               # Funções utilitárias
│   └── config/              # Configurações compartilhadas
├── tools/                   # Scripts de build e deploy
├── package.json             # Root package.json
├── turbo.json               # Configuração do Turborepo
└── tsconfig.json            # Configuração TypeScript
```

## 🚀 Como Usar

### **Instalação**
```bash
# Instalar pnpm globalmente (se não tiver)
npm install -g pnpm

# Instalar dependências
pnpm install
```

### **Desenvolvimento**
```bash
# Desenvolver todos os apps
pnpm dev

# Desenvolver apenas o web
pnpm web:dev

# Desenvolver apenas o admin
pnpm admin:dev

# Desenvolver apenas a API
pnpm api:dev
```

### **Build**
```bash
# Build de todos os apps
pnpm build

# Build específico
pnpm build --filter=web
pnpm build --filter=admin
pnpm build --filter=api
```

### **Lint e Type Check**
```bash
# Lint de todos os apps
pnpm lint

# Type check de todos os apps
pnpm type-check

# Limpar builds
pnpm clean
```

## 🛠️ Apps

### **Web** (`apps/web/`)
- **Propósito**: Página pública do questionário
- **Tecnologia**: Vite + React + TypeScript
- **Porta**: 5173 (padrão Vite)
- **Comando**: `pnpm web:dev`

### **Admin** (`apps/admin/`)
- **Propósito**: Painel administrativo
- **Tecnologia**: Vite + React + TypeScript
- **Porta**: 5174 (configurado manualmente)
- **Comando**: `pnpm admin:dev`

### **API** (`apps/api/`)
- **Propósito**: Backend com autenticação
- **Tecnologia**: Node.js + Express + TypeScript
- **Porta**: 3001
- **Comando**: `pnpm api:dev`

## 📦 Pacotes Compartilhados

### **Database** (`packages/database/`)
- Schemas do Supabase
- Tipos TypeScript
- Funções de conexão

### **UI** (`packages/ui/`)
- Componentes React reutilizáveis
- Ícones (Lucide React)
- Estilos compartilhados

### **Utils** (`packages/utils/`)
- Funções utilitárias
- Validações (Zod)
- Helpers comuns

### **Config** (`packages/config/`)
- Configurações de ambiente
- Constantes compartilhadas
- Setup do Supabase

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Desenvolve todos os apps |
| `pnpm build` | Build de todos os apps |
| `pnpm lint` | Lint de todos os apps |
| `pnpm clean` | Limpa builds de todos os apps |
| `pnpm type-check` | Type check de todos os apps |
| `pnpm web:dev` | Desenvolve apenas o web |
| `pnpm admin:dev` | Desenvolve apenas o admin |
| `pnpm api:dev` | Desenvolve apenas a API |

## 🌐 Portas dos Apps

| App | Porta | URL |
|-----|-------|-----|
| Web | 5173 | http://localhost:5173 |
| Admin | 5174 | http://localhost:5174 |
| API | 3001 | http://localhost:3001 |

## 📝 Próximos Passos

1. ✅ Estrutura do monorepo criada
2. 🔄 Configurar Vite para cada app
3. 🔄 Configurar Tailwind CSS
4. 🔄 Criar componentes UI compartilhados
5. 🔄 Implementar autenticação
6. 🔄 Desenvolver funcionalidades

## 🚨 Importante

- **Sempre use `pnpm`** para instalar dependências
- **Apps compartilham dependências** através dos workspaces
- **TypeScript** está configurado em todo o projeto
- **Turborepo** gerencia builds e cache automaticamente

---

**Desenvolvido por Raed** 🚀
