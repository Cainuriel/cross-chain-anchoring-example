# 🧪 Script de pruebas para Cross-Chain Anchoring API (PowerShell)
# Ejecutar: .\test-api.ps1

$API_URL = "http://localhost:3000"

Write-Host "🚀 Iniciando pruebas de la API Cross-Chain Anchoring..." -ForegroundColor Green
Write-Host "📡 API URL: $API_URL" -ForegroundColor Cyan
Write-Host ""

# Función para hacer peticiones y mostrar resultados
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = "",
        [string]$Description
    )
    
    Write-Host "🔍 Testing: $Description" -ForegroundColor Yellow
    Write-Host "📡 $Method $Endpoint" -ForegroundColor Cyan
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -TimeoutSec 30
        } else {
            $headers = @{ 'Content-Type' = 'application/json' }
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Body $Data -Headers $headers -TimeoutSec 30
        }
        
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10
        
    } catch {
        Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "────────────────────────────────────────" -ForegroundColor Gray
    Write-Host ""
}

# Función para esperar entre tests
function Start-Sleep-Between-Tests {
    Start-Sleep -Seconds 2
}

# 1. Health Check
Test-Endpoint -Method "GET" -Endpoint "/health" -Description "Health Check - Verificar estado general"
Start-Sleep-Between-Tests

# 2. Networks Info
Test-Endpoint -Method "GET" -Endpoint "/api/networks" -Description "Networks Info - Información de todas las redes"
Start-Sleep-Between-Tests

# 3. Latest Block
Test-Endpoint -Method "GET" -Endpoint "/api/block/alastria/latest" -Description "Latest Block - Último bloque de Alastria"
Start-Sleep-Between-Tests

# 4. Contract Stats
Test-Endpoint -Method "GET" -Endpoint "/api/contract/alastria/stats" -Description "Contract Stats - Estadísticas del contrato"
Start-Sleep-Between-Tests

# 5. Network Connection
Test-Endpoint -Method "GET" -Endpoint "/api/network/alastria/connection" -Description "Network Connection - Verificar conexión"
Start-Sleep-Between-Tests

# 6. Last Anchored Block
Test-Endpoint -Method "GET" -Endpoint "/api/contract/alastria/last-anchored" -Description "Last Anchored - Último bloque anclado"
Start-Sleep-Between-Tests

# 7. Anchored Blocks (últimos 3)
Test-Endpoint -Method "GET" -Endpoint "/api/contract/alastria/anchored-blocks?count=3" -Description "Anchored Blocks - Últimos 3 bloques anclados"
Start-Sleep-Between-Tests

# 8. Automation Status
Test-Endpoint -Method "GET" -Endpoint "/api/automation/status" -Description "Automation Status - Estado de automatización"
Start-Sleep-Between-Tests

# 9. Manual Anchoring (¡La funcionalidad principal!)
Write-Host "⚠️  ATENCIÓN: El siguiente test realizará un anclaje real entre redes" -ForegroundColor Yellow
Write-Host "💰 Esto consumirá gas de tu wallet. ¿Continuar? (y/n): " -NoNewline -ForegroundColor Yellow
$continue_anchor = Read-Host

if ($continue_anchor -eq "y" -or $continue_anchor -eq "Y") {
    Test-Endpoint -Method "POST" -Endpoint "/api/anchor/amoy/alastria" -Description "Manual Anchor - Anclaje manual Amoy → Alastria"
    Start-Sleep-Between-Tests
    
    # Verificar el anclaje
    Write-Host "🔍 Verificando el anclaje realizado..." -ForegroundColor Cyan
    Test-Endpoint -Method "GET" -Endpoint "/api/contract/alastria/last-anchored" -Description "Verificar Anclaje - Último bloque anclado después del anclaje"
    Start-Sleep-Between-Tests
} else {
    Write-Host "⏭️  Saltando anclaje manual" -ForegroundColor Yellow
    Write-Host ""
}

# 10. System Metrics
Test-Endpoint -Method "GET" -Endpoint "/api/metrics" -Description "System Metrics - Métricas generales del sistema"
Start-Sleep-Between-Tests

# 11. Anchoring History
Test-Endpoint -Method "GET" -Endpoint "/api/anchoring-history/alastria?limit=5" -Description "Anchoring History - Historial de anclajes"

Write-Host "🎉 Pruebas completadas!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "✅ Si todos los tests muestran SUCCESS, tu API está funcionando correctamente" -ForegroundColor Green
Write-Host "❌ Si hay ERRORs, revisa:" -ForegroundColor Red
Write-Host "   - Que la API esté ejecutándose (npm run dev)" -ForegroundColor White
Write-Host "   - Que el archivo .env esté configurado" -ForegroundColor White
Write-Host "   - Que tengas gas suficiente en tu wallet" -ForegroundColor White
Write-Host "   - Que las redes estén accesibles" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Para debugging detallado, revisa los logs en la consola donde ejecutas 'npm run dev'" -ForegroundColor Cyan
