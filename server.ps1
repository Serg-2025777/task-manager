# server.ps1 - minimal HTTP listener for task manager
$port = 8080
$root = if ($PSScriptRoot) { $PSScriptRoot } else { $PWD.Path }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server started on http://localhost:$port"
Write-Host "Root: $root"
Write-Host "Press Ctrl+C to stop`n"

$mime = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "text/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".csv"  = "text/csv; charset=utf-8"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $ctx = $listener.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response
        $url = $req.Url.AbsolutePath
        $method = $req.HttpMethod

        try {
            # API endpoint
            if ($url -like "/api/*") {
                if ($url -eq "/api/data") {
                    if ($method -eq "GET") {
                        $file = Join-Path $root "data.json"
                        if (Test-Path $file) {
                            $bytes = [IO.File]::ReadAllBytes($file)
                            $res.ContentType = "application/json; charset=utf-8"
                            $res.OutputStream.Write($bytes, 0, $bytes.Length)
                        }
                        else {
                            $res.StatusCode = 404
                        }
                    }
                    elseif ($method -eq "POST") {
                        $reader = New-Object IO.StreamReader($req.InputStream, [Text.Encoding]::UTF8)
                        $body = $reader.ReadToEnd()
                        $reader.Close()

                        $file = Join-Path $root "data.json"
                        $utf8NoBom = New-Object Text.UTF8Encoding $false
                        [IO.File]::WriteAllText($file, $body, $utf8NoBom)

                        $ok = '{"ok":true}'
                        $bytes = [Text.Encoding]::UTF8.GetBytes($ok)
                        $res.ContentType = "application/json; charset=utf-8"
                        $res.OutputStream.Write($bytes, 0, $bytes.Length)
                    }
                    else {
                        $res.StatusCode = 405
                    }
                }
                else {
                    $res.StatusCode = 404
                }
            }
            # Static files
            else {
                if ($url -eq "/") { $url = "/index.html" }
                $path = $url -replace "^/", ""
                $path = [Uri]::UnescapeDataString($path)
                $file = Join-Path $root $path

                if (Test-Path $file -PathType Leaf) {
                    $ext = [IO.Path]::GetExtension($file).ToLower()
                    $ct = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
                    $bytes = [IO.File]::ReadAllBytes($file)
                    $res.ContentType = $ct
                    $res.OutputStream.Write($bytes, 0, $bytes.Length)
                }
                else {
                    $res.StatusCode = 404
                    $msg = [Text.Encoding]::UTF8.GetBytes("404: $url")
                    $res.OutputStream.Write($msg, 0, $msg.Length)
                }
            }
        }
        catch {
            Write-Host "Request error: $($_.Exception.Message)"
            $res.StatusCode = 500
        }
        finally {
            $res.Close()
        }
    }
}
finally {
    $listener.Stop()
    Write-Host "`nServer stopped."
}
