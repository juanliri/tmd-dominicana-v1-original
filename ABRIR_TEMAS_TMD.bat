@echo off
title TMD Dominicana - Selector de Temas Web (V1, V2, V3)
color 0B
cls
echo =========================================================================
echo       TECNOMAQUINARIAS DIESEL S.R.L. (TMD) - COMPARADOR DE TEMAS 2026
echo =========================================================================
echo.
echo  Seleccione la version que desea abrir en su navegador:
echo.
echo  [1] VERSION 1: Tema Dinamico Original (React / Vite + Video + Staff)
echo  [2] VERSION 2: Tema Google Stitch (Industrial High-Tech / Telemetria)
echo  [3] VERSION 3: Tema HIBRIDO MASTER (Lo mejor de V1 + V2 Stitch)
echo  [4] Estrategia Comercial ^& Playbook de Negociacion (Desktop)
echo  [5] Dossier Ejecutivo 720 (Matriz de 3 Niveles ^& MSA)
echo  [6] Abrir las 3 Versiones (V1, V2 y V3) en Pestanas Separadas
echo  [7] Salir
echo.
echo =========================================================================
set /p opt="Ingrese su opcion (1-7) [Defecto: 3]: "

if "%opt%"=="" set opt=3
if "%opt%"=="1" goto opt1
if "%opt%"=="2" goto opt2
if "%opt%"=="3" goto opt3
if "%opt%"=="4" goto opt4
if "%opt%"=="5" goto opt5
if "%opt%"=="6" goto opt6
if "%opt%"=="7" goto fin

:opt1
start "" "%~dp0index.html"
goto fin

:opt2
start "" "%~dp0theme_v2_stitch\index.html"
goto fin

:opt3
start "" "%~dp0theme_v3_hybrid\index.html"
goto fin

:opt4
start "" "C:\Users\TDBuild\Desktop\estrategia_comercial.html"
goto fin

:opt5
start "" "%~dp0dossier.html"
goto fin

:opt6
start "" "%~dp0index.html"
start "" "%~dp0theme_v2_stitch\index.html"
start "" "%~dp0theme_v3_hybrid\index.html"
goto fin

:fin
exit
