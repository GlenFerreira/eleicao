#!/bin/bash

# Script de build para o Render
echo "🚀 Iniciando build para o Render..."

# Instalar pnpm globalmente
echo "📦 Instalando pnpm..."
npm install -g pnpm@8.15.0

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

# Build dos packages primeiro
echo "🔨 Buildando packages..."
cd packages/ui && pnpm run build && cd ../..
cd packages/utils && pnpm run build && cd ../..
cd packages/config && pnpm run build && cd ../..

# Build da API
echo "🔨 Buildando API..."
pnpm run build:api

# Build do Admin
echo "🔨 Buildando Admin..."
pnpm run build:admin

# Build do Web
echo "🔨 Buildando Web..."
pnpm run build:web

echo "✅ Build concluído com sucesso!"

