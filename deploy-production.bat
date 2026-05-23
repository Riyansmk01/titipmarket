@echo off
REM Production Deployment Script untuk TitipMart (Windows)
REM Usage: deploy-production.bat

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo TitipMart Production Deployment Script
echo ==========================================
echo.

REM Variables
set DEPLOY_DIR=C:\App\titipmart
set APP_NAME=titipmart
set NODE_ENV=production
set PORT=3000

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo + Node.js version: %NODE_VERSION%
echo + npm version: %NPM_VERSION%
echo.

REM Create deploy directory
if not exist "%DEPLOY_DIR%" (
    echo o Creating deployment directory: %DEPLOY_DIR%
    mkdir "%DEPLOY_DIR%"
)

echo o Navigating to: %DEPLOY_DIR%
cd /d "%DEPLOY_DIR%" || (
    echo X Failed to navigate to deployment directory
    exit /b 1
)

REM Install dependencies
echo o Installing production dependencies...
call npm ci --production
if %ERRORLEVEL% NEQ 0 (
    echo X npm install failed
    exit /b 1
)

REM Build application
echo o Building production bundle...
set NODE_ENV=production
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo X Build failed
    exit /b 1
)

REM Verify build output
echo.
echo + Verifying build output...
if exist "dist\server.cjs" if exist "dist\index.html" (
    echo + Build successful
) else (
    echo X Build failed - missing required files
    exit /b 1
)

REM Setup PM2
echo.
echo o Setting up PM2...
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo o Installing PM2...
    call npm install -g pm2
)

REM Stop existing process
call pm2 stop "%APP_NAME%" 2>nul
call pm2 delete "%APP_NAME%" 2>nul

REM Start application
echo o Starting application...
call pm2 start dist\server.cjs ^
    --name "%APP_NAME%" ^
    --env NODE_ENV=%NODE_ENV% ^
    --env PORT=%PORT% ^
    --instances 1 ^
    --exec-mode fork ^
    --watch false

REM Save PM2 configuration
call pm2 save
call pm2 startup

echo.
echo ==========================================
echo + Deployment Complete!
echo ==========================================
echo.
echo Application is running on port: %PORT%
echo.
echo Commands:
echo   View logs:      pm2 logs %APP_NAME%
echo   Monitor:        pm2 monit
echo   Status:         pm2 status
echo   Restart:        pm2 restart %APP_NAME%
echo.
echo Configure Nginx/IIS to proxy requests to localhost:%PORT%
echo ==========================================
echo.

pause
