#requires -Version 5.1
# Agent Cookie Sync, step 1 of the install on Windows.
# Copies the extension and the native host into your local app data folder
# and writes the launcher the host needs. Nothing is registered yet.
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Join-Path $env:LOCALAPPDATA 'AgentCookieSync'
$ext = Join-Path $root 'extension'
$hostDir = Join-Path $root 'native-host'
New-Item -ItemType Directory -Force -Path $ext, $hostDir | Out-Null
Copy-Item -Force (Join-Path $here 'extension\*') $ext
Copy-Item -Force (Join-Path $here 'native-host\cookie_sync_host.py') $hostDir

$python = $null
foreach ($name in @('python', 'python3', 'py')) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { $python = $cmd.Source; break }
}
if (-not $python) {
  throw 'Python 3 was not found on PATH. Install it from python.org, tick "Add to PATH", then run this script again.'
}

$pyHost = Join-Path $hostDir 'cookie_sync_host.py'
$launcher = Join-Path $hostDir 'cookie_sync_host.bat'
$lines = @('@echo off', ('"' + $python + '" "' + $pyHost + '"'))
Set-Content -Path $launcher -Value $lines -Encoding ASCII

Write-Host ''
Write-Host '[agent-cookie-sync] Extension folder:   ' $ext
Write-Host '[agent-cookie-sync] Native host folder: ' $hostDir
Write-Host ''
Write-Host 'NEXT, one time in Chrome:'
Write-Host '  1. Open chrome://extensions'
Write-Host '  2. Turn on Developer mode (top right)'
Write-Host '  3. Load unpacked, and pick this folder:'
Write-Host ('       ' + $ext)
Write-Host '  4. Copy the extension ID shown on its card, then run:'
Write-Host ('       powershell -ExecutionPolicy Bypass -File "' + (Join-Path $here 'Register-NativeHost.ps1') + '" -ExtensionId <ID>')
