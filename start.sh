#!/bin/bash

echo ""
echo "===================================="
echo "  CDS Mock Test Platform"
echo "  Starting Development Servers..."
echo "===================================="
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing backend dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "[INFO] Installing frontend dependencies..."
    cd client
    npm install
    cd ..
fi

echo ""
echo "[INFO] Checking MongoDB connection..."
echo "Make sure MongoDB is running on your system!"
echo ""

# Start backend server in background
echo "[INFO] Starting Backend Server on http://localhost:5000"
node server.js &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "[INFO] Starting Frontend on http://localhost:3000"
cd client
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "===================================="
echo "  Servers are running!"
echo "===================================="
echo ""
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "  Backend PID:  $BACKEND_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "  Press Ctrl+C to stop all servers"
echo "===================================="
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID
    echo "Servers stopped."
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for user to press Ctrl+C
wait
