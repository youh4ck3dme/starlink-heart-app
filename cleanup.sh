#!/bin/bash

# 🧹 FastTransfer - Cleanup Script
# Vymaže všetky build artefakty a dočasné súbory

echo "🧹 Čistenie build artefaktov..."

# Vymaž build priečinky
echo "📁 Mažem dist/ priečinok..."
rm -rf dist/

echo "�� Mažem .vercel/ priečinok..."
rm -rf .vercel/

echo "📁 Mažem node_modules/.cache/ priečinok..."
rm -rf node_modules/.cache/

# Vymaž dočasné súbory
echo "🗑️  Mažem dočasné súbory..."
find . -name "*.log" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "Thumbs.db" -type f -delete

echo "✅ Cleanup dokončený!"
echo ""
echo "📊 Uvoľnené miesto:"
du -sh dist/ .vercel/ node_modules/.cache/ 2>/dev/null || echo "Všetky priečinky už boli vymazané"
