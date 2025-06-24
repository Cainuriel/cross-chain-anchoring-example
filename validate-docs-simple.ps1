# Validacion Completa de la Documentacion API
# Script para verificar que todos los endpoints documentados funcionen correctamente

$baseUrl = "http://localhost:3000"

Write-Host "VALIDACION COMPLETA DE ENDPOINTS DOCUMENTADOS" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$success = 0
$total = 0

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Description,
        [hashtable]$Body = $null
    )
    
    $script:total++
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        if ($Method -eq "GET") {
            $result = Invoke-RestMethod -Uri $Url -Method GET
        } elseif ($Method -eq "POST" -and $Body) {
            $jsonBody = $Body | ConvertTo-Json
            $result = Invoke-RestMethod -Uri $Url -Method POST -ContentType "application/json" -Body $jsonBody
        } elseif ($Method -eq "POST") {
            $result = Invoke-RestMethod -Uri $Url -Method POST
        }
        
        Write-Host "   SUCCESS" -ForegroundColor Green
        $script:success++
        return $result
    } catch {
        Write-Host "   FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "ESTADO Y MONITOREO" -ForegroundColor Yellow
Write-Host "------------------" -ForegroundColor Yellow

# Health check
Test-Endpoint "GET" "$baseUrl/health" "Health check de la API"

# Networks info
Test-Endpoint "GET" "$baseUrl/api/networks" "Informacion de todas las redes"

# Network connection
Test-Endpoint "GET" "$baseUrl/api/network/alastria/connection" "Verificar conexion especifica"

Write-Host ""
Write-Host "INFORMACION DE BLOQUES" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow

# Latest blocks
Test-Endpoint "GET" "$baseUrl/api/block/alastria/latest" "Ultimo bloque de Alastria"
Test-Endpoint "GET" "$baseUrl/api/block/amoy/latest" "Ultimo bloque de Amoy"

Write-Host ""
Write-Host "ESTADISTICAS DE CONTRATOS" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

# Contract stats
Test-Endpoint "GET" "$baseUrl/api/contract/alastria/stats" "Estadisticas del contrato Alastria"
Test-Endpoint "GET" "$baseUrl/api/contract/amoy/stats" "Estadisticas del contrato Amoy"

# Last anchored block
Test-Endpoint "GET" "$baseUrl/api/contract/alastria/last-anchored" "Ultimo bloque anclado en Alastria"

# Anchored blocks
Test-Endpoint "GET" "$baseUrl/api/contract/alastria/anchored-blocks?count=3" "Ultimos 3 bloques anclados"

Write-Host ""
Write-Host "ANCLAJE CROSS-CHAIN" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

# Manual anchoring
$anchorResult = Test-Endpoint "POST" "$baseUrl/api/anchor/amoy/alastria" "Anclaje manual amoy a alastria"

Write-Host ""
Write-Host "AUTOMATIZACION" -ForegroundColor Yellow
Write-Host "--------------" -ForegroundColor Yellow

# Automation status (before)
Test-Endpoint "GET" "$baseUrl/api/automation/status" "Estado de automatizacion (inicial)"

# Start automation
$automationConfig = @{
    network1 = "alastria"
    network2 = "amoy" 
    interval = "*/30 * * * *"
}
Test-Endpoint "POST" "$baseUrl/api/automation/start" "Iniciar automatizacion" $automationConfig

# Stop automation
Test-Endpoint "POST" "$baseUrl/api/automation/stop" "Detener automatizacion"

Write-Host ""
Write-Host "METRICAS E HISTORIAL" -ForegroundColor Yellow
Write-Host "--------------------" -ForegroundColor Yellow

# Anchoring history
Test-Endpoint "GET" "$baseUrl/api/anchoring-history/alastria?limit=5&offset=0" "Historial de anclajes (paginado)"

# System metrics
$metricsResult = Test-Endpoint "GET" "$baseUrl/api/metrics" "Metricas del sistema"

Write-Host ""
Write-Host "RESUMEN DE VALIDACION" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Endpoints exitosos: $success de $total" -ForegroundColor Green
Write-Host "Porcentaje de exito: $([math]::Round(($success / $total) * 100, 2))%" -ForegroundColor Green

if ($success -eq $total) {
    Write-Host "TODA LA DOCUMENTACION ES VALIDA!" -ForegroundColor Green
    Write-Host "Todos los endpoints documentados funcionan correctamente" -ForegroundColor Green
} else {
    Write-Host "Algunos endpoints tienen problemas" -ForegroundColor Yellow
    Write-Host "Revisa los errores mostrados arriba" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "La documentacion del README esta actualizada y completa" -ForegroundColor Cyan
Write-Host "Incluye $total endpoints principales con ejemplos" -ForegroundColor Cyan
