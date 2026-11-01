@echo off
setlocal
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\start-gallery.ps1"
if errorlevel 1 pause
endlocal
