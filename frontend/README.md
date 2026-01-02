# GoAuction Frontend

React frontend for the GoAuction platform - separated from the monolithic Next.js application.

## Features

- React 18 with React Router
- Redux Toolkit for state management
- Socket.io client for real-time bidding
- Axios for API calls
- Tailwind CSS for styling
- Stripe integration for payments
- AWS S3 for image storage

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Create .env.development file
cp .env.development.example .env.development

# Update environment variables
# REACT_APP_API_URL=http://localhost:5000
# REACT_APP_SOCKET_URL=http://localhost:5000
# REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Deployment to EC2

### Manual Deployment

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

2. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Update environment variables:**
   ```bash
   nano .env.production
   # Update REACT_APP_API_URL to your backend EC2 URL
   ```

4. **Rebuild:**
   ```bash
   npm run build
   pm2 restart goauction-frontend
   ```

### Using PM2

```bash
# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs goauction-frontend

# Restart
pm2 restart goauction-frontend

# Stop
pm2 stop goauction-frontend

# Monitor
pm2 monit
```

### Nginx Configuration

The nginx configuration is located at `/etc/nginx/sites-available/goauction-frontend`

```bash
# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# View nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Shared components
│   │   ├── auction/     # Auction components
│   │   ├── listings/    # Listing components
│   │   └── ...
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── context/         # React contexts
│   ├── store/           # Redux store
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   ├── styles/          # CSS files
│   ├── App.js           # Main App component
│   └── index.js         # Entry point
├── nginx.conf           # Nginx configuration
├── ecosystem.config.js  # PM2 configuration
└── deploy.sh            # Deployment script
```

## Environment Variables

### Development (.env.development)
- `REACT_APP_API_URL` - Backend API URL (http://localhost:5000)
- `REACT_APP_SOCKET_URL` - Socket.io URL (http://localhost:5000)
- `REACT_APP_STRIPE_PUBLIC_KEY` - Stripe public key

### Production (.env.production)
- `REACT_APP_API_URL` - Production backend URL
- `REACT_APP_SOCKET_URL` - Production socket URL
- `REACT_APP_STRIPE_PUBLIC_KEY` - Stripe live public key

## API Integration

All API calls are centralized in the `services` directory:

- `auth.service.js` - Authentication APIs
- `listings.service.js` - Listing management
- `bids.service.js` - Bidding operations
- `payments.service.js` - Payment processing
- `upload.service.js` - Image uploads to S3
- `socket.service.js` - Real-time WebSocket communication

## State Management

Redux Toolkit is used for global state:

- `authSlice` - User authentication state
- `listingsSlice` - Listings data
- `bidsSlice` - Bidding state

React Context is used for:

- `AuthContext` - Authentication provider
- `SocketContext` - WebSocket connection

## Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### PM2 Issues
```bash
# View PM2 logs
pm2 logs goauction-frontend

# Restart PM2
pm2 restart goauction-frontend

# Clear PM2 logs
pm2 flush
```

### Nginx Issues
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx errors
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
```

## License

MIT
