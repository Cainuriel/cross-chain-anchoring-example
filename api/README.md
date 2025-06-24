# 🔗 Cross-Chain Anchoring API



API Node.js/Express para anclaje cross-chain entre **Alastria**, **Amoy** (Polygon Testnet) y **BSC Testnet**, con automatización configurable por cron.

## 🚀 Características

- ✅ **Anclaje Manual** entre redes blockchain
- ✅ **Automatización** con intervalos cron configurables
- ✅ **Consulta de Estados** y métricas en tiempo real
- ✅ **Despliegue Automático** con verificación en exploradores
- ✅ **Testing Completo** con Thunder Client y PowerShell
- ✅ **Manejo Robusto** de errores y BigInt serialization

## 🛠️ Instalación y Setup

```shell
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves privadas y API keys

# Compilar contratos
npm run compile

# Desplegar en redes (opcional)
npm run deploy:alastria
npm run deploy:amoy
npm run deploy:bscTestnet
```

## ⚡ Iniciar API

```shell
# Desarrollo
npm run dev

# Producción
npm start
```

La API estará disponible en `http://localhost:3000`

## 📡 Endpoints Disponibles

### 🔍 **Estado y Monitoreo**

#### `GET /health`
**Health check de la API**
- **Descripción**: Verifica que la API esté funcionando correctamente
- **Respuesta**: Estado de la API y timestamp
- **Ejemplo**: 
```json
{
  "status": "API funcionando",
  "timestamp": "2025-06-24T22:13:20.951Z",
  "version": "1.0.0"
}
```

#### `GET /api/networks`
**Información de todas las redes configuradas**
- **Descripción**: Lista todas las redes blockchain soportadas con su estado de conexión
- **Respuesta**: Array de redes con estado, contratos desplegados y configuración
- **Ejemplo**:
```json
{
  "networks": [
    {
      "name": "alastria",
      "status": "connected",
      "chainId": 2021,
      "contractAddress": "0x8F56B20...",
      "rpcUrl": "https://red-t.alastria.io/v0/..."
    }
  ],
  "total": 3
}
```

#### `GET /api/network/:network/connection`
**Verificar conexión específica con una red**
- **Parámetros**: `network` - Nombre de la red (alastria, amoy, bsc)
- **Descripción**: Verifica el estado de conexión detallado de una red específica
- **Respuesta**: Información de conectividad, latencia y estado del nodo

### 📦 **Información de Bloques**

#### `GET /api/block/:network/latest`
**Obtener el último bloque de una red**
- **Parámetros**: `network` - Nombre de la red
- **Descripción**: Retorna información del bloque más reciente en la blockchain especificada
- **Ejemplo**:
```json
{
  "network": "alastria",
  "blockNumber": 55478336,
  "blockHash": "0xae8083992c2139e96e93173d372611b872f90325...",
  "timestamp": "2025-06-24T22:01:20.000Z",
  "gasUsed": "21000",
  "difficulty": "1"
}
```

### 📊 **Estadísticas de Contratos**

#### `GET /api/contract/:network/stats`
**Estadísticas del contrato de anclaje**
- **Parámetros**: `network` - Nombre de la red
- **Descripción**: Información estadística del contrato inteligente desplegado
- **Ejemplo**:
```json
{
  "totalAnchors": "7",
  "lastAnchoredBlock": "23187818",
  "thisChain": "Alastria",
  "anchoredChain": "Amoy",
  "contractAddress": "0x8F56B20297CC11477A7fAc1392b49a966DFF717F"
}
```

#### `GET /api/contract/:network/last-anchored`
**Último bloque anclado en una red**
- **Parámetros**: `network` - Nombre de la red
- **Descripción**: Retorna detalles del último bloque que fue anclado desde otra red
- **Ejemplo**:
```json
{
  "blockNumber": "23187818",
  "blockHash": "0x226720e997d96ab453eba953dfe5569c4b2cfdb3bdfb1b4c1f0286519b3aaf3ff",
  "stateRoot": "0x...",
  "timestamp": "1719267682",
  "chainName": "Amoy"
}
```

#### `GET /api/contract/:network/anchored-blocks`
**Últimos N bloques anclados**
- **Parámetros**: `network` - Nombre de la red
- **Query Params**: `count` - Número de bloques a retornar (default: 5)
- **Descripción**: Lista de los últimos bloques anclados en orden cronológico inverso
- **Ejemplo**: `/api/contract/alastria/anchored-blocks?count=3`

