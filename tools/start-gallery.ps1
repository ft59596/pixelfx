param(
    [switch]$NoBrowser
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot

function Test-PixelFxGallery([int]$Port) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/package.json" -UseBasicParsing -TimeoutSec 1
        $package = $response.Content | ConvertFrom-Json
        if ($package.name -ne 'pixelfx') { return $false }
        $page = Invoke-WebRequest -Uri "http://localhost:$Port/gallery/" -UseBasicParsing -TimeoutSec 1
        return ($page.StatusCode -eq 200 -and $page.Content -match 'id="grid"')
    } catch { return $false }
}

try {
    if (!(Test-Path -LiteralPath (Join-Path $projectRoot 'tools\serve.mjs'))) {
        throw '找不到 tools\serve.mjs，请将启动文件保留在 pixelfx 项目中。'
    }
    $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    $nodePath = if ($nodeCommand) { $nodeCommand.Source } else { $null }
    if (!$nodePath) {
        foreach ($candidate in @('E:\Program Files\nodejs\node.exe', "$env:ProgramFiles\nodejs\node.exe")) {
            if (Test-Path -LiteralPath $candidate) { $nodePath = $candidate; break }
        }
    }
    if (!$nodePath) { throw '未找到 Node.js。请安装 Node.js 18 或更高版本后重试。' }

    $chosenPort = $null
    foreach ($port in 8080..8090) {
        if (Test-PixelFxGallery $port) { $chosenPort = $port; break }
        # Skip ports occupied by another application.
        $probe = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
        try { $probe.Start() } catch { continue } finally { $probe.Stop() }
        $logDir = Join-Path $projectRoot 'work'
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        $serverScript = Join-Path $projectRoot 'tools\serve.mjs'
        $server = Start-Process -FilePath $nodePath -ArgumentList @(('"{0}"' -f $serverScript), "$port") -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDir "gallery-$port.log") -RedirectStandardError (Join-Path $logDir "gallery-$port-error.log") -PassThru
        for ($attempt = 0; $attempt -lt 40; $attempt++) {
            if (Test-PixelFxGallery $port) { $chosenPort = $port; break }
            if ($server.HasExited) { break }
            Start-Sleep -Milliseconds 250
        }
        if ($chosenPort) { break }
        # Only stop the process launched by this attempt if it failed to become ready.
        if (!$server.HasExited) { $server.Kill() }
    }
    if (!$chosenPort) { throw '画廊启动失败，8080 至 8090 端口均不可用，或服务未能启动。请查看 work 目录中的 gallery 日志。' }
    $url = "http://localhost:$chosenPort/gallery/"
    if (!$NoBrowser) { Start-Process $url }
    Write-Output "画廊已就绪：$url"
} catch {
    if ($NoBrowser) { throw }
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'pixelfx 启动失败', 'OK', 'Error') | Out-Null
    exit 1
}
