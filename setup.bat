@echo off
REM Secure and Immutable API Usage Logging System
REM Setup Script for Windows

echo.
echo 🚀 Starting API Logging System Setup...
echo.

REM Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ Node.js not found. Please install Node.js v16+
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ npm not found. Please install npm
    exit /b 1
)

echo ✓ Node.js and npm found
echo.

REM Setup environment
echo Setting up environment...
if not exist .env (
    copy .env.example .env
    echo ✓ Created .env file (EDIT with your credentials!)
) else (
    echo ! .env already exists
)
echo.

REM Setup Smart Contracts
echo Setting up Smart Contracts...
cd contracts
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%
echo ✓ Smart Contracts dependencies installed
echo.

REM Compile contracts
echo Compiling contracts...
call npx hardhat compile
if %errorlevel% neq 0 exit /b %errorlevel%
echo ✓ Smart Contracts compiled
echo.

REM Create keys directory
if not exist keys mkdir keys
echo ✓ Keys directory created
echo.

cd ..

REM Setup Backend
echo Setting up Backend...
cd backend
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%
echo ✓ Backend dependencies installed
echo.

REM Copy keys
if exist ..\contracts\keys (
    xcopy ..\contracts\keys .\ /E /I /Y >nul
)

cd ..

REM Setup Frontend
echo Setting up Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%
echo ✓ Frontend dependencies installed
echo.

REM Create frontend .env
if not exist .env (
    (
        echo REACT_APP_BACKEND_URL=http://localhost:5000
        echo REACT_APP_NETWORK=sepolia
    ) > .env
    echo ✓ Frontend .env created
)

cd ..

REM Summary
echo.
echo ═════════════════════════════════════════════════
echo ✓ Setup Complete!
echo ═════════════════════════════════════════════════
echo.
echo Next steps:
echo.
echo 1. Edit .env file with your credentials:
echo    - ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
echo    - PRIVATE_KEY=your_wallet_private_key
echo    - INFURA_IPFS_PROJECT_ID=your_id
echo    - INFURA_IPFS_PROJECT_SECRET=your_secret
echo.
echo 2. Deploy Smart Contracts:
echo    cd contracts
echo    npx hardhat run scripts/deploy.js --network sepolia
echo.
echo 3. Start Backend (Command Prompt 1):
echo    cd backend
echo    npm start
echo.
echo 4. Start Frontend (Command Prompt 2):
echo    cd frontend
echo    npm start
echo.
echo 5. Open http://localhost:3000 in browser
echo.
echo 📚 Documentation: README.md and docs/ folder
echo ⚠️  IMPORTANT: Get Sepolia ETH from https://sepoliafaucet.com/
echo.
pause