### ⚓ **Anclaje Cross-Chain**

#### `POST /api/anchor/:network1/:network2`
**Anclaje manual entre dos redes**
- **Parámetros**: 
  - `network1` - Red origen del bloque a anclar
  - `network2` - Red destino donde se anclará el bloque
- **Descripción**: Ejecuta un anclaje cross-chain inmediato entre las dos redes especificadas
- **Proceso**: 
  1. Obtiene el último bloque de `network1`
  2. Lo ancla en el contrato de `network2`
  3. Retorna detalles de la transacción
- **Ejemplo**:
```json
{
  "from": "amoy",
  "to": "alastria", 
  "status": "success",
  "anchoredBlock": "23187818",
  "transactionHash": "0x79ecbd2809b98d9f8faf6a31528bf33ebf5dda8d34c6064b3773d84465c7933c",
  "gasUsed": "268063",
  "timestamp": "2025-06-24T22:01:22.000Z"
}
```

### 🤖 **Automatización**

#### `POST /api/automation/start`
**Iniciar anclaje automático programado**
- **Body (JSON)**:
```json
{
  "network1": "alastria",     // Red origen (default: "alastria")
  "network2": "amoy",         // Red destino (default: "amoy") 
  "interval": "*/5 * * * *"   // Intervalo cron (default: cada 5 min)
}
```
- **Descripción**: Inicia una tarea automática que ejecuta anclajes cross-chain en intervalos regulares
- **Intervalos Soportados**: Formato cron estándar (minutos, horas, días, etc.)

#### `POST /api/automation/stop`
**Detener anclaje automático**
- **Body**: No requiere
- **Descripción**: Detiene cualquier tarea de anclaje automático que esté ejecutándose
- **Respuesta**:
```json
{
  "message": "Anclaje automático detenido"
}
```

#### `GET /api/automation/status`
**Estado de la automatización**
- **Descripción**: Información sobre el estado actual de la automatización
- **Respuesta**:
```json
{
  "enabled": true,
  "status": "running",
  "config": {
    "network1": "alastria",
    "network2": "amoy",
    "interval": "*/5 * * * *"
  },
  "message": "Anclaje automático ejecutándose cada: */5 * * * *"
}
```

### 📊 **Métricas e Historial**

#### `GET /api/anchoring-history/:network`
**Historial de anclajes de una red**
- **Parámetros**: `network` - Nombre de la red
- **Query Params**: 
  - `limit` - Máximo número de registros (default: 10)
  - `offset` - Número de registros a saltar (default: 0)
- **Descripción**: Historial paginado de todos los anclajes realizados en una red específica
- **Ejemplo**: `/api/anchoring-history/alastria?limit=5&offset=0`
- **Respuesta**:
```json
{
  "history": [
    {
      "blockNumber": "23187818",
      "blockHash": "0x226720e997d96ab453eba953dfe5569c4b2cfdb3bdfb1b4c1f0286519b3aaf3ff",
      "timestamp": "2025-06-24T22:01:22.000Z",
      "chainName": "Amoy"
    }
  ],
  "total": "7",
  "limit": 10,
  "offset": 0
}
```

#### `GET /api/metrics`
**Métricas generales del sistema**
- **Descripción**: Dashboard completo con estadísticas de todas las redes y el sistema
- **Información incluida**:
  - Total de anclajes por red
  - Estado de cada red
  - Uptime del sistema
  - Última actualización
- **Ejemplo**:
```json
{
  "timestamp": "2025-06-24T22:13:20.951Z",
  "automaticAnchoring": false,
  "networks": {
    "alastria": {
      "totalAnchors": "7",
      "lastAnchoredBlock": "23187818",
      "thisChain": "Alastria",
      "anchoredChain": "Amoy",
      "contractAddress": "0x8F56B20..."
    }
  },
  "totalAnchors": 14,
  "systemUptime": 1750803200072,
  "lastUpdate": "2025-06-24T22:13:20.072Z"
}
```

## 🔧 Comandos PowerShell - Guía Completa

### 📥 GET Requests

#### Básico
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3000/health"

# Información de redes
Invoke-RestMethod -Uri "http://localhost:3000/api/networks"

