# 🔧 Corrección: Estructura de Respuesta de /api/networks

## ❌ Problema Original

Los ejemplos en PowerShell usaban incorrectamente `.networks.Count` para acceder a la respuesta del endpoint `/api/networks`:

```powershell
# ❌ INCORRECTO
(Invoke-RestMethod "http://localhost:3000/api/networks").networks.Count
```

Esto devolvía `0` porque la respuesta **no** tiene una propiedad `networks`.

## ✅ Estructura Real de la Respuesta

El endpoint `/api/networks` devuelve **directamente** un objeto con las redes como claves:

```json
{
  "alastria": {
    "name": "alastria",
    "chainId": "12345",
    "blockNumber": 123456,
    "hasContract": true,
    "contractAddress": "0x...",
    "status": "connected"
  },
  "amoy": {
    "name": "amoy",
    "chainId": "80002", 
    "blockNumber": 789012,
    "hasContract": true,
    "contractAddress": "0x...",
    "status": "connected"
  },
  "bsc": {
    "name": "bsc",
    "chainId": "97",
    "blockNumber": 345678,
    "hasContract": true,
    "contractAddress": "0x...",
    "status": "connected"
  }
}
```

## ✅ Ejemplos Corregidos

### Contar Redes
```powershell
# ✅ CORRECTO - Usar .Keys
(Invoke-RestMethod "http://localhost:3000/api/networks").Keys.Count

# ✅ ALTERNATIVA - Usar PSObject.Properties
$networks = Invoke-RestMethod "http://localhost:3000/api/networks"
$networks.PSObject.Properties.Count
```

### Iterar sobre Redes
```powershell
# ✅ CORRECTO - Método 1: Usar .Keys
$networks = Invoke-RestMethod "http://localhost:3000/api/networks"
foreach ($networkName in $networks.Keys) {
    $network = $networks[$networkName]
    Write-Host "$($network.name): $($network.status)"
}

# ✅ CORRECTO - Método 2: Usar PSObject.Properties
$networks = Invoke-RestMethod "http://localhost:3000/api/networks"
$networks.PSObject.Properties | ForEach-Object {
    Write-Host "$($_.Value.name): $($_.Value.status)"
}
```

### Acceso Directo
```powershell
# ✅ CORRECTO - Acceso directo a una red específica
$networks = Invoke-RestMethod "http://localhost:3000/api/networks"
Write-Host "Estado de Alastria: $($networks.alastria.status)"
Write-Host "ChainId de Amoy: $($networks.amoy.chainId)"
```

## 📝 Archivos Actualizados

Se corrigieron los ejemplos en los siguientes archivos:

1. `POWERSHELL_GUIDE.md` - Guía principal de PowerShell
2. `api/README.md` - Documentación de la API
3. `README.md` - Documentación principal del proyecto
4. `powershell-examples-simple.ps1` - Scripts de ejemplo

## 🧪 Pruebas

Para validar que los ejemplos funcionan correctamente, ejecuta:

```powershell
.\test-networks-response.ps1
```

Este script validará que:
- La respuesta tenga la estructura correcta
- Los métodos de acceso funcionen
- Los comandos de una línea sean válidos

## 💡 Recomendación

Para evitar confusión futura, considera usar siempre:

```powershell
# Método más claro y explícito
$networks = Invoke-RestMethod "http://localhost:3000/api/networks"
$networkCount = $networks.Keys.Count
$networkNames = $networks.Keys
```

En lugar de comandos de una línea que pueden ser menos legibles.
