#!/bin/bash
# Quick dev server starter for Aetheria frontend

cd "$(dirname "$0")"

echo "🚀 Starting Aetheria Frontend..."
echo "📂 Current directory: $(pwd)"
echo ""

if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found!"
  echo "💡 Make sure you're in the frontend directory"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

echo ""
echo "✨ Starting dev server..."
npm run dev
