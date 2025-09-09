# 🚀 Deploy no Render - Instruções

## ✅ Problemas Corrigidos

1. **Removidas dependências locais** que causavam o erro `extraneous`
2. **Simplificado o build** para usar apenas npm em cada app
3. **Adicionadas flags** para evitar problemas de auditoria e funding

## 📋 Configuração Atual

### Backend API (eleicao-api)
- **Build**: `cd apps/api && npm install --legacy-peer-deps --no-audit --no-fund && npm run build`
- **Start**: `cd apps/api && npm start`
- **Porta**: 3001

### Frontend Admin (eleicao-admin)
- **Build**: `cd apps/admin && npm install --legacy-peer-deps --no-audit --no-fund && npm run build`
- **Publish Path**: `apps/admin/dist`
- **API URL**: `https://eleicao-api.onrender.com`

### Frontend Web (eleicao-web)
- **Build**: `cd apps/web && npm install --legacy-peer-deps --no-audit --no-fund && npm run build`
- **Publish Path**: `apps/web/dist`
- **API URL**: `https://eleicao-api.onrender.com`

## 🔧 Variáveis de Ambiente Necessárias

### Para a API (eleicao-api):
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### Para os Frontends:
```
VITE_API_URL=https://eleicao-api.onrender.com
NODE_VERSION=18
```

## 🚀 Como Fazer o Deploy

1. **Substitua o `render.yaml`** atual pelo novo arquivo
2. **Configure as variáveis de ambiente** no painel do Render
3. **Faça o deploy** de cada serviço separadamente:
   - Primeiro: API (eleicao-api)
   - Segundo: Admin (eleicao-admin) 
   - Terceiro: Web (eleicao-web)

## 🔍 Verificação

Após o deploy, verifique:
- ✅ API respondendo em `https://eleicao-api.onrender.com`
- ✅ Admin acessível em `https://eleicao-admin.onrender.com`
- ✅ Web acessível em `https://eleicao-web.onrender.com`

## 🐛 Se Ainda Der Erro

Use o arquivo `render-npm-only.yaml` como alternativa, que tem uma configuração ainda mais simples.

