@echo off
setlocal
cd /d "%~dp0"

set PORT=5000
set URL=http://127.0.0.1:%PORT%/

echo ======================================
echo   ViperTerm - local site launcher
echo ======================================
echo.

where py >nul 2>nul
if %errorlevel%==0 goto run_py

where python >nul 2>nul
if %errorlevel%==0 goto run_python

echo Python not found.
echo Install Python 3 and make sure it is added to PATH.
echo.
pause
exit /b 1

:run_py
echo Starting local server on %URL%
start "" %URL%
py -m http.server %PORT%
exit /b %errorlevel%

:run_python
echo Starting local server on %URL%
start "" %URL%
python -m http.server %PORT%
exit /b %errorlevel%
