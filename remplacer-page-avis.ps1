# Script PowerShell pour remplacer la page avis-mentions

$source = "C:\Users\Angeh\OneDrive\Bureau\MaMairie\COPIER_COLLER_PAGE_AVIS_MENTION.txt"
$destination = "C:\Users\Angeh\OneDrive\Bureau\MaMairie\app\agent\avis-mentions\page.tsx"

# Lire le contenu du fichier source
$content = Get-Content -Path $source -Raw

# Écrire dans le fichier destination
Set-Content -Path $destination -Value $content

Write-Host "✅ Fichier remplacé avec succès !" -ForegroundColor Green
Write-Host "📄 Fichier: $destination" -ForegroundColor Cyan
