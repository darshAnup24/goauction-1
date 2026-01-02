# GoAuction Backend API

Express.js REST API backend for the GoAuction platform with real-time bidding via Socket.io.

## 🚀 Features

- **RESTful API** with Express.js
- **Real-time bidding** with Socket.io
- **JWT Authentication** for secure access
- **Stripe Integration** for payments and Connect
- **AWS S3** for image storage
- **PostgreSQL** database with Prisma ORM
- **Email notifications** with Resend
- **Rate limiting** and security with Helmet
- **CORS** configuration for frontend
- **Cron jobs** for auction expiry

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers (business logic)
│   ├── middleware/       # Auth, error handling, validation
│   ├── models/           # Prisma client
│   ├── routes/           # API routes
│   ├── services/         # Business services (S3, email)
│   ├── socket/           # Socket.io real-time handlers
│   ├── utils/            # Utility functions
│   ├── app.js           # Express app configuration
│   └── server.js        # HTTP server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env.development     # Development environment variables
├── .env.production      # Production environment variables
├── ecosystem.config.js  # PM2 configuration
├── nginx.conf          # Nginx reverse proxy config
└── package.json        # Dependencies
```

## 🛠️ Tech Stack

- **Runtime:** Node.js 20+
- **Framework:** Express 4.18
- **Database:** PostgreSQL (AWS RDS)
- **ORM:** Prisma 6.19
- **Authentication:** JWT (jsonwebtoken)
- **Real-time:** Socket.io 4.8
- **Storage:** AWS S3
- **Payments:** Stripe
- **Email:** Resend
- **Validation:** Zod
- **File Upload:** Multer
- **Security:** Helmet, CORS, express-rate-limit

## 📦 Installation

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (AWS RDS recommended)
- AWS account with S3 bucket
- Stripe account
- Resend account

### 1. Clone the repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the development environment file and update with your credentials:

```bash
cp .env.development .env
```

Required environment variables:

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/goauction

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend Email
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# Cron
CRON_SECRET=your-cron-secret-key

# Socket.io (optional)
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### 4. Setup database

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Seed database (optional):

```bash
npx prisma db seed
```

### 5. Start development server

```bash
npm run dev
```

The server will start at `http://localhost:5000`

## 🚀 Deployment (AWS EC2)

### 1. Setup EC2 Instance

- Launch Ubuntu 22.04 LTS EC2 instance
- Configure security groups (ports 22, 80, 443, 5000)
- SSH into instance

### 2. Run deployment script

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Install Node.js, Nginx, PM2
- Copy files to `/var/www/goauction-backend`
- Install dependencies
- Run database migrations
- Configure Nginx reverse proxy
- Start app with PM2

### 3. Setup SSL (optional but recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user
- `GET /api/auth/session` - Get session

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (auth required)
- `PUT /api/listings/:id` - Update listing (auth required)
- `DELETE /api/listings/:id` - Delete listing (auth required)
- `GET /api/listings/my-listings` - Get user's listings (auth required)

### Bids
- `POST /api/bids/place` - Place a bid (auth required)
- `GET /api/bids/listing/:listingId` - Get listing bids
- `GET /api/bids/my-bids` - Get user's bids (auth required)
- `GET /api/bids/stats/:listingId` - Get bid statistics

### Payments
- `POST /api/payments/create-intent` - Create payment intent (auth required)
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/:id` - Get payment details (auth required)
- `GET /api/payments/my-payments` - Get user's payments (auth required)

### Notifications
- `GET /api/notifications` - Get user notifications (auth required)
- `PUT /api/notifications/:id/read` - Mark as read (auth required)
- `PUT /api/notifications/read-all` - Mark all as read (auth required)
- `DELETE /api/notifications/:id` - Delete notification (auth required)
- `GET /api/notifications/unread-count` - Get unread count (auth required)

### Upload
- `POST /api/upload/single` - Upload single image (auth required)
- `POST /api/upload/multiple` - Upload multiple images (auth required)
- `DELETE /api/upload` - Delete image (auth required)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile (auth required)
- `PUT /api/users/avatar` - Update avatar (auth required)
- `PUT /api/users/password` - Change password (auth required)
- `DELETE /api/users/account` - Delete account (auth required)
- `GET /api/users/stats` - Get user statistics (auth required)

### Vendors
- `POST /api/vendors/connect` - Create Stripe Connect account (auth required)
- `GET /api/vendors/status` - Get account status (auth required)
- `POST /api/vendors/onboarding-link` - Get onboarding link (auth required)
- `POST /api/vendors/dashboard-link` - Get dashboard link (auth required)
- `GET /api/vendors/earnings` - Get earnings (auth required)
- `POST /api/vendors/apply` - Apply to become vendor (auth required)

### Cron
- `POST /api/cron/expire-auctions` - Expire ended auctions
- `POST /api/cron/reminders` - Send auction reminders
- `POST /api/cron/cleanup` - Cleanup old notifications

## 🔌 WebSocket Events

### Client → Server
- `authenticate` - Authenticate socket connection
- `join:auction` - Join auction room
- `leave:auction` - Leave auction room

### Server → Client
- `bid:new` - New bid placed on auction
- `auction:won` - User won auction
- `auction:reminder` - Auction ending soon
- `payment:success` - Payment successful
- `notification` - New notification

## 🧪 Testing

Run tests:

```bash
npm test
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run migrate` - Run Prisma migrations
- `npm run migrate:deploy` - Deploy migrations (production)
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio

## 🔒 Security

- **Helmet** - HTTP security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - 100 requests per 15 minutes
- **JWT** - Secure authentication tokens
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Zod schemas
- **File Upload Limits** - 5MB max size
- **SQL Injection Protection** - Prisma parameterized queries

## 📊 Database Schema

See [prisma/schema.prisma](./prisma/schema.prisma) for full schema.

Key models:
- **User** - Authentication and profile
- **Listing** - Auction items
- **Bid** - Auction bids
- **Payment** - Stripe payments
- **Notification** - User notifications
- **Rating** - User ratings

## 🔧 Environment-Specific Configuration

### Development
- Use local PostgreSQL or development RDS
- Lower rate limits
- Detailed error messages
- Hot reload with nodemon

### Production
- AWS RDS PostgreSQL
- Strict rate limits
- Error logging only (no stack traces to client)
- PM2 cluster mode
- Nginx reverse proxy
- SSL/TLS encryption

## 📞 Support

For issues or questions, please contact the development team.

## 📄 License

MIT License - see LICENSE file for details
