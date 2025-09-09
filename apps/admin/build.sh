#!/bin/bash
# Script de build para Render

echo "🧹 Limpando cache e dependências..."
rm -rf node_modules package-lock.json

echo "📦 Instalando dependências..."
npm install --no-audit --no-fund --legacy-peer-deps

echo "🔨 Executando build..."
npm run build

echo "✅ Build concluído!"
