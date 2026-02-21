@echo off
echo.
echo ====================================
echo   CDS Mock Test Platform
echo   Starting Development Servers...
echo ====================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing backend dependencies...
    call npm install
)

if not exist "client\node_modules\" (
    echo [INFO] Installing frontend dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo [INFO] Checking MongoDB connection...
echo Make sure MongoDB is running on your system!
echo.

REM Start backend server in a new terminal
echo [INFO] Starting Backend Server on http://localhost:5000
start "CDS Backend Server" cmd /k "node server.js"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new terminal
echo [INFO] Starting Frontend on http://localhost:3000
cd client
start "CDS Frontend Server" cmd /k "npm start"
cd ..

echo.
echo ====================================
echo   Servers are starting...
echo ====================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo   Press Ctrl+C in each terminal to stop
echo ====================================
echo.

pause
