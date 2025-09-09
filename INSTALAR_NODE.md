# 📦 Instalação do Node.js - Windows

## 🚀 Método Recomendado: Node Version Manager (nvm-windows)

### 1. Baixar o nvm-windows
1. Acesse: https://github.com/coreybutler/nvm-windows/releases
2. Baixe o arquivo `nvm-setup.exe` da versão mais recente
3. Execute como administrador

### 2. Instalar Node.js via nvm
Abra o PowerShell como administrador e execute:

```powershell
# Instalar a versão LTS mais recente
nvm install lts

# Usar a versão instalada
nvm use lts

# Verificar instalação
node --version
npm --version
```

## 🔧 Método Alternativo: Instalação Direta

### 1. Baixar Node.js
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (Long Term Support)
3. Execute o instalador `.msi`

### 2. Verificar Instalação
Após a instalação, reinicie o PowerShell e execute:

```powershell
node --version
npm --version
```

## 🐛 Se Ainda Não Funcionar

### Verificar PATH
1. Abra "Variáveis de Ambiente" no Windows
2. Verifique se `C:\Program Files\nodejs\` está no PATH
3. Se não estiver, adicione manualmente

### Reiniciar Terminal
Após instalar, feche e abra novamente o PowerShell/CMD

## ✅ Teste Final

Após a instalação, execute no diretório do projeto:

```powershell
cd eleicao
node --version
npm --version
```

Se funcionar, você pode prosseguir com o teste do build!