# Último bloque de Alastria
Invoke-RestMethod -Uri "http://localhost:3000/api/block/alastria/latest"
```

#### Con Headers Personalizados
```powershell
$headers = @{
    "User-Agent" = "PowerShell-API-Test"
    "Accept" = "application/json"
}
Invoke-RestMethod -Uri "http://localhost:3000/api/networks" -Headers $headers
```

### 📤 POST Requests

#### JSON Body (String Literal)
```powershell
# Anclaje manual entre redes
$body = '{"network1": "alastria", "network2": "amoy"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/anchor/alastria/amoy" -Method POST -ContentType "application/json" -Body $body
```

#### JSON Body (Desde Hashtable)
```powershell
# Iniciar automatización
$data = @{
    network1 = "alastria"
    network2 = "amoy"
    interval = "*/5 * * * *"
}
$body = $data | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/automation/start" -Method POST -ContentType "application/json" -Body $body
```

#### POST Sin Body
```powershell
# Detener automatización
Invoke-RestMethod -Uri "http://localhost:3000/api/automation/stop" -Method POST
```

### 🔧 Técnicas Avanzadas

#### Manejo de Errores
```powershell
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/networks"
    Write-Host "✅ Éxito: $($result.Keys.Count) redes disponibles"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
}
```

#### Inspeccionar Headers y Status Codes
```powershell
# Usar Invoke-WebRequest para obtener información completa
$response = Invoke-WebRequest -Uri "http://localhost:3000/health"
Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Content-Type: $($response.Headers.'Content-Type')"
$data = $response.Content | ConvertFrom-Json
Write-Host "Data: $($data.status)"
```

#### Diferencias entre Invoke-RestMethod vs Invoke-WebRequest
```powershell
# Invoke-RestMethod - Respuesta parseada automáticamente
$health = Invoke-RestMethod -Uri "http://localhost:3000/health"
Write-Host $health.status  # Acceso directo

# Invoke-WebRequest - Objeto completo con metadata
$response = Invoke-WebRequest -Uri "http://localhost:3000/health"
Write-Host $response.StatusCode        # 200
Write-Host $response.StatusDescription # OK
$health = $response.Content | ConvertFrom-Json
Write-Host $health.status
```

## 📋 Ejemplos Prácticos

### 🔄 Flujo Completo de Automatización
```powershell
# 1. Verificar estado inicial
$status = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/status"
Write-Host "Estado: $($status.status)"

