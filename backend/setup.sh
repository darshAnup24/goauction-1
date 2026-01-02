#!/bin/bash

# GoAuction Backend Setup Script
# Run this script to setup the backend development environment

set -e

echo "🚀 GoAuction Backend Setup"
echo "=========================="
echo ""

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi
echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating .env file from .env.development..."
    cp .env.development .env
    echo "✅ .env file created"
    echo "⚠️  Please update .env with your actual credentials"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma Client
echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Ask if user wants to run migrations
echo ""
read -p "Do you want to run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Running database migrations..."
    npx prisma migrate dev
    echo "✅ Migrations completed"
fi

# Create logs directory
mkdir -p logs

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your credentials"
echo "2. Run 'npm run dev' to start development server"
echo "3. API will be available at http://localhost:5000"
echo ""
echo "Useful commands:"
echo "  npm run dev           - Start development server"
echo "  npm run migrate       - Run database migrations"
echo "  npm run prisma:studio - Open Prisma Studio"
echo "  npm test             - Run tests"
