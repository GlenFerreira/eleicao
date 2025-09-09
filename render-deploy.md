# 🚀 Deploy no Render - Guia Completo

## 📋 Pré-requisitos

1. **Conta no Render** (https://render.com)
2. **Repositório no GitHub** (já temos)
3. **Supabase configurado** (já temos)

## 🔧 Configuração do Projeto

### 1. Arquivos Criados
- ✅ `render.yaml` - Configuração automática do Render
- ✅ Scripts de build já configurados no package.json

### 2. Variáveis de Ambiente Necessárias

#### Backend API
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

#### Frontend Admin
```
VITE_API_URL=https://eleicao-api.onrender.com
```

#### Frontend Web
```
VITE_API_URL=https://eleicao-api.onrender.com
```

## 🚀 Passos para Deploy

### 1. Conectar Repositório
1. Acesse https://render.com
2. Faça login com sua conta GitHub
3. Clique em "New +" → "Web Service"
4. Conecte o repositório `GlenFerreira/eleicao`

### 2. Configurar Backend API
1. **Nome**: `eleicao-api`
2. **Branch**: `main`
3. **Root Directory**: `apps/api`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. **Node Version**: `18`

### 3. Configurar Frontend Admin
1. **Nome**: `eleicao-admin`
2. **Branch**: `main`
3. **Root Directory**: `apps/admin`
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist`
6. **Node Version**: `18`

### 3. Configurar Frontend Web
1. **Nome**: `eleicao-web`
2. **Branch**: `main`
3. **Root Directory**: `apps/web`
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist`
6. **Node Version**: `18`

## ⚙️ Configuração das Variáveis

### Backend (eleicao-api)
```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
```

### Frontend Admin (eleicao-admin)
```
VITE_API_URL=https://eleicao-api.onrender.com
```

### Frontend Web (eleicao-web)
```
VITE_API_URL=https://eleicao-api.onrender.com
```

## 🔗 URLs Finais

Após o deploy, você terá:
- **API**: https://eleicao-api.onrender.com
- **Admin**: https://eleicao-admin.onrender.com
- **Web**: https://eleicao-web.onrender.com

## 📝 Notas Importantes

1. **Primeiro Deploy**: O backend deve ser deployado primeiro
2. **Variáveis**: Configure as variáveis de ambiente antes do deploy
3. **Build Time**: O primeiro build pode demorar alguns minutos
4. **Sleep Mode**: No plano gratuito, o backend "dorme" após 15min de inatividade
5. **CORS**: Já está configurado para aceitar requisições dos frontends

## 🐛 Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no package.json
- Confirme se o Node.js está na versão 18+

### Erro de CORS
- Verifique se as URLs dos frontends estão corretas
- Confirme se o backend está rodando

### Erro de Variáveis
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se as chaves do Supabase estão corretas

## ✅ Checklist de Deploy

- [ ] Repositório conectado ao Render
- [ ] Backend API configurado e deployado
- [ ] Frontend Admin configurado e deployado
- [ ] Frontend Web configurado e deployado
- [ ] Variáveis de ambiente configuradas
- [ ] URLs funcionando
- [ ] Teste de criação de questionário
- [ ] Teste de resposta pública
- [ ] Teste de analytics

## 🎯 Próximos Passos

1. **Deploy Manual**: Siga os passos acima
2. **Deploy Automático**: Use o `render.yaml` para deploy automático
3. **Custom Domain**: Configure domínio personalizado (opcional)
4. **SSL**: Certificado SSL automático (gratuito)
5. **Monitoring**: Configure logs e monitoramento

---

**Desenvolvido por Raed** 🚀
