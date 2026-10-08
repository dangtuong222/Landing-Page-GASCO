Set-Location -LiteralPath $PSScriptRoot
if (-not (Test-Path -LiteralPath '.env')) {
    Write-Error 'Tao .env tu .env.example va dien GEMINI_API_KEY truoc khi chay.'
    exit 1
}
if (-not (Test-Path -LiteralPath '.knowledge/index.json')) {
    Write-Error 'Chua co kho kien thuc. Chay scripts/ingest.py theo huong dan README truoc.'
    exit 1
}
$chatNode = Get-Command node -ErrorAction SilentlyContinue
if ($chatNode) {
    & $chatNode.Source --env-file=.env server/index.mjs
} else {
    $chatBundledNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
    if (-not (Test-Path -LiteralPath $chatBundledNode)) {
        Write-Error 'Can Node.js 22 tro len.'
        exit 1
    }
    & $chatBundledNode --env-file=.env server/index.mjs
}
