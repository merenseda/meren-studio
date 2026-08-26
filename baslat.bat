@echo off
title Meren Studio Baslatiliyor...
cd /d "%~dp0"
if "%~1"=="" (
    npx electron .
) else (
    npx electron . "%~1"
)
