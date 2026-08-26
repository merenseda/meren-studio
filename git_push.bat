@echo off
title GitHub Push - Meren Studio
cd /d "%~dp0"
set PATH=%USERPROFILE%\.git-portable\cmd;%PATH%

echo ========================================================
echo   MEREN STUDIO - GITHUB SENKRONIZASYON (PUSH)
echo ========================================================
echo.
git status
echo.
set /p msg="Commit mesaji girin (veya Enter'a basin): "
if "%msg%"=="" set msg=Update Meren Studio

git add .
git commit -m "%msg%"
echo.
echo GitHub'a gonderiliyor (https://github.com/merenseda/meren-studio.git)...
git push -u origin main

echo.
echo ========================================================
echo   ISLEM TAMAMLANDI
echo ========================================================
pause
