@echo off
echo.
echo   BazaarX MERN Setup (Windows)
echo   ==============================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org
  pause
  exit /b 1
)
echo [OK] Node.js found

where npm >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] npm not found.
  pause
  exit /b 1
)
echo [OK] npm found

echo.
echo Step 1: Setting up .env...
if not exist "server\.env" (
  copy "server\.env.example" "server\.env" >nul
  echo [OK] Created server\.env — open it and set MONGO_URI + JWT_SECRET
) else (
  echo [OK] server\.env already exists
)

echo.
echo Step 2: Installing dependencies (this may take a minute)...
call npm install --silent
cd server
call npm install --silent
cd ..
cd client
call npm install --silent
cd ..
echo [OK] All dependencies installed

echo.
echo Step 3: Seeding database...
cd server
call node seed.js
cd ..

echo.
echo ==============================
echo   Setup Complete!
echo ==============================
echo.
echo   Start the app:  npm run dev
echo.
echo   Frontend:       http://localhost:3000
echo   Backend API:    http://localhost:5000/api
echo.
echo   Demo Accounts:
echo   Admin      -  admin@demo.com    / admin123
echo   Vendor     -  vendor@demo.com   / vendor123
echo   Customer   -  customer@demo.com / cust123
echo.
pause
