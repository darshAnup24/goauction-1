#!/bin/bash

# GoAuction Backend Deployment Script for EC2
# This script deploys the backend to an EC2 instance

set -e  # Exit on error

echo "🚀 Starting backend deployment..."

# Configuration
APP_DIR="/var/www/goauction-backend"
NGINX_CONF="/etc/nginx/sites-available/goauction-backend"
NGINX_ENABLED="/etc/nginx/sites-enabled/goauction-backend"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (if not installed)
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install Nginx (if not installed)
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Nginx...${NC}"
    sudo apt install -y nginx
fi

# Install PM2 globally (if not installed)
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    sudo npm install -g pm2
fi

# Create application directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copy files to application directory
echo -e "${YELLOW}📋 Copying application files...${NC}"
cp -r . $APP_DIR/
cd $APP_DIR

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --production

# Generate Prisma Client
echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate

# Run database migrations (make sure DATABASE_URL is set in .env.production)
if [ -f .env.production ]; then
    echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
    export $(cat .env.production | xargs)
    npx prisma migrate deploy
else
    echo -e "${YELLOW}⚠️  Warning: .env.production not found. Skipping migrations.${NC}"
fi

# Create logs directory
mkdir -p logs

# Configure Nginx
echo -e "${YELLOW}⚙️  Configuring Nginx...${NC}"
sudo cp nginx.conf $NGINX_CONF

# Enable Nginx site
if [ ! -L $NGINX_ENABLED ]; then
    sudo ln -s $NGINX_CONF $NGINX_ENABLED
fi

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
sudo systemctl reload nginx

# Stop existing PM2 process (if any)
echo -e "${YELLOW}🛑 Stopping existing processes...${NC}"
pm2 delete goauction-backend 2>/dev/null || true

# Start application with PM2
echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 startup script
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Show status
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "Application status:"
pm2 status
echo ""
echo "Access your backend at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo ""
echo "Useful commands:"
echo "  pm2 logs goauction-backend  - View logs"
echo "  pm2 restart goauction-backend - Restart app"
echo "  pm2 stop goauction-backend  - Stop app"
echo "  pm2 monit  - Monitor resources"
