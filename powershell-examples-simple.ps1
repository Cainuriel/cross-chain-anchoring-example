# PowerShell GET y POST - Ejemplos Practicos
# Guia completa para hacer peticiones HTTP desde PowerShell

$baseUrl = "http://localhost:3000"

Write-Host "EJEMPLOS DE POWERSHELL - GET Y POST" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# EJEMPLOS DE GET REQUESTS
# ============================================================================

Write-Host "EJEMPLOS DE GET REQUESTS" -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Yellow

# 1. GET Basico - Health Check
Write-Host "1. GET Basico - Health Check" -ForegroundColor Green
Write-Host "Comando:" -ForegroundColor Gray
Write-Host '   Invoke-RestMethod -Uri "http://localhost:3000/health"' -ForegroundColor White
Write-Host "Ejecutando..." -ForegroundColor Gray
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health"
    Write-Host "Respuesta exitosa:" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
    Write-Host "   Timestamp: $($health.timestamp)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2. GET con parametros en URL
Write-Host "2. GET con parametros en URL - Latest Block" -ForegroundColor Green
Write-Host "Comando:" -ForegroundColor Gray
Write-Host '   Invoke-RestMethod -Uri "http://localhost:3000/api/block/alastria/latest" -Method GET' -ForegroundColor White
Write-Host "Ejecutando..." -ForegroundColor Gray
try {
    $block = Invoke-RestMethod -Uri "$baseUrl/api/block/alastria/latest" -Method GET
    Write-Host "Respuesta exitosa:" -ForegroundColor Green
    Write-Host "   Network: $($block.network)" -ForegroundColor White
    Write-Host "   Block Number: $($block.blockNumber)" -ForegroundColor White
    Write-Host "   Block Hash: $($block.blockHash.Substring(0,10))..." -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. GET con headers personalizados
Write-Host "3. GET con headers personalizados" -ForegroundColor Green
Write-Host "Comando:" -ForegroundColor Gray
Write-Host '$headers = @{ "User-Agent" = "PowerShell-Test"; "Accept" = "application/json" }' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/networks" -Headers $headers' -ForegroundColor White
Write-Host "Ejecutando..." -ForegroundColor Gray
try {
    $headers = @{
        "User-Agent" = "PowerShell-Test"
        "Accept" = "application/json"
    }    $networks = Invoke-RestMethod -Uri "$baseUrl/api/networks" -Headers $headers
    Write-Host "Respuesta exitosa:" -ForegroundColor Green
    Write-Host "   Networks disponibles: $($networks.Keys.Count)" -ForegroundColor White
    foreach ($networkName in $networks.Keys) {
        $network = $networks[$networkName]
        Write-Host "   - $($network.name): $($network.status)" -ForegroundColor White
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================================================
# EJEMPLOS DE POST REQUESTS
# ============================================================================

Write-Host "EJEMPLOS DE POST REQUESTS" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

# 4. POST con JSON body (string literal)
Write-Host "4. POST con JSON body (string literal)" -ForegroundColor Green
Write-Host "Comando:" -ForegroundColor Gray
Write-Host '$body = ''{"network1": "amoy", "network2": "alastria"}''' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "URL" -Method POST -ContentType "application/json" -Body $body' -ForegroundColor White
Write-Host "Ejecutando anclaje..." -ForegroundColor Gray
try {
    $body = '{"network1": "amoy", "network2": "alastria"}'
    $result = Invoke-RestMethod -Uri "$baseUrl/api/anchor/amoy/alastria" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Anclaje exitoso:" -ForegroundColor Green
    Write-Host "   From: $($result.from)" -ForegroundColor White
    Write-Host "   To: $($result.to)" -ForegroundColor White
    Write-Host "   Status: $($result.status)" -ForegroundColor White
    Write-Host "   Transaction Hash: $($result.transactionHash.Substring(0,10))..." -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 5. POST con JSON body (desde hashtable)
Write-Host "5. POST con JSON body (desde hashtable)" -ForegroundColor Green
Write-Host "Comando:" -ForegroundColor Gray
Write-Host '$data = @{ network1 = "alastria"; network2 = "amoy"; interval = "*/10 * * * *" }' -ForegroundColor White
Write-Host '$body = $data | ConvertTo-Json' -ForegroundColor White
Write-Host 'Invoke-RestMethod -Uri "URL" -Method POST -ContentType "application/json" -Body $body' -ForegroundColor White
Write-Host "Ejecutando..." -ForegroundColor Gray
try {
    $data = @{
        network1 = "alastria"
        network2 = "amoy"
        interval = "*/10 * * * *"
    }
    $body = $data | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "$baseUrl/api/automation/start" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Automatizacion iniciada:" -ForegroundColor Green
    Write-Host "   Message: $($result.message)" -ForegroundColor White
    Write-Host "   Networks: $($result.networks -join ', ')" -ForegroundColor White
    Write-Host "   Interval: $($result.interval)" -ForegroundColor White
    Write-Host "   Status: $($result.status)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 6. POST sin body
Write-Host "6. POST sin body" -ForegroundColor Green
Write-Host "Comando:" -ForegroundColor Gray
Write-Host 'Invoke-RestMethod -Uri "http://localhost:3000/api/automation/stop" -Method POST' -ForegroundColor White
Write-Host "Ejecutando..." -ForegroundColor Gray
try {
    $result = Invoke-RestMethod -Uri "$baseUrl/api/automation/stop" -Method POST
    Write-Host "Automatizacion detenida:" -ForegroundColor Green
    Write-Host "   Message: $($result.message)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================================================
# TECNICAS AVANZADAS
# ============================================================================

Write-Host "TECNICAS AVANZADAS" -ForegroundColor Yellow
Write-Host "------------------" -ForegroundColor Yellow

# 7. Manejo de errores con Invoke-WebRequest
Write-Host "7. Manejo de errores con Invoke-WebRequest" -ForegroundColor Green
Write-Host "Comando:" -ForegroundColor Gray
Write-Host 'try { $response = Invoke-WebRequest -Uri "URL/nonexistent" } catch { Write-Host "Status: $($_.Exception.Response.StatusCode)" }' -ForegroundColor White
Write-Host "Ejecutando..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/nonexistent" -Method GET
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Error Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   Ruta no encontrada (como era esperado)" -ForegroundColor Yellow
    }
}
Write-Host ""

# 8. Headers de respuesta
Write-Host "8. Inspeccionar headers de respuesta" -ForegroundColor Green
Write-Host "Comando:" -ForegroundColor Gray
Write-Host '$response = Invoke-WebRequest -Uri "http://localhost:3000/health"' -ForegroundColor White
Write-Host '$response.Headers' -ForegroundColor White
Write-Host "Ejecutando..." -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health"
    Write-Host "Headers de respuesta:" -ForegroundColor Green
    Write-Host "   Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor White
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "   Status Description: $($response.StatusDescription)" -ForegroundColor White
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# ============================================================================
# RESUMEN DE COMANDOS UTILES
# ============================================================================

Write-Host "RESUMEN DE COMANDOS UTILES" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "GET Basico:" -ForegroundColor Yellow
Write-Host '   Invoke-RestMethod -Uri "URL"' -ForegroundColor White
Write-Host ""
Write-Host "GET con headers:" -ForegroundColor Yellow
Write-Host '   $headers = @{ "Key" = "Value" }' -ForegroundColor White
Write-Host '   Invoke-RestMethod -Uri "URL" -Headers $headers' -ForegroundColor White
Write-Host ""
Write-Host "POST con JSON:" -ForegroundColor Yellow
Write-Host '   $body = ''{"key": "value"}''' -ForegroundColor White
Write-Host '   Invoke-RestMethod -Uri "URL" -Method POST -ContentType "application/json" -Body $body' -ForegroundColor White
Write-Host ""
Write-Host "POST desde hashtable:" -ForegroundColor Yellow
Write-Host '   $data = @{ key = "value" }' -ForegroundColor White
Write-Host '   $body = $data | ConvertTo-Json' -ForegroundColor White
Write-Host '   Invoke-RestMethod -Uri "URL" -Method POST -ContentType "application/json" -Body $body' -ForegroundColor White
Write-Host ""
Write-Host "Manejo de errores:" -ForegroundColor Yellow
Write-Host '   try { $result = Invoke-RestMethod -Uri "URL" } catch { Write-Host $_.Exception.Message }' -ForegroundColor White
Write-Host ""
Write-Host "Headers de respuesta:" -ForegroundColor Yellow
Write-Host '   $response = Invoke-WebRequest -Uri "URL"' -ForegroundColor White
Write-Host '   $response.StatusCode' -ForegroundColor White
Write-Host '   $response.Headers' -ForegroundColor White
Write-Host '   $data = $response.Content | ConvertFrom-Json' -ForegroundColor White
Write-Host ""

Write-Host "Ejemplos completados exitosamente!" -ForegroundColor Green
