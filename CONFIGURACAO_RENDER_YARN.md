# 🚀 Configuração Render com Yarn - Guia Completo

## 📋 Configurações para o Render

### 🔧 **Frontend Admin (eleicao-admin)**

#### Configurações Básicas:
- **Name**: `eleicao-admin`
- **Environment**: `Static Site`
- **Plan**: `Free`

#### Configurações de Build:
- **Root Directory**: `apps/admin`
- **Build Command**: 
  ```bash
  npm install -g yarn
  cp package-yarn.json package.json
  yarn install
  yarn build
  ```
- **Publish Directory**: `dist`

#### Variáveis de Ambiente:
- `VITE_API_URL`: `https://eleicao-api.onrender.com`
- `NODE_VERSION`: `18`

---

### 🔧 **Frontend Web (eleicao-web)**

#### Configurações Básicas:
- **Name**: `eleicao-web`
- **Environment**: `Static Site`
- **Plan**: `Free`

#### Configurações de Build:
- **Root Directory**: `apps/web`
- **Build Command**: 
  ```bash
  npm install -g yarn
  cp package-yarn.json package.json
  yarn install
  yarn build
  ```
- **Publish Directory**: `dist`

#### Variáveis de Ambiente:
- `VITE_API_URL`: `https://eleicao-api.onrender.com`
- `NODE_VERSION`: `18`

---

### 🔧 **Backend API (eleicao-api)**

#### Configurações Básicas:
- **Name**: `eleicao-api`
- **Environment**: `Web Service`
- **Plan**: `Free`

#### Configurações de Build:
- **Root Directory**: `apps/api`
- **Build Command**: 
  ```bash
  npm install
  npm run build
  ```
- **Start Command**: `npm start`

#### Variáveis de Ambiente:
- `NODE_ENV`: `production`
- `PORT`: `3001`
- `SUPABASE_URL`: `sua_url_do_supabase`
- `SUPABASE_ANON_KEY`: `sua_chave_anonima`
- `SUPABASE_SERVICE_ROLE_KEY`: `sua_chave_service_role`

---

## 🎯 **Passo a Passo no Render**

### 1. **Criar o Backend API**
1. Acesse o painel do Render
2. Clique em "New +" → "Web Service"
3. Conecte com o GitHub e selecione o repositório
4. Use as configurações do Backend API acima
5. Faça o deploy

### 2. **Criar o Frontend Admin**
1. Clique em "New +" → "Static Site"
2. Conecte com o GitHub e selecione o repositório
3. Use as configurações do Frontend Admin acima
4. Faça o deploy

### 3. **Criar o Frontend Web**
1. Clique em "New +" → "Static Site"
2. Conecte com o GitHub e selecione o repositório
3. Use as configurações do Frontend Web acima
4. Faça o deploy

---

## ✅ **Arquivos Criados para Yarn**

- ✅ `.yarnrc` - Configuração do Yarn
- ✅ `apps/admin/package-yarn.json` - Package.json para admin
- ✅ `apps/web/package-yarn.json` - Package.json para web
- ✅ `apps/admin/yarn.lock` - Lock file do admin
- ✅ `apps/web/yarn.lock` - Lock file do web

---

## 🚀 **Vantagens do Yarn**

- ✅ **Sem bug `extraneous`** do npm
- ✅ **Instalação mais rápida**
- ✅ **Melhor resolução de conflitos**
- ✅ **Cache mais eficiente**
- ✅ **Mais estável para projetos complexos**

---

## 🔍 **Verificação**

Após o deploy, verifique:
- ✅ Backend: `https://eleicao-api.onrender.com`
- ✅ Admin: `https://eleicao-admin.onrender.com`
- ✅ Web: `https://eleicao-web.onrender.com`

---

## ⚠️ **Importante**

1. **Deploy o Backend primeiro** para obter a URL da API
2. **Atualize as variáveis** `VITE_API_URL` nos frontends com a URL real do backend
3. **Use as configurações exatas** fornecidas acima
4. **Root Directory** é muito importante - deve ser `apps/admin` e `apps/web`
