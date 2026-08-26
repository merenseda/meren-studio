@echo off
:: Meren Studio - Windows Dosya Iliskilendirme Scripti
:: Bu script .meren uzantisini Meren Studio ile iliskilendirir.
echo ========================================================
echo   .MEREN DOSYA UZANTISI WINDOWS KAYIT ISLEMI
echo ========================================================
echo.

set APP_DIR=%~dp0
set LAUNCHER=%APP_DIR%baslat.bat

echo 1. .meren uzantisi kayit defterine ekleniyor...
assoc .meren=MerenStudioDocument >nul 2>&1
ftype MerenStudioDocument="%LAUNCHER%" "%%1" >nul 2>&1

echo.
echo [BASARILI] Artik herhangi bir .meren dosyasina cift tiklandiginda
echo           otomatik olarak Meren Studio acilacaktir!
echo.
pause
