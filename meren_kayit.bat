@echo off
:: Meren Studio - Windows .hrav Dosya Iliskilendirme Scripti
echo ========================================================
echo   .HRAV DOSYA UZANTISI WINDOWS KAYIT ISLEMI
echo ========================================================
echo.

set APP_EXE=%~dp0MerenStudio.exe

echo 1. .hrav uzantisi Meren Studio ile iliskilendiriliyor...
assoc .hrav=MerenStudioHravDoc >nul 2>&1
ftype MerenStudioHravDoc="%APP_EXE%" "%%1" >nul 2>&1

echo.
echo [BASARILI] Artik herhangi bir .hrav dosyasina cift tiklandiginda
echo           otomatik olarak Meren Studio acilacaktir!
echo.
pause
