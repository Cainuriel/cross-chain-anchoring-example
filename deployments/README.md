# 📁 Carpeta de Deployments

Esta carpeta almacena los archivos de deployment de los contratos inteligentes desplegados.

## 📋 Estructura de archivos

- **Archivos individuales**: `{Red}-{ChainID}-{timestamp}.json` - Información detallada de cada deployment
- **Archivo resumen**: `deployments-summary.json` - Índice de todos los deployments organizados por red

## 🔍 Verificación de contratos

El script de deployment intenta verificar automáticamente los contratos en los exploradores de bloques públicos.

### ✅ Redes soportadas para verificación:
- **BSC Testnet**: BscScan
- **Polygon Amoy**: PolygonScan
- **Ethereum Testnets**: Etherscan

### ❌ Redes NO soportadas:
- **Alastria**: Red privada sin explorador público
- **Hardhat/Localhost**: Redes locales

### 🔑 Configuración de API Keys

Para la verificación automática, necesitas configurar las siguientes API keys en tu archivo `.env`:

```bash
ETHERSCAN_API_KEY=tu_key_aqui
POLYGONSCAN_API_KEY=tu_key_aqui  
BSCSCAN_API_KEY=tu_key_aqui
```

### 📖 Obtener API Keys:

1. **Etherscan**: https://etherscan.io/apis
2. **PolygonScan**: https://polygonscan.com/apis
3. **BscScan**: https://bscscan.com/apis

### 🚀 Verificación manual

Si la verificación automática falla, puedes usar el comando que aparece en el output del deployment:

```bash
npx hardhat verify --network <network> <contract_address> "<arg1>" "<arg2>"
```
