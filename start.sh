#!/bin/bash

echo "🚀 Starting GoAuction Platform..."

# Kill any existing processes
echo "📋 Cleaning up old processes..."
pkill -9 -f "node.*5000" 2>/dev/null
pkill -9 -f "node.*3000" 2>/dev/null
sleep 2

# Start backend
echo "🔧 Starting backend (http://localhost:5000)..."
cd /home/darshanchavan/Documents/gocart-1/backend
npm run dev > /tmp/goauction-backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
for i in {1..10}; do
  if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
    break
  fi
  sleep 2
done

# Start frontend
echo "🎨 Starting frontend (http://localhost:3000)..."
cd /home/darshanchavan/Documents/gocart-1/frontend
npm start > /tmp/goauction-frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "✅ GoAuction Platform Started!"
echo "================================"
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Test Users (password: password123):"
echo "  - john@example.com (BUYER)"
echo "  - jane@example.com (SELLER)"
echo "  - sarah@example.com (BUYER)"
echo ""
echo "Logs:"
echo "  - Backend:  tail -f /tmp/goauction-backend.log"
echo "  - Frontend: tail -f /tmp/goauction-frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo "================================"

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
