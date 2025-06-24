const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const BlockchainService = require('./services/blockchainService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar servicio de blockchain
const blockchainService = new BlockchainService();

// Inicializar contratos cuando el servidor arranca
setTimeout(() => {
  blockchainService.initializeContracts();
  console.log('Contratos inicializados');
}, 1000);

// Variables para almacenar el estado del cron
let cronJob = null;
let isAutomaticAnchoringEnabled = false;
let cronConfig = {
  network1: 'alastria',
  network2: 'amoy',
  interval: '*/5 * * * *'
};

// ======================
// RUTAS DE LA API
// ======================

// Ruta de salud general
app.get('/health', async (req, res) => {
  try {
    const health = await blockchainService.checkHealth();
    res.json({
      status: 'API funcionando',
      timestamp: new Date().toISOString(),
      networks: health,
      automaticAnchoring: isAutomaticAnchoringEnabled
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error verificando salud del sistema',
      message: error.message
    });
  }
});

// Obtener información del último bloque de una red
app.get('/api/block/:network/latest', async (req, res) => {
  try {
    const { network } = req.params;
    const blockInfo = await blockchainService.getLatestBlockInfo(network);
    res.json(blockInfo);
  } catch (error) {
    res.status(500).json({
      error: `Error obteniendo información del bloque en ${req.params.network}`,
      message: error.message
    });
  }
});

// Obtener estadísticas de un contrato
app.get('/api/contract/:network/stats', async (req, res) => {
  try {
    const { network } = req.params;
    const stats = await blockchainService.getContractStats(network);
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      error: `Error obteniendo estadísticas del contrato en ${req.params.network}`,
      message: error.message
    });
  }
});

// Obtener último bloque anclado
app.get('/api/contract/:network/last-anchored', async (req, res) => {
  try {
    const { network } = req.params;
    const lastBlock = await blockchainService.getLastAnchoredBlock(network);
    res.json(lastBlock);
  } catch (error) {
    res.status(500).json({
      error: `Error obteniendo último bloque anclado en ${req.params.network}`,
      message: error.message
    });
  }
});

// Obtener últimos N bloques anclados
app.get('/api/contract/:network/anchored-blocks', async (req, res) => {
  try {
    const { network } = req.params;
    const { count = 5 } = req.query;
    const blocks = await blockchainService.getLastNAnchoredBlocks(network, parseInt(count));
    res.json(blocks);
  } catch (error) {
    res.status(500).json({
      error: `Error obteniendo bloques anclados en ${req.params.network}`,
      message: error.message
    });
  }
});

// Anclaje manual entre dos redes
app.post('/api/anchor/:network1/:network2', async (req, res) => {
  try {
    const { network1, network2 } = req.params;
    console.log(`Iniciando anclaje manual entre ${network1} y ${network2}`);
    
    const result = await blockchainService.performCrossChainAnchoring(network1, network2);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: `Error en anclaje entre ${req.params.network1} y ${req.params.network2}`,
      message: error.message
    });
  }
});

// Iniciar anclaje automático
app.post('/api/automation/start', (req, res) => {
  try {
    const { network1 = 'alastria', network2 = 'amoy', interval = '*/5 * * * *' } = req.body;
    
    // Detener tarea existente si existe
    if (cronJob) {
      cronJob.stop();
      cronJob = null;
    }
    
    // Actualizar configuración
    cronConfig = { network1, network2, interval };
    
    cronJob = cron.schedule(interval, async () => {
      console.log(`[${new Date().toISOString()}] Ejecutando anclaje automático entre ${network1} y ${network2}`);
      
      try {
        const result = await blockchainService.performCrossChainAnchoring(network1, network2);
        console.log('Resultado del anclaje automático:', result);
      } catch (error) {
        console.error('Error en anclaje automático:', error.message);
      }
    }, {
      scheduled: false
    });
    
    cronJob.start();
    isAutomaticAnchoringEnabled = true;
    
    res.json({
      message: 'Anclaje automático iniciado',
      networks: [network1, network2],
      interval: interval,
      status: 'running'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error iniciando anclaje automático',
      message: error.message
    });
  }
});

