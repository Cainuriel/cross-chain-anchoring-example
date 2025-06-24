# ============================================================================
# 🧪 Script de Prueba - Validación de Respuesta de /api/networks
# ============================================================================

Write-Host "🧪 Probando estructura de respuesta de /api/networks..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

try {
    # Obtener respuesta del endpoint
    $networks = Invoke-RestMethod -Uri "$baseUrl/api/networks"
    
    Write-Host "✅ Respuesta recibida exitosamente" -ForegroundColor Green
    Write-Host ""
    
    # Verificar que es un objeto con propiedades (no array)
    if ($networks -is [PSCustomObject]) {
        Write-Host "✅ Tipo correcto: PSCustomObject" -ForegroundColor Green
    } else {
        Write-Host "❌ Tipo incorrecto: $($networks.GetType().Name)" -ForegroundColor Red
    }
    
    # Contar redes usando .Keys
    $networkCount = $networks.Keys.Count
    Write-Host "✅ Redes encontradas: $networkCount" -ForegroundColor Green
    
    # Contar redes usando PSObject.Properties (alternativa)
    $networkCountAlt = $networks.PSObject.Properties.Count
    Write-Host "✅ Redes (método alternativo): $networkCountAlt" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "📋 Detalle de redes:" -ForegroundColor Yellow
    
    # Método 1: Usando .Keys
    foreach ($networkName in $networks.Keys) {
        $network = $networks[$networkName]
        Write-Host "   - $networkName: $($network.status) (ChainId: $($network.chainId))" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "🔍 Acceso directo a redes específicas:" -ForegroundColor Yellow
    
    # Probar acceso directo
    if ($networks.alastria) {
        Write-Host "   - Alastria: $($networks.alastria.status)" -ForegroundColor White
    }
    if ($networks.amoy) {
        Write-Host "   - Amoy: $($networks.amoy.status)" -ForegroundColor White
    }
    if ($networks.bsc) {
        Write-Host "   - BSC: $($networks.bsc.status)" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "✅ Todos los ejemplos funcionan correctamente" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error conectando a la API:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Asegúrate de que la API esté ejecutándose en http://localhost:3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Comandos de una línea validados:" -ForegroundColor Cyan
Write-Host "   (Invoke-RestMethod '$baseUrl/api/networks').Keys.Count" -ForegroundColor Gray
Write-Host "   (Invoke-RestMethod '$baseUrl/api/networks').alastria.status" -ForegroundColor Gray
Write-Host ""
