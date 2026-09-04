<#
  Servidor HTTP estatico simples para pre-visualizar a plataforma
  "Rota dos Celulares 66", sem depender de Node.js, Python ou privilegios de administrador.

  Uso:
    powershell -ExecutionPolicy Bypass -File .\server.ps1
    Depois acesse http://localhost:5566/ (neste computador)
    ou http://<seu-ip-local>:5566/ (de outro celular/computador na mesma rede Wi-Fi)

  Usa TcpListener (socket bruto) em vez de HttpListener porque o HttpListener
  do Windows exige privilegio de administrador para aceitar conexoes vindas
  de fora do proprio computador (bind em "+" ou em um IP de rede).
#>

$port = 5566
$root = $PSScriptRoot

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg"  = "image/svg+xml"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".ico"  = "image/x-icon"
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$listener.Start()

$lanIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "169.*" -and $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1 -ExpandProperty IPAddress)

Write-Host "Rota dos Celulares 66 - servindo $root"
Write-Host "Neste computador: http://localhost:$port/"
if ($lanIp) { Write-Host "De outro dispositivo na mesma rede Wi-Fi: http://$($lanIp):$port/" }
Write-Host "(Se o Windows perguntar sobre o Firewall, clique em Permitir para redes privadas)"
Write-Host "Pressione Ctrl+C para parar."

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII)
    $requestLine = $reader.ReadLine()
    while (-not [string]::IsNullOrEmpty($reader.ReadLine())) { } # descarta os headers

    $localPath = "/index.html"
    if ($requestLine -match '^(GET|HEAD)\s+(\S+)\s+HTTP') {
      $localPath = $Matches[2]
      if ($localPath -eq "/") { $localPath = "/index.html" }
      $localPath = $localPath.Split("?")[0]
    }

    $relativePath = [System.Uri]::UnescapeDataString($localPath).TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
    $filePath = Join-Path $root $relativePath

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $contentType = $mimeTypes[$ext]
      if (-not $contentType) { $contentType = "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
    } else {
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 - arquivo nao encontrado: $localPath")
      $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
    }

    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush()
  } catch {
    # conexao encerrada pelo cliente ou request invalido - ignora e segue
  } finally {
    $client.Close()
  }
}
