# 🧪 Teste Local do Build

## Pré-requisitos
- Node.js 18+ instalado
- pnpm instalado globalmente: `npm install -g pnpm@8.15.0`

## Comandos para Testar

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Testar build de cada app
```bash
# Build da API
pnpm run build:api

# Build do Admin
pnpm run build:admin

# Build do Web
pnpm run build:web
```

### 3. Build completo
```bash
pnpm run build
```

## Verificações

Após o build, verifique se foram criados os diretórios:
- `apps/api/dist/` - Backend compilado
- `apps/admin/dist/` - Frontend admin compilado  
- `apps/web/dist/` - Frontend web compilado

## Se der erro

Se houver erros relacionados às dependências locais (`file:../../packages/*`), execute:

```bash
# Limpar cache
pnpm store prune

# Reinstalar tudo
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
```

