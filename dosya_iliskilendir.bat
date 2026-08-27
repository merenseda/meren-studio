@echo off
chcp 65001 > nul
echo ========================================================
echo   Meren Studio & Viewer Windows Dosya Iliskilendirme
echo ========================================================
echo.
echo Bu betik .meren ve .hrav uzantili dosyalari Meren Viewer
echo ve Meren Studio ile acilacak sekilde iliskilendirir.
echo.

set CURRENT_DIR=%~dp0
set VIEWER_BAT=%CURRENT_DIR%baslat_viewer.bat
set STUDIO_BAT=%CURRENT_DIR%baslat.bat

:: .meren uzantisi icin
assoc .meren=Meren.Document > nul 2>&1
ftype Meren.Document="%VIEWER_BAT%" "%%1" > nul 2>&1

:: .hrav uzantisi icin
assoc .hrav=Hrav.Document > nul 2>&1
ftype Hrav.Document="%VIEWER_BAT%" "%%1" > nul 2>&1

echo [OK] .meren ve .hrav dosya iliskilendirmeleri basariyla tamamlandi!
echo Artik .meren veya .hrav dosyalarina cift tikladiginizda Meren Viewer ile acilacaktir.
echo.
pause
