# Stop all node processes on ports 3001 and 5173
Write-Host "Stopping existing servers..."

$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($port3001) {
    Stop-Process -Id $port3001 -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped process on port 3001"
}

if ($port5173) {
    Stop-Process -Id $port5173 -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped process on port 5173"
}

Write-Host "Starting fresh dev servers..."
npm run dev

