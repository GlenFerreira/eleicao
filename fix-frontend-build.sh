#!/bin/bash

echo "🔧 Corrigindo build do frontend..."

# Backup dos package.json originais
cp apps/web/package.json apps/web/package-backup.json
cp apps/admin/package.json apps/admin/package-backup.json

# Usar versões minimalistas
cp apps/web/package-minimal.json apps/web/package.json
cp apps/admin/package-minimal.json apps/admin/package.json

echo "✅ Package.json atualizados para versão minimalista"
echo "📦 Dependências reduzidas para evitar conflitos"
echo "🚀 Agora tente o deploy novamente no Render"
