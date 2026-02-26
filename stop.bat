@echo off
echo ==========================================
echo Volunteer Management Platform
echo Stopping All Services...
echo ==========================================
echo.

taskkill /FI "WINDOWTITLE eq Config Server*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Discovery Server*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq User Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Event Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq Notification Service*" /T /F 2>nul
taskkill /FI "WINDOWTITLE eq API Gateway*" /T /F 2>nul

echo.
echo All services stopped successfully!
echo.
pause
