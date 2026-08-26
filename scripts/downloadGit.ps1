$ProgressPreference = 'SilentlyContinue'
$url = "https://github.com/git-for-windows/git/releases/download/v2.48.1.windows.1/MinGit-2.48.1-64-bit.zip"
$destDir = "$env:USERPROFILE\.git-portable"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

$zipFile = Join-Path $destDir "mingit.zip"
Write-Host "MinGit indiriliyor..."
Invoke-WebRequest -Uri $url -OutFile $zipFile
Write-Host "Arsiv cikariliyor..."
Expand-Archive -Path $zipFile -DestinationPath $destDir -Force
Remove-Item $zipFile

$gitExe = Join-Path $destDir "cmd\git.exe"
if (Test-Path $gitExe) {
    Write-Host "Git basariyla kuruldu: $gitExe"
    [Environment]::SetEnvironmentVariable("Path", $env:Path + ";$destDir\cmd", [EnvironmentVariableTarget]::User)
} else {
    Write-Host "Hata: git.exe bulunamadi."
}
