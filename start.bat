@echo off

start "Resume Builder Backend" powershell -NoExit -Command "Set-Location '%~dp0backend'; npm start"

start "Resume Builder Frontend" powershell -NoExit -Command "Set-Location '%~dp0resume-builder-frontend'; npm start"

exit