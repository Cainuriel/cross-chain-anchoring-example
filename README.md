# 🔗 Blockchain Anchor System

Sistema de anclaje bidireccional entre redes blockchain que permite sincronizar y validar datos entre diferentes blockchains de forma automática.

## 📋 Descripción General

Este proyecto implementa un sistema que ancla información de bloques entre múltiples redes blockchain (Ethereum, Polygon, testnets), creando un puente de confianza descentralizado. Cada red almacena información verificada de las otras, permitiendo validación cruzada de transacciones y estados.

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Red Alastria   │    │   API Node.js   │    │   Red Amoy    │
│                 │    │                 │    │                 │
│ AnchorContract  │◄──►│ BlockchainService│◄──►│ AnchorContract  │
│ (ancla Amoy)  │    │                 │       │ (ancla Alastria) │
└─────────────────┘    │ MonitoringService│    └─────────────────┘
                       │                 │
                       │ Dashboard Web   │
                       └─────────────────┘
```

## 🛠️ Componentes Principales

### **1. Smart Contracts (Solidity + Hardhat)**
- **AnchorContract.sol**: Contrato principal que almacena información de bloques de otras redes
- **Hardhat.config.js**: Configuración para múltiples redes (Alastria, Amoy, BscTestnet)
- **Scripts de deploy**: Despliegue automático en todas las redes configuradas

### **2. API Backend (Node.js + Express)**
- **BlockchainService**: Conexión y gestión de múltiples providers Web3
- **Endpoints REST**: Control manual y automático del anclaje
- **Cron Jobs**: Automatización del proceso de anclaje entre redes
- **Sistema de monitoreo**: Métricas, alertas y health checks

### **3. Dashboard Web (HTML + JavaScript)**
- **Interfaz de control**: Anclaje manual, automatización, configuración
- **Monitoreo en tiempo real**: Estado de redes, métricas del sistema
- **Visualización**: Gráficos de actividad, historial de anclajes
- **Notificaciones**: Feedback visual de operaciones

## 🚀 Funcionalidades

### **Anclaje Automático**
- Proceso continuo que sincroniza bloques entre redes cada X minutos
- Configuración flexible de intervalos y pares de redes
- Reintentos automáticos en caso de fallos

### **Anclaje Manual**
- Control directo desde el dashboard para anclajes inmediatos
- Útil para testing y operaciones específicas

### **Monitoreo y Alertas**
- Tracking de métricas: total de anclajes, tasa de éxito, gas utilizado
- Detección automática de problemas de conectividad
- Dashboard web con visualización en tiempo real

### **Multi-Red**
- Soporte para múltiples blockchains simultáneamente
- Fácil configuración para agregar nuevas redes
- Contratos independientes por red

## 📁 Estructura del Proyecto

```
blockchain-anchor/
├── contracts/
│   └── AnchorContract.sol          # Smart contract principal
├── scripts/
│   └── deploy.js                   # Script de despliegue
├── src/
│   ├── index.js                    # Servidor Express principal
│   └── services/
│       ├── blockchainService.js    # Lógica de blockchain
│       └── monitoringService.js    # Sistema de monitoreo
├── public/
│   └── dashboard.html              # Dashboard web
├── hardhat.config.js               # Configuración de Hardhat
├── package.json                    # Dependencias Node.js
└── .env.example                    # Variables de entorno
```

## ⚙️ Tecnologías Utilizadas

- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Backend**: Node.js, Express.js, ethers.js
- **Frontend**: HTML5, JavaScript vanilla, Chart.js
- **Blockchain**: Alastria, Amoy, BscTestnet
- **Automatización**: node-cron
- **Monitoring**: Métricas personalizadas, health checks

## 🔧 Configuración Rápida

### **1. Instalación**
```bash
git clone <repository>
cd blockchain-anchor
npm install
```

### **2. Configuración**
```bash
cp .env.example .env
# Editar .env con claves privadas y RPC URLs
```

### **3. Despliegue de Contratos**
```bash
npm run compile
npm run deploy:alastria
npm run deploy:amoy
```

### **4. Iniciar API**
```bash
npm run dev
```



## 📊 API Endpoints

### **Control del Sistema**
- `GET /health` - Estado general del sistema
- `GET /api/dashboard` - Datos completos para el dashboard
- `POST /api/anchor/:net1/:net2` - Anclaje manual entre redes

### **Automatización**
- `POST /api/automation/start` - Iniciar anclaje automático
- `POST /api/automation/stop` - Detener automatización
- `GET /api/automation/status` - Estado de la automatización

### **Información de Redes**
- `GET /api/block/:network/latest` - Último bloque de una red
- `GET /api/contract/:network/stats` - Estadísticas del contrato

## 🎯 Casos de Uso

### **Validación Cruzada**
Verificar que una transacción en una red fue correctamente anclada en otra, proporcionando pruebas de integridad.

### **Sincronización de Estados**
Mantener sincronizado el estado de aplicaciones multi-chain, asegurando consistencia entre redes.

### **Auditoría Descentralizada**
Crear un registro inmutable de eventos entre blockchains para auditorías y compliance.

### **Interoperabilidad**
Base para construir puentes y aplicaciones que operen en múltiples redes simultáneamente.


## 🌐 Redes Soportadas

Amoy, BSCTestnet y Alastria

## 📈 Métricas y Monitoreo

- **Total de anclajes realizados**
- **Tasa de éxito/fallo**
- **Gas promedio utilizado**
- **Tiempo de actividad del sistema**
- **Estado de conectividad por red**
- **Historial de anclajes recientes**

## 🔄 Roadmap

- [ ] Soporte para más redes (ISBE, Avalanche, Arbitrum)
- [ ] Sistema de alertas por email/Slack
- [ ] API GraphQL para consultas complejas
- [ ] SDK para integración con otras aplicaciones
- [ ] Optimización de gas y MEV protection
- [ ] Sistema de governance para upgrades

### 🧪 **Testing y Documentación**
- `thunder-client-simple.json` - Tests para Thunder Client
- `powershell-examples-simple.ps1` - Guía completa de PowerShell GET/POST
- `test-automation.ps1` - Testing específico de automatización
- `test-api.ps1` - Testing general de todos los endpoints
- `POWERSHELL_GUIDE.md` - Guía detallada de comandos PowerShell

## 📄 Licencia

MIT License 

---

**🔗 Blockchain Anchor System** - Conectando blockchains de forma segura y descentralizada.