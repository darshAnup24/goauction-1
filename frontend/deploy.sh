#!/bin/bash

# GoAuction Frontend Deployment Script for EC2

echo "🚀 Starting GoAuction Frontend Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally (if not installed)
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Install serve globally
echo "📦 Installing serve..."
sudo npm install -g serve

# Install Nginx (if not installed)
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt install -y nginx
fi

# Create deployment directory
echo "📁 Creating deployment directory..."
sudo mkdir -p /var/www/goauction-frontend
sudo chown -R $USER:$USER /var/www/goauction-frontend

# Navigate to project directory
cd /var/www/goauction-frontend

# Clone or pull repository
if [ -d ".git" ]; then
    echo "🔄 Pulling latest changes..."
    git pull origin main
else
    echo "📥 Cloning repository..."
    # Replace with your actual repository URL
    git clone https://github.com/your-repo/goauction-frontend.git .
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building React app..."
npm run build

# Copy nginx configuration
echo "⚙️  Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/goauction-frontend
sudo ln -sf /etc/nginx/sites-available/goauction-frontend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Create logs directory
mkdir -p logs

# Start/Restart PM2
echo "🔄 Starting application with PM2..."
pm2 delete goauction-frontend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should now be accessible at http://your-server-ip"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: pm2 logs goauction-frontend"
echo "  - Restart app: pm2 restart goauction-frontend"
echo "  - Stop app: pm2 stop goauction-frontend"
echo "  - Nginx status: sudo systemctl status nginx"
