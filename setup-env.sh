#!/bin/bash

# Aetheria Environment Setup Script
# This script creates your .env file from the template

echo "🚀 Setting up Aetheria environment..."

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting. No changes made."
        exit 0
    fi
fi

# Copy .env.example to .env
cp .env.example .env

echo "✅ Created .env file from template"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file with your actual credentials"
echo "2. Fill in:"
echo "   - Supabase URL and keys (from https://supabase.com/dashboard)"
echo "   - Polygon wallet private key"
echo "   - Contract address (after deploying smart contract)"
echo "   - Generate MINTER_AUTH_TOKEN with: openssl rand -hex 32"
echo ""
echo "💡 To generate a secure auth token:"
echo "   openssl rand -hex 32"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"

