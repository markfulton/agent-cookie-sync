# Request an immediate cookie export from Agent Cookie Sync.
# The extension polls this flag about once a minute via the native host.
$ErrorActionPreference = "Stop"
$outDir = if ($env:LOCALAPPDATA) {
  Join-Path $env:LOCALAPPDATA "AgentCookieSync"
} else {
  Join-Path $HOME ".agentcookiesync"
}
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$flag = Join-Path $outDir "sync-request.flag"
Set-Content -Path $flag -Value ((Get-Date).ToUniversalTime().ToString("o")) -Encoding ascii
Write-Host "Requested sync: $flag"
Write-Host "Extension should export within ~1 minute if Chrome is running."
