@echo off
echo.
echo ========================================
echo    Green Karma - Starting Application
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "blockchain\node_modules" (
    echo Installing blockchain dependencies...
    cd blockchain
    call npm install
    cd ..
    echo.
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo.
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install --legacy-peer-deps
    cd ..
    echo.
)

echo All dependencies ready!
echo.

REM Start blockchain
echo [1/4] Starting blockchain node...
cd blockchain
start "Blockchain" cmd /k "npx hardhat node"
cd ..

echo Waiting for blockchain to start (15 seconds)...
timeout /t 15 /nobreak >nul

REM Deploy contracts
echo [2/4] Deploying smart contracts...
cd blockchain
call npx hardhat run scripts/deploy.js --network localhost
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Contract deployment failed!
    echo Make sure the blockchain window is running.
    pause
    exit /b 1
)
cd ..

REM Start backend
echo [3/4] Starting backend...
cd backend
start "Backend" cmd /k "npm run dev"
cd ..

timeout /t 3 /nobreak >nul

REM Start frontend
echo [4/4] Starting frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo    Green Karma is running!
echo ========================================
echo.
echo    Frontend:   http://localhost:3000
echo    Backend:    http://localhost:5000
echo    Blockchain: http://localhost:8545
echo.
echo Opening browser in 10 seconds...
timeout /t 10 /nobreak >nul

start http://localhost:3000

echo.
echo Close the 3 terminal windows to stop.
pause