# 2. Iniciar automatización cada 10 minutos
$config = @{
    network1 = "alastria"
    network2 = "amoy"
    interval = "*/10 * * * *"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/start" -Method POST -ContentType "application/json" -Body $config
Write-Host "Automatización iniciada: $($result.message)"

# 3. Verificar que está funcionando
$status = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/status"
Write-Host "Config actual: $($status.config.interval)"

# 4. Detener cuando sea necesario
$stop = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/stop" -Method POST
Write-Host "Detenido: $($stop.message)"
```

### 📊 Monitoreo de Redes
```powershell
# Verificar todas las redes
$networks = Invoke-RestMethod -Uri "http://localhost:3000/api/networks"
foreach ($networkName in $networks.Keys) {
    $network = $networks[$networkName]
    Write-Host "Red: $($network.name) - Estado: $($network.status)"
    
    # Obtener último bloque de cada red
    try {
        $block = Invoke-RestMethod -Uri "http://localhost:3000/api/block/$($network.name)/latest"
        Write-Host "  Último bloque: $($block.blockNumber)"
    } catch {
        Write-Host "  Error obteniendo bloque: $($_.Exception.Message)"
    }
}
```

### ⚓ Anclaje Manual con Verificación
```powershell
# Realizar anclaje y verificar resultado
try {
    $anchor = Invoke-RestMethod -Uri "http://localhost:3000/api/anchor/amoy/alastria" -Method POST
    Write-Host "✅ Anclaje exitoso:"
    Write-Host "   From: $($anchor.from) → To: $($anchor.to)"
    Write-Host "   Tx Hash: $($anchor.transactionHash)"
    Write-Host "   Block: $($anchor.anchoredBlock)"
} catch {
    Write-Host "❌ Error en anclaje: $($_.Exception.Message)"
}
```

### 📊 Consulta de Métricas y Estadísticas
```powershell
# Obtener métricas del sistema
$metrics = Invoke-RestMethod -Uri "http://localhost:3000/api/metrics"
Write-Host "📊 Total de anclajes: $($metrics.totalAnchors)"
Write-Host "🤖 Automatización: $($metrics.automaticAnchoring)"

# Estadísticas específicas de una red
$stats = Invoke-RestMethod -Uri "http://localhost:3000/api/contract/alastria/stats"
Write-Host "📈 Alastria - Total anclajes: $($stats.totalAnchors)"
Write-Host "🔗 Último bloque anclado: $($stats.lastAnchoredBlock)"

# Historial de anclajes con paginación
$history = Invoke-RestMethod -Uri "http://localhost:3000/api/anchoring-history/alastria?limit=5&offset=0"
Write-Host "📚 Historial de anclajes: $($history.total) total, mostrando $($history.history.Count)"
```

### 🔍 Verificación de Conectividad
```powershell
# Verificar conexión específica
$connection = Invoke-RestMethod -Uri "http://localhost:3000/api/network/alastria/connection"
Write-Host "🌐 Estado de Alastria: $($connection.status)"

# Obtener últimos bloques anclados
$anchored = Invoke-RestMethod -Uri "http://localhost:3000/api/contract/alastria/anchored-blocks?count=3"
Write-Host "📦 Últimos 3 bloques anclados obtenidos"
```

## 🧪 Scripts de Testing

### Ejecutar Ejemplos Completos
```powershell
# Script con todos los ejemplos de GET y POST
powershell -ExecutionPolicy Bypass -File "powershell-examples-simple.ps1"

# Script específico de automatización
powershell -ExecutionPolicy Bypass -File "test-automation.ps1"

# Testing básico de endpoints
powershell -ExecutionPolicy Bypass -File "test-api.ps1"

# Testing específico del endpoint de historial
powershell -ExecutionPolicy Bypass -File "test-history-endpoint.ps1"
```

### Scripts Disponibles

| Script | Descripción | Endpoints Probados |
|--------|-------------|-------------------|
| `powershell-examples-simple.ps1` | Guía completa con ejemplos de GET/POST | Todos los endpoints principales |
| `test-automation.ps1` | Testing específico de automatización | `/automation/*` endpoints |
| `test-api.ps1` | Testing general con función reutilizable | Health, networks, blocks, anclaje |
| `test-history-endpoint.ps1` | Testing del historial de anclajes | `/anchoring-history/:network` |

### Thunder Client
- Importa `thunder-client-simple.json` en Thunder Client para testing visual en VS Code
- Incluye todos los endpoints con ejemplos de parámetros y body
- Organizado por categorías: Health, Networks, Anchoring, Automation, Metrics

## 📚 Configuración de Intervalos Cron

| Intervalo | Descripción |
|-----------|-------------|
| `*/5 * * * *` | Cada 5 minutos |
| `*/10 * * * *` | Cada 10 minutos |
| `0 */1 * * *` | Cada hora |
| `0 0 */1 * *` | Cada día |
| `0 0 * * 0` | Cada domingo |

## 🛡️ Manejo de Errores

La API incluye manejo robusto de errores:
- ✅ Serialización correcta de BigInt
- ✅ Timeouts de conexión
- ✅ Validación de parámetros
- ✅ Logs detallados
- ✅ Respuestas HTTP apropiadas

### 📋 Códigos de Estado HTTP

| Código | Descripción | Cuándo Ocurre |
|--------|-------------|---------------|
| `200` | OK | Operación exitosa |
| `400` | Bad Request | Parámetros inválidos o faltantes |
| `404` | Not Found | Endpoint o recurso no encontrado |
| `500` | Internal Server Error | Error en el servidor o blockchain |

### 🚨 Ejemplos de Respuestas de Error

#### Red No Encontrada
```json
{
  "error": "Error obteniendo último bloque en ethereum",
  "message": "Proveedor no encontrado para la red: ethereum"
}
```

#### Contrato No Desplegado
```json
{
  "error": "Error obteniendo estadísticas del contrato en bsc",
  "message": "Contrato no encontrado para la red: bsc"
}
```

#### Error de Conexión
```json
{
  "error": "Error verificando conexión con alastria",
  "message": "Timeout connecting to network"
}
```

#### Automatización Ya Iniciada
```json
{
  "error": "No hay anclaje automático ejecutándose"
}
```

### 🔧 Manejo de Errores en PowerShell
```powershell
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/block/invalidnetwork/latest"
    Write-Host "✅ Éxito: $($result)"
} catch {
    # Capturar detalles del error
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "❌ Error HTTP: $($_.Exception.Response.StatusCode)"
    Write-Host "📝 Mensaje: $($errorResponse.error)"
    Write-Host "🔍 Detalle: $($errorResponse.message)"
}
```

## 🌐 Redes Soportadas

- **Alastria** - Red blockchain española
- **Amoy** - Polygon Testnet
- **BSC Testnet** - Binance Smart Chain Testnet

## 📝 Archivos Importantes

### 🔧 **Core de la API**
- `api/index.js` - Servidor Express principal
- `api/services/blockchainService.js` - Lógica de blockchain
- `contracts/AnchorContract.sol` - Contrato inteligente
- `deployments/` - Información de contratos desplegados

### 🧪 **Testing y Documentación**
- `thunder-client-simple.json` - Tests para Thunder Client
- `powershell-examples-simple.ps1` - Guía completa de PowerShell GET/POST
- `test-automation.ps1` - Testing específico de automatización
- `test-api.ps1` - Testing general de todos los endpoints
- `test-history-endpoint.ps1` - Testing del endpoint de historial
- `POWERSHELL_GUIDE.md` - Guía detallada de comandos PowerShell
- `AUTOMATION_FIX.md` - Documentación de la corrección de endpoints

## 🚀 Workflow Completo de Ejemplo

```powershell
# 1. Verificar que la API esté funcionando
$health = Invoke-RestMethod -Uri "http://localhost:3000/health"
Write-Host "🔧 API Status: $($health.status)"

