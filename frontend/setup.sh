#!/bin/bash

# GoAuction Frontend - Quick Setup Script

echo "🎯 GoAuction Frontend - Quick Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env.development ]; then
    echo "📝 Creating .env.development file..."
    cat > .env.development << EOF
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
EOF
    echo "✅ Created .env.development file"
    echo "⚠️  Please update the environment variables in .env.development"
else
    echo "✅ .env.development already exists"
fi

echo ""
echo "✨ Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "  1. Update environment variables in .env.development"
echo "  2. Make sure backend is running on http://localhost:5000"
echo "  3. Run 'npm start' to start the development server"
echo ""
echo "🚀 Available commands:"
echo "  npm start      - Start development server"
echo "  npm run build  - Build for production"
echo "  npm test       - Run tests"
echo ""
