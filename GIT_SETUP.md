# 🚀 Configuração do Git - SaaS Raed Eleição

## ✅ Arquivos de Configuração

### `.gitignore`
- ✅ Configurado para ignorar arquivos sensíveis
- ✅ Ignora `node_modules/`, `dist/`, `build/`
- ✅ Ignora arquivos `.env` (exceto `.env.example`)
- ✅ Ignora arquivos de cache e temporários
- ✅ Ignora arquivos de sistema operacional

### `.gitattributes`
- ✅ Configurado para tratamento correto de arquivos
- ✅ Define quebra de linha LF para arquivos de texto
- ✅ Marca arquivos binários corretamente

## 🔐 Segurança

### Arquivos Ignorados (NÃO serão commitados):
- `.env` - Variáveis de ambiente sensíveis
- `node_modules/` - Dependências
- `dist/`, `build/` - Builds de produção
- Arquivos de cache e temporários

### Arquivos Incluídos (SERÃO commitados):
- `.env.example` - Template de variáveis de ambiente
- Código fonte (`src/`)
- Arquivos de configuração (`package.json`, `tsconfig.json`, etc.)
- Documentação (`README.md`, `MONOREPO.md`)

## 📋 Checklist Antes do Commit

### ✅ Verificar se não há informações sensíveis:
- [ ] Nenhum arquivo `.env` real
- [ ] Nenhuma chave de API real no código
- [ ] Nenhuma senha ou token no código
- [ ] Nenhum caminho absoluto específico do sistema

### ✅ Verificar se todos os arquivos necessários estão incluídos:
- [ ] Código fonte das aplicações
- [ ] Arquivos de configuração
- [ ] Documentação
- [ ] `.env.example`

## 🚀 Comandos para Subir para o Git

```bash
# 1. Inicializar repositório (se ainda não foi feito)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Verificar o que será commitado
git status

# 4. Fazer o commit inicial
git commit -m "feat: implementação inicial do SaaS Raed Eleição

- Sistema de questionários com painel admin
- API REST com Supabase
- Frontend React com Vite
- Funcionalidades: criar, visualizar, excluir questionários
- Sistema de respostas com visualização no admin
- Autenticação e proteção de rotas"

# 5. Adicionar remote (substitua pela URL do seu repositório)
git remote add origin https://github.com/seu-usuario/raed-eleicao.git

# 6. Fazer push
git push -u origin main
```

## ⚠️ Importante

1. **NUNCA** commite arquivos `.env` com informações reais
2. **SEMPRE** use `.env.example` como template
3. **VERIFIQUE** se não há chaves de API no código
4. **TESTE** localmente antes de fazer push

## 📁 Estrutura do Projeto

```
raed-eleicao/
├── apps/
│   ├── admin/          # Painel administrativo (React)
│   ├── api/            # API REST (Node.js + Express)
│   └── web/            # Site público (React)
├── packages/           # Pacotes compartilhados
├── .gitignore         # Arquivos ignorados pelo Git
├── .gitattributes     # Configurações do Git
├── .env.example       # Template de variáveis de ambiente
└── README.md          # Documentação principal
```

## 🔧 Configuração Local

Após clonar o repositório:

1. Copie `.env.example` para `.env`
2. Configure as variáveis de ambiente
3. Execute `npm install` na raiz
4. Execute `npm run dev` para iniciar o desenvolvimento
