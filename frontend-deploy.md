# 🎨 Deploy dos Frontends no Render

## 📋 Configuração dos Frontends

### **1. Frontend Admin (eleicao-admin)**

#### **Configurações no Render:**
- **Tipo**: Static Site
- **Nome**: `eleicao-admin`
- **Branch**: `main`
- **Root Directory**: `apps/admin`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Node Version**: `18`

#### **Variáveis de Ambiente:**
```
VITE_API_URL=https://eleicao-api.onrender.com
```

### **2. Frontend Web (eleicao-web)**

#### **Configurações no Render:**
- **Tipo**: Static Site
- **Nome**: `eleicao-web`
- **Branch**: `main`
- **Root Directory**: `apps/web`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Node Version**: `18`

#### **Variáveis de Ambiente:**
```
VITE_API_URL=https://eleicao-api.onrender.com
```

## 🔧 Configurações Implementadas

### **Vite Config Atualizado:**
- ✅ `define` para variáveis de ambiente
- ✅ Fallback para localhost em desenvolvimento
- ✅ Configuração dinâmica baseada em `process.env`

### **API Service Atualizado:**
- ✅ `import.meta.env.VITE_API_URL` configurado
- ✅ Fallback para localhost em desenvolvimento
- ✅ Type assertion para compatibilidade

## 🚀 Passos para Deploy

### **1. Deploy do Backend (já feito)**
- ✅ API funcionando em `https://eleicao-api.onrender.com`

### **2. Deploy do Frontend Admin**
1. Acesse https://render.com
2. Clique em "New +" → "Static Site"
3. Conecte o repositório `GlenFerreira/eleicao`
4. Configure:
   - **Name**: `eleicao-admin`
   - **Root Directory**: `apps/admin`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Adicione variável de ambiente:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://eleicao-api.onrender.com`

### **3. Deploy do Frontend Web**
1. Clique em "New +" → "Static Site"
2. Conecte o repositório `GlenFerreira/eleicao`
3. Configure:
   - **Name**: `eleicao-web`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Adicione variável de ambiente:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://eleicao-api.onrender.com`

## 🔗 URLs Finais

Após o deploy, você terá:
- **API**: https://eleicao-api.onrender.com
- **Admin**: https://eleicao-admin.onrender.com
- **Web**: https://eleicao-web.onrender.com

## ⚠️ Importante

1. **Ordem**: Backend → Frontend Admin → Frontend Web
2. **Variáveis**: Configure `VITE_API_URL` em ambos os frontends
3. **Build**: Pode demorar alguns minutos no primeiro deploy
4. **CORS**: Já configurado no backend para aceitar requisições

## 🧪 Teste

1. **Admin**: Acesse https://eleicao-admin.onrender.com
2. **Web**: Acesse https://eleicao-web.onrender.com/PSB
3. **API**: Teste https://eleicao-api.onrender.com/api/public/PSB

---

**Desenvolvido por Raed** 🚀