// Detener anclaje automático
app.post('/api/automation/stop', (req, res) => {
  try {
    if (cronJob) {
      cronJob.stop();
      cronJob = null;
      isAutomaticAnchoringEnabled = false;
      
      res.json({
        message: 'Anclaje automático detenido'
      });
    } else {
      res.status(400).json({
        error: 'No hay anclaje automático ejecutándose'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Error deteniendo anclaje automático',
      message: error.message
    });
  }
});

// Obtener estado del anclaje automático
app.get('/api/automation/status', (req, res) => {
  try {
    res.json({
      enabled: isAutomaticAnchoringEnabled,
      status: cronJob ? 'running' : 'stopped',
      config: cronJob ? cronConfig : null,
      message: cronJob ? `Anclaje automático ejecutándose cada: ${cronConfig.interval}` : 'Anclaje automático detenido'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo estado del anclaje automático',
      message: error.message
    });
  }
});

// Obtener información de todas las redes configuradas
app.get('/api/networks', async (req, res) => {
  try {
    const networks = await blockchainService.getNetworksInfo();
    res.json(networks);
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo información de las redes',
      message: error.message
    });
  }
});

// Verificar conexión con una red específica
app.get('/api/network/:network/connection', async (req, res) => {
  try {
    const { network } = req.params;
    const connectionInfo = await blockchainService.checkNetworkConnection(network);
    res.json(connectionInfo);
  } catch (error) {
    res.status(500).json({
      error: `Error verificando conexión con ${req.params.network}`,
      message: error.message
    });
  }
});

// Ruta para obtener historial de anclajes
app.get('/api/anchoring-history/:network', async (req, res) => {
  try {
    const { network } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    const history = await blockchainService.getAnchoringHistory(network, parseInt(limit), parseInt(offset));
    res.json(history);
  } catch (error) {
    res.status(500).json({
      error: `Error obteniendo historial de anclajes para ${req.params.network}`,
      message: error.message
    });
  }
});

// Ruta para obtener métricas generales del sistema
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await blockchainService.getSystemMetrics();
    res.json({
      timestamp: new Date().toISOString(),
      automaticAnchoring: isAutomaticAnchoringEnabled,
      ...metrics
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error obteniendo métricas del sistema',
      message: error.message
    });
  }
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    availableEndpoints: [
      'GET /health',
      'GET /api/block/:network/latest',
      'GET /api/contract/:network/stats',
      'GET /api/contract/:network/last-anchored',
      'GET /api/contract/:network/anchored-blocks',
      'POST /api/anchor/:network1/:network2',
      'POST /api/automation/start',
      'POST /api/automation/stop',
      'GET /api/automation/status',
      'GET /api/networks',
      'GET /api/network/:network/connection',
      'GET /api/anchoring-history/:network',
      'GET /api/metrics'
    ]
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Ha ocurrido un error inesperado'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API de Cross-Chain Anchoring ejecutándose en puerto ${PORT}`);
  console.log(`📡 Endpoints disponibles en http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 Documentación: Revisa los endpoints disponibles en cualquier ruta no encontrada`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  
  if (cronJob) {
    console.log('⏹️  Deteniendo anclaje automático...');
    cronJob.stop();
  }
  
  console.log('✅ Servidor cerrado correctamente');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  
  if (cronJob) {
    console.log('⏹️  Deteniendo anclaje automático...');
    cronJob.stop();
  }
  
  console.log('✅ Servidor cerrado correctamente');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
  
  if (cronJob) {
    console.log('⏹️  Deteniendo anclaje automático...');
    cronJob.destroy();
  }
  
  console.log('✅ Servidor cerrado correctamente');
  process.exit(0);
});