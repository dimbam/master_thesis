@echo off
@REM echo Starting Docker Desktop...
@REM start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
@REM echo Waiting for Docker to finish starting...

@REM REM Wait using PowerShell until "docker info" works
@REM powershell -Command "while (-not (docker info 2>$null)) { Start-Sleep -Seconds 2 }"

@REM echo Docker is ready. Starting containers...
@REM start bash -c "cd /C/Users/bamdi/Documents/Projects/thesis_blockchain/blockchain-app/ && sudo docker compose up -d"
@REM echo Containers started...
@REM timeout /t 10 > nul

echo Starting db1-service...
start cmd /k "cd /d C:\Users\bamdi\Documents\Projects\thesis_blockchain\blockchain-app\services\db1-service && node index.js"
timeout /t 5 > nul

echo Starting db2-service...
start cmd /k "cd /d C:\Users\bamdi\Documents\Projects\thesis_blockchain\blockchain-app\services\db2-service && node index.js"
timeout /t 5 > nul

echo Starting db3-service...
start cmd /k "cd /d C:\Users\bamdi\Documents\Projects\thesis_blockchain\blockchain-app\services\db3-service && node index.js"
timeout /t 10 > nul

echo Starting the gateway...
start cmd /k "cd /d C:\Users\bamdi\Documents\Projects\thesis_blockchain\blockchain-app\gateway && node gateway.js"
timeout /t 8 > nul

echo Starting the form frontend...
start cmd /k "cd /d C:\Users\bamdi\Documents\Projects\thesis_blockchain\blockchain-app && npm run dev"
timeout /t 2 > nul

echo Starting the server...
start cmd /k "cd /d C:\Users\bamdi\Documents\Projects\thesis_blockchain\blockchain-app\server && node server.js"

echo All services launched. Windows should open multiple terminals.