# 2. Listar redes disponibles
$networks = Invoke-RestMethod -Uri "http://localhost:3000/api/networks"
Write-Host "🌐 Redes disponibles: $($networks.Keys.Count)"

# 3. Verificar estado de contratos
foreach ($networkName in $networks.Keys) {
    $network = $networks[$networkName]
    try {
        $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/contract/$($network.name)/stats"
        Write-Host "📊 $($network.name): $($stats.totalAnchors) anclajes"
    } catch {
        Write-Host "⚠️ $($network.name): Contrato no disponible"
    }
}

# 4. Realizar anclaje manual
$anchor = Invoke-RestMethod -Uri "http://localhost:3000/api/anchor/amoy/alastria" -Method POST
Write-Host "⚓ Anclaje realizado: $($anchor.transactionHash)"

# 5. Configurar automatización
$config = @{
    network1 = "alastria"
    network2 = "amoy"
    interval = "*/10 * * * *"
} | ConvertTo-Json

$automation = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/start" -Method POST -ContentType "application/json" -Body $config
Write-Host "🤖 Automatización iniciada: $($automation.message)"

# 6. Monitorear progreso
Start-Sleep -Seconds 5
$status = Invoke-RestMethod -Uri "http://localhost:3000/api/automation/status"
Write-Host "📈 Estado automatización: $($status.status)"

# 7. Revisar historial
$history = Invoke-RestMethod -Uri "http://localhost:3000/api/anchoring-history/alastria?limit=3"
Write-Host "📚 Últimos anclajes: $($history.history.Count) de $($history.total) total"

# 8. Obtener métricas finales
$metrics = Invoke-RestMethod -Uri "http://localhost:3000/api/metrics"
Write-Host "📊 Total de anclajes en el sistema: $($metrics.totalAnchors)"
```

## 💡 Tips y Mejores Prácticas

### 🔍 **Para Desarrollo y Testing**
- Usa `test-api.ps1` para verificación rápida de todos los endpoints
- Configura automatización con intervalos largos en desarrollo (`*/30 * * * *`)
- Revisa logs del servidor para debugging detallado
- Usa Thunder Client para testing visual e iterativo

### 🏭 **Para Producción**
- Configura intervalos de automatización según tus necesidades de negocio
- Monitorea métricas regularmente con `/api/metrics`
- Implementa alerting basado en el endpoint de health check
- Mantén backup de los archivos de deployment

### ⚡ **Optimización de Performance**
- Usa paginación en `/api/anchoring-history` para datasets grandes
- Cachea respuestas de `/api/networks` que cambian poco
- Monitorea el gas usage en las transacciones de anclaje
- Considera rate limiting en producción

### 🛡️ **Seguridad**
- Mantén las claves privadas seguras en variables de entorno
- Usa HTTPS en producción
- Implementa autenticación para endpoints críticos
- Valida parámetros de entrada siempre
