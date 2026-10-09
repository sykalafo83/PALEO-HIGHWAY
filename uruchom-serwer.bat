@echo off
rem Uruchamia lokalny serwer gry i otwiera ją w przeglądarce (tryb offline + instalacja jako aplikacja).
cd /d "%~dp0"
start "" http://localhost:8080
node tools\serve.mjs 8080
