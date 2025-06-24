# 🚀 PowerShell HTTP Requests - Guía Rápida

## 📥 GET Requests

### Básico
```powershell
# Simple GET request
Invoke-RestMethod -Uri "http://localhost:3000/health"

# GET con método explícito
Invoke-RestMethod -Uri "http://localhost:3000/api/networks" -Method GET
```

### Con Headers
```powershell
# Headers personalizados
$headers = @{
    "User-Agent" = "Mi-App-PowerShell"
    "Authorization" = "Bearer tu-token"
    "Accept" = "application/json"
}
Invoke-RestMethod -Uri "http://localhost:3000/api/networks" -Headers $headers
```

## 📤 POST Requests

### JSON String Literal
```powershell
# POST con JSON como string
$body = '{"network1": "alastria", "network2": "amoy"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/anchor/alastria/amoy" `
                  -Method POST `
                  -ContentType "application/json" `
                  -Body $body
```

### JSON desde Hashtable (Recomendado)
```powershell
# POST con hashtable convertida a JSON
$data = @{
    network1 = "alastria"
    network2 = "amoy"
    interval = "*/5 * * * *"
}
$body = $data | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/automation/start" `
                  -Method POST `
                  -ContentType "application/json" `
                  -Body $body
```

### POST sin Body
```powershell
# POST simple sin datos
Invoke-RestMethod -Uri "http://localhost:3000/api/automation/stop" -Method POST
```

## 🔧 Técnicas Avanzadas

### Manejo de Errores
```powershell
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/networks"
    Write-Host "✅ Éxito: $($result.Keys.Count) redes encontradas"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    }
}
```

### Invoke-WebRequest vs Invoke-RestMethod
```powershell
# Invoke-RestMethod - Respuesta parseada automáticamente
$data = Invoke-RestMethod -Uri "http://localhost:3000/health"
Write-Host $data.status  # Acceso directo a propiedades

# Invoke-WebRequest - Objeto completo con metadata
$response = Invoke-WebRequest -Uri "http://localhost:3000/health"
Write-Host "Status: $($response.StatusCode)"
Write-Host "Headers: $($response.Headers.Keys -join ', ')"
$data = $response.Content | ConvertFrom-Json
Write-Host "Content: $($data.status)"
```

### Headers de Respuesta
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/health"
Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Status Description: $($response.StatusDescription)"
Write-Host "Content-Type: $($response.Headers.'Content-Type')"
Write-Host "Content-Length: $($response.Headers.'Content-Length')"
```

## 🌐 Ejemplos Específicos de la API

### Health Check
```powershell
$health = Invoke-RestMethod -Uri "http://localhost:3000/health"
Write-Host "API Status: $($health.status)"
```

### Información de Redes
```powershell
$networks = Invoke-RestMethod -Uri "http://localhost:3000/api/networks"
foreach ($networkName in $networks.Keys) {
    $network = $networks[$networkName]
    Write-Host "$($network.name): $($network.status)"
}

# Alternativa más directa
$networks = Invoke-RestMethod -Uri "http://localhost:3000/api/networks"
$networks.PSObject.Properties | ForEach-Object {
    Write-Host "$($_.Value.name): $($_.Value.status)"
}
```

#### 📋 Estructura de Respuesta de /api/networks
La respuesta de `/api/networks` es un objeto con las redes como claves:
```json
{
  "alastria": { "name": "alastria", "status": "connected", ... },
  "amoy": { "name": "amoy", "status": "connected", ... },
  "bsc": { "name": "bsc", "status": "connected", ... }
}
```

Por eso usamos `.Keys.Count` para contar redes, no `.networks.Count`.

#### 🔍 Diferentes Formas de Acceder a los Datos
```powershell
$networks = Invoke-RestMethod -Uri "http://localhost:3000/api/networks"

# Método 1: Usar .Keys
Write-Host "Total de redes: $($networks.Keys.Count)"
foreach ($networkName in $networks.Keys) {
    $network = $networks[$networkName]
    Write-Host "$networkName: $($network.status)"
}

# Método 2: Usar PSObject.Properties
Write-Host "Total de redes: $($networks.PSObject.Properties.Count)"
$networks.PSObject.Properties | ForEach-Object {
    Write-Host "$($_.Name): $($_.Value.status)"
}

# Método 3: Acceso directo a una red específica
Write-Host "Estado de Alastria: $($networks.alastria.status)"
Write-Host "ChainId de Amoy: $($networks.amoy.chainId)"
```

### Último Bloque
```powershell
$block = Invoke-RestMethod -Uri "http://localhost:3000/api/block/alastria/latest"
Write-Host "Red: $($block.network)"
Write-Host "Bloque: $($block.blockNumber)"
Write-Host "Hash: $($block.blockHash)"
```

### Anclaje Manual
```powershell
$anchor = Invoke-RestMethod -Uri "http://localhost:3000/api/anchor/amoy/alastria" -Method POST
Write-Host "Anclaje: $($anchor.from) → $($anchor.to)"
Write-Host "TX: $($anchor.transactionHash)"
```

### Automatización Completa
```powershell
# Iniciar automatización
$config = @{
    network1 = "alastria"
    network2 = "amoy"
    interval = "*/5 * * * *"
} | ConvertTo-Json

$start = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/start" `
                          -Method POST `
                          -ContentType "application/json" `
                          -Body $config
Write-Host "Iniciado: $($start.message)"

# Verificar estado
$status = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/status"
Write-Host "Estado: $($status.status)"
Write-Host "Intervalo: $($status.config.interval)"

# Detener
$stop = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/stop" -Method POST
Write-Host "Detenido: $($stop.message)"
```

## 💡 Tips Útiles

### Variables de Entorno
```powershell
# Usar variables para URLs
$baseUrl = "http://localhost:3000"
$endpoint = "/api/networks"
Invoke-RestMethod -Uri "$baseUrl$endpoint"
```

### Timeout y Retry
```powershell
# Con timeout personalizado
Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 30

# Retry simple
$maxRetries = 3
$attempt = 0
do {
    try {
        $result = Invoke-RestMethod -Uri "http://localhost:3000/health"
        break
    } catch {
        $attempt++
        if ($attempt -ge $maxRetries) { throw }
        Start-Sleep -Seconds 2
    }
} while ($attempt -lt $maxRetries)
```

### Múltiples Requests en Paralelo
```powershell
# Jobs paralelos
$networks = @("alastria", "amoy", "bscTestnet")
$jobs = foreach ($network in $networks) {
    Start-Job -ScriptBlock {
        param($net, $base)
        Invoke-RestMethod -Uri "$base/api/block/$net/latest"
    } -ArgumentList $network, "http://localhost:3000"
}

# Recoger resultados
$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job
```

## 🚦 Estados HTTP Comunes

- **200** - OK (éxito)
- **201** - Created (creado)
- **400** - Bad Request (petición inválida)
- **404** - Not Found (no encontrado)  
- **500** - Internal Server Error (error del servidor)

## 🎯 Comandos de Una Línea

```powershell
# Health check rápido
(Invoke-RestMethod "http://localhost:3000/health").status

# Contar redes disponibles
(Invoke-RestMethod "http://localhost:3000/api/networks").Keys.Count

# Último bloque de Alastria
(Invoke-RestMethod "http://localhost:3000/api/block/alastria/latest").blockNumber

# Estado de automatización
(Invoke-RestMethod "http://localhost:3000/api/automation/status").status
```
