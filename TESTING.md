# 🧪 Guía de Testing para Cross-Chain Anchoring API

## 🚀 **Paso 1: Preparar el entorno**

### Instalar dependencias
```bash
npm install
```

### Compilar contratos
```bash
npm run compile
```

### Desplegar contratos (opcional, ya tienes direcciones)
```bash
# Para Alastria
npm run deploy:alastria

# Para Amoy
npm run deploy:amoy

# Para BSC Testnet
npm run deploy:bscTestnet
```

## 🏃 **Paso 2: Iniciar la API**

```bash
# Modo desarrollo (recomendado para testing)
npm run dev
```

La API estará disponible en: `http://localhost:3000`

## 🔍 **Paso 3: Verificar que funciona**

Abre tu navegador y ve a: `http://localhost:3000/health`

Deberías ver algo como:
```json
{
  "status": "API funcionando",
  "timestamp": "2025-06-24T10:30:00.000Z",
  "networks": {
    "alastria": { "status": "healthy" },
    "amoy": { "status": "healthy" },
    "bsc": { "status": "healthy" }
  },
  "automaticAnchoring": false
}
```

## ⚡ **Paso 4: Testing con Thunder Client**

### Instalar Thunder Client
1. Abre VS Code
2. Ve a Extensions (Ctrl+Shift+X)
3. Busca "Thunder Client"
4. Instala la extensión

### Importar colección
1. Abre Thunder Client en VS Code
2. Click en "Collections"
3. Click en "Import"
4. Selecciona el archivo `thunder-client-collection.json`

### 🎯 **Orden recomendado de testing:**

#### 1. **Verificar salud del sistema**
```
GET /health
```
✅ **Esperado**: Status 200, todas las redes "healthy"

#### 2. **Verificar información de redes**
```
GET /api/networks
```
✅ **Esperado**: Lista de redes con información detallada

#### 3. **Obtener último bloque**
```
GET /api/block/alastria/latest
```
✅ **Esperado**: Información del último bloque de Alastria

#### 4. **Estadísticas de contrato**
```
GET /api/contract/alastria/stats
```
✅ **Esperado**: Estadísticas del contrato (total anclajes, etc.)

#### 5. **Anclaje manual** (¡Aquí es donde la magia sucede!)
```
POST /api/anchor/amoy/alastria
```
✅ **Esperado**: Confirmación de anclaje exitoso

#### 6. **Verificar anclaje**
```
GET /api/contract/alastria/last-anchored
```
✅ **Esperado**: Información del bloque recién anclado

#### 7. **Iniciar automatización**
```
POST /api/automation/start
Body: {
  "network1": "amoy",
  "network2": "alastria", 
  "interval": "*/2 * * * *"
}
```
✅ **Esperado**: Confirmación de inicio con próxima ejecución

#### 8. **Verificar estado de automatización**
```
GET /api/automation/status
```
✅ **Esperado**: Estado "running" con próxima ejecución

#### 9. **Detener automatización**
```
POST /api/automation/stop
```
✅ **Esperado**: Confirmación de parada

## 🐛 **Troubleshooting común**

### ❌ **Error: "No hay signers disponibles"**
**Solución**: Verifica que `ADMIN_WALLET_PRIV_KEY` esté en el `.env`

### ❌ **Error: "Contrato no encontrado"**
**Solución**: Verifica las direcciones `CONTRACT_*` en el `.env`

### ❌ **Error: "Network not found"**
**Solución**: Usa nombres correctos: `alastria`, `amoy`, `bsc`

### ❌ **Error: "Insufficient gas"**
**Solución**: Asegúrate de tener gas suficiente en tu wallet

### ❌ **Error: "Connection timeout"**
**Solución**: Verifica las URLs de las redes en `.env`

## 📊 **Monitoreo durante testing**

Mantén abierta la consola donde ejecutas `npm run dev` para ver:
- ✅ Conexiones exitosas
- ⚓ Anclajes realizados  
- 🔄 Ejecuciones automáticas
- ❌ Errores en tiempo real

## ⚙️ **Configuración avanzada**

### Cambiar intervalo de automatización
```json
{
  "network1": "amoy",
  "network2": "alastria",
  "interval": "*/10 * * * *"  // Cada 10 minutos
}
```

### Intervalos útiles:
- `*/1 * * * *` - Cada minuto
- `*/5 * * * *` - Cada 5 minutos  
- `0 * * * *` - Cada hora
- `0 0 * * *` - Cada día

## 🎉 **Testing exitoso**

Si todo funciona correctamente, deberías poder:
1. ✅ Ver estado de salud de todas las redes
2. ✅ Realizar anclajes manuales
3. ✅ Configurar anclajes automáticos
4. ✅ Monitorear estadísticas y historial
5. ✅ Obtener información de bloques en tiempo real

## 📞 **Comandos útiles durante testing**

```bash
# Ver logs de la API
npm run dev

# Compilar contratos si hay cambios
npm run compile

# Verificar balance de wallet
# (usar console.log en blockchainService.js)

# Reiniciar API
Ctrl+C → npm run dev
```

¡Feliz testing! 🚀
