@echo off
rem Meal Roulette: build before deploy. Double-click this file, or run it in cmd.
rem   build.bat            bundle the cookbook, sync sw.js, then check everything
rem   build.bat check      only check (changes nothing)
rem   build.bat bump       build and also bump the sw.js version (after editing a font or icon)
rem   build.bat sync --add any other build.py command is passed straight through
cd /d "%~dp0"

set PY=
where python >nul 2>nul && set PY=python
if not defined PY where py >nul 2>nul && set PY=py
if not defined PY (
  echo Python was not found. Install it from python.org and tick "Add Python to PATH".
  goto :end
)

if /i "%~1"=="check" (
  %PY% build.py check
  goto :end
)
if /i "%~1"=="bump" (
  %PY% build.py build --bump
  if errorlevel 1 goto :end
  %PY% build.py check
  goto :end
)
if not "%~1"=="" (
  %PY% build.py %*
  goto :end
)

%PY% build.py build
if errorlevel 1 goto :end
echo.
%PY% build.py check

:end
echo.
pause
