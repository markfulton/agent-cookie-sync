#requires -Version 5.1
# Agent Cookie Sync, step 3 of the install on Windows.
# Tells Chrome where the native host lives and which extension may talk to
# it. Run it once with the extension ID from chrome://extensions.
param(
  [Parameter(Mandatory = $true)][string]$ExtensionId
)
$ErrorActionPreference = 'Stop'
$root = Join-Path $env:LOCALAPPDATA 'AgentCookieSync'
$hostDir = Join-Path $root 'native-host'
$launcher = Join-Path $hostDir 'cookie_sync_host.bat'
if (-not (Test-Path $launcher)) {
  throw 'Run Install.ps1 first: the native host launcher was not found.'
}
$manifest = Join-Path $hostDir 'com.agentopsclub.cookiesync.json'
$obj = [ordered]@{
  name = 'com.agentopsclub.cookiesync'
  description = 'Agent Cookie Sync native host'
  path = $launcher
  type = 'stdio'
  allowed_origins = @('chrome-extension://' + $ExtensionId + '/')
}
$obj | ConvertTo-Json -Depth 5 | Set-Content -Path $manifest -Encoding UTF8

$regPath = 'HKCU:\Software\Google\Chrome\NativeMessagingHosts\com.agentopsclub.cookiesync'
New-Item -Path $regPath -Force | Out-Null
Set-ItemProperty -Path $regPath -Name '(default)' -Value $manifest

Write-Host '[agent-cookie-sync] Registered the native host for extension' $ExtensionId
Write-Host '[agent-cookie-sync] Manifest:' $manifest
Write-Host ''
Write-Host 'NEXT: on chrome://extensions click the reload arrow on Agent Cookie Sync,'
Write-Host 'then click its icon in the toolbar. The badge shows the cookie count.'
Write-Host ('Your sync folder: ' + $root)
