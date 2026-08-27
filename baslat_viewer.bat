@echo off
title Meren Viewer - Sifreli Dokuman Goruntuleyici
cd /d "%~dp0\viewer"
npx electron . "%~1"
