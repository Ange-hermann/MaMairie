@echo off
echo ========================================
echo    MAMAIRIE - Lancement de l'application
echo ========================================
echo.

REM Vérifier si .env.local existe
if not exist .env.local (
    echo [ERREUR] Le fichier .env.local n'existe pas !
    echo.
    echo Veuillez creer le fichier .env.local avec vos cles Supabase.
    echo Consultez le fichier SETUP_ENV.txt pour plus d'informations.
    echo.
    pause
    exit /b 1
)

echo [OK] Fichier .env.local trouve
echo.

REM Vérifier si node_modules existe
if not exist node_modules (
    echo [INFO] Installation des dependances...
    call npm install
    echo.
)

echo [INFO] Demarrage de l'application...
echo.
echo L'application sera accessible sur : http://localhost:3000
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

call npm run dev

pause
