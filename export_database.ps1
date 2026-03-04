# Database Export Script
# This script exports the cricket_academy_db database to a SQL file

# Try both possible paths
$mysqldumpXAMPP = "C:\xampp\mysql\bin\mysqldump.exe"
$mysqldumpMySQL = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"

$mysqldumpPath = $null
if (Test-Path $mysqldumpMySQL) {
    $mysqldumpPath = $mysqldumpMySQL
    Write-Host "Using MySQL Server installation" -ForegroundColor Cyan
} elseif (Test-Path $mysqldumpXAMPP) {
    $mysqldumpPath = $mysqldumpXAMPP
    Write-Host "Using XAMPP installation" -ForegroundColor Cyan
} else {
    Write-Host "Error: mysqldump.exe not found!" -ForegroundColor Red
    exit
}

$user = "root"
$password = "Uditha@2004"
$port = "3307"
$dbHost = "127.0.0.1"
$database = "cricket_academy_db"
$outputFile = "cricket_academy_backup.sql"

Write-Host "Starting database export..." -ForegroundColor Green
Write-Host "Database: $database" -ForegroundColor Yellow
Write-Host "Output file: $outputFile" -ForegroundColor Yellow

# Execute mysqldump with default-auth parameter to avoid plugin errors
$ErrorActionPreference = "Continue"
& $mysqldumpPath -u $user -p"$password" -P $port --host=$dbHost --default-auth=mysql_native_password $database 2>&1 | Out-File -FilePath $outputFile -Encoding utf8

if (Test-Path $outputFile) {
    $fileSize = (Get-Item $outputFile).Length
    if ($fileSize -gt 100) {
        Write-Host "`nDatabase exported successfully!" -ForegroundColor Green
        Write-Host "File: $outputFile" -ForegroundColor Cyan
        Write-Host "Size: $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Cyan
        Write-Host "Location: $(Resolve-Path $outputFile)" -ForegroundColor Cyan
    } else {
        Write-Host "`nWarning: Export file is very small, there may have been an error." -ForegroundColor Yellow
        Write-Host "Check the file for error messages." -ForegroundColor Yellow
    }
} else {
    Write-Host "`nExport failed!" -ForegroundColor Red
}
