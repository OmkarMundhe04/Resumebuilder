@echo off

start "Resume Builder Backend" powershell -NoExit -Command "Set-Location 'C:\Users\omkar\Desktop\res\Resumebuilder\backend'; npm start"

start "Resume Builder Frontend" powershell -NoExit -Command "Set-Location 'C:\Users\omkar\Desktop\res\Resumebuilder\resume-builder-frontend'; npm start"

exit