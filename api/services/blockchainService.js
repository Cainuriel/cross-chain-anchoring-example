const { ethers } = require('ethers');
require('dotenv').config();

class BlockchainService {
  constructor() {
    this.providers = {};
    this.contracts = {};
    this.initializeProviders();
  }

  initializeProviders() {
    // Configurar proveedores para diferentes redes
    this.providers = {

      amoy: new ethers.JsonRpcProvider(process.env.AMOY_URL),
      alastria: new ethers.JsonRpcProvider(process.env.ALASTRIA_URL),
      bsc: new ethers.JsonRpcProvider(process.env.BSC_TESTNET_URL)
    };

    // Configurar wallets para cada red
    this.wallets = {};
    if (process.env.ADMIN_WALLET_PRIV_KEY) {

      this.wallets.amoy = new ethers.Wallet(process.env.ADMIN_WALLET_PRIV_KEY, this.providers.amoy);
      this.wallets.bsc = new ethers.Wallet(process.env.ADMIN_WALLET_PRIV_KEY, this.providers.bsc);
      this.wallets.alastria = new ethers.Wallet(process.env.ADMIN_WALLET_PRIV_KEY, this.providers.alastria);
    }
  }

  // ABI del contrato AnchorContract
  getContractABI() {
    return [
      "function anchorBlock(uint256 _blockNumber, bytes32 _blockHash, bytes32 _stateRoot) external",
      "function getLastAnchoredBlock() external view returns (tuple(uint256 blockNumber, bytes32 blockHash, bytes32 stateRoot, uint256 timestamp, string chainName))",
      "function getAnchoredBlock(uint256 _blockNumber) external view returns (tuple(uint256 blockNumber, bytes32 blockHash, bytes32 stateRoot, uint256 timestamp, string chainName))",
      "function getLastNBlocks(uint256 _count) external view returns (tuple(uint256 blockNumber, bytes32 blockHash, bytes32 stateRoot, uint256 timestamp, string chainName)[])",
      "function getStats() external view returns (uint256 _totalAnchors, uint256 _lastAnchoredBlock, string _thisChain, string _anchoredChain)",
      "function owner() external view returns (address)",
      "function totalAnchors() external view returns (uint256)",
      "event BlockAnchored(uint256 indexed blockNumber, bytes32 indexed blockHash, bytes32 stateRoot, string chainName, uint256 timestamp)"
    ];
  }
  // Inicializar contratos
  initializeContracts() {
    const contractABI = this.getContractABI();
    
    this.contracts = {
      alastria: new ethers.Contract(
        process.env.CONTRACT_ALASTRIA,
        contractABI,
        this.wallets.alastria
      ),
      amoy: new ethers.Contract(
        process.env.CONTRACT_AMOY,
        contractABI,
        this.wallets.amoy
      ),
      bsc: new ethers.Contract(
        process.env.CONTRACT_BSC,
        contractABI,
        this.wallets.bsc
      )
    };
  }
  // Obtener información del último bloque de una red
  async getLatestBlockInfo(networkName) {
    try {
      const provider = this.providers[networkName];
      if (!provider) {
        throw new Error(`Proveedor no encontrado para la red: ${networkName}`);
      }

      const latestBlock = await provider.getBlock('latest');
      
      return {
        blockNumber: latestBlock.number.toString(),
        blockHash: latestBlock.hash,
        stateRoot: latestBlock.stateRoot || '0x0000000000000000000000000000000000000000000000000000000000000000',
        timestamp: latestBlock.timestamp.toString(),
        parentHash: latestBlock.parentHash,
        gasUsed: latestBlock.gasUsed ? latestBlock.gasUsed.toString() : '0',
        gasLimit: latestBlock.gasLimit ? latestBlock.gasLimit.toString() : '0',
        networkName: networkName
      };
    } catch (error) {
      console.error(`Error obteniendo información del bloque en ${networkName}:`, error.message);
      throw error;
    }
  }
  // Anclar un bloque en el contrato
  async anchorBlock(contractNetwork, blockInfo) {
    try {
      const contract = this.contracts[contractNetwork];
      if (!contract) {
        throw new Error(`Contrato no encontrado para la red: ${contractNetwork}`);
      }

      console.log(`Anclando bloque ${blockInfo.blockNumber} de ${blockInfo.networkName} en ${contractNetwork}`);
      
      const tx = await contract.anchorBlock(
        blockInfo.blockNumber,
        blockInfo.blockHash,
        blockInfo.stateRoot
      );

      console.log(`Transacción enviada: ${tx.hash}`);
      const receipt = await tx.wait();
      
      console.log(`Bloque anclado exitosamente. Gas usado: ${receipt.gasUsed}`);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        anchoredBlock: blockInfo.blockNumber.toString()
      };
    } catch (error) {
      console.error(`Error anclando bloque en ${contractNetwork}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtener estadísticas del contrato
  async getContractStats(networkName) {
    try {
      const contract = this.contracts[networkName];
      if (!contract) {
        throw new Error(`Contrato no encontrado para la red: ${networkName}`);
      }

      const stats = await contract.getStats();
      
      return {
        totalAnchors: stats[0].toString(),
        lastAnchoredBlock: stats[1].toString(),
        thisChain: stats[2],
        anchoredChain: stats[3],
        contractAddress: await contract.getAddress()
      };
    } catch (error) {
      console.error(`Error obteniendo estadísticas del contrato en ${networkName}:`, error.message);
      throw error;
    }
  }

  // Obtener el último bloque anclado
  async getLastAnchoredBlock(networkName) {
    try {
      const contract = this.contracts[networkName];
      if (!contract) {
        throw new Error(`Contrato no encontrado para la red: ${networkName}`);
      }

      const lastBlock = await contract.getLastAnchoredBlock();
      
      return {
        blockNumber: lastBlock[0].toString(),
        blockHash: lastBlock[1],
        stateRoot: lastBlock[2],
        timestamp: lastBlock[3].toString(),
        chainName: lastBlock[4]
      };
    } catch (error) {
      console.error(`Error obteniendo último bloque anclado en ${networkName}:`, error.message);
      throw error;
    }
  }

  // Obtener los últimos N bloques anclados
  async getLastNAnchoredBlocks(networkName, count = 5) {
    try {
      const contract = this.contracts[networkName];
      if (!contract) {
        throw new Error(`Contrato no encontrado para la red: ${networkName}`);
      }

      const blocks = await contract.getLastNBlocks(count);
      
      return blocks.map(block => ({
        blockNumber: block[0].toString(),
        blockHash: block[1],
        stateRoot: block[2],
        timestamp: block[3].toString(),
        chainName: block[4]
      }));
    } catch (error) {
      console.error(`Error obteniendo últimos ${count} bloques anclados en ${networkName}:`, error.message);
      throw error;
    }
  }
  // Proceso completo de anclaje entre dos redes
  async performCrossChainAnchoring(network1, network2) {
    const results = [];

    try {
      // Obtener información de los últimos bloques de ambas redes
      const [block1Info, block2Info] = await Promise.all([
        this.getLatestBlockInfo(network1),
        this.getLatestBlockInfo(network2)
      ]);

      // Anclar bloque de network1 en el contrato de network2
      const anchor1Result = await this.anchorBlock(network2, block1Info);
      results.push({
        action: `Anclando ${network1} en ${network2}`,
        sourceBlock: block1Info.blockNumber.toString(),
        targetNetwork: network2,
        result: {
          success: anchor1Result.success,
          transactionHash: anchor1Result.transactionHash,
          gasUsed: anchor1Result.gasUsed ? anchor1Result.gasUsed.toString() : 'N/A',
          anchoredBlock: anchor1Result.anchoredBlock ? anchor1Result.anchoredBlock.toString() : 'N/A',
          error: anchor1Result.error || null
        }
      });

      // Anclar bloque de network2 en el contrato de network1
      const anchor2Result = await this.anchorBlock(network1, block2Info);
      results.push({
        action: `Anclando ${network2} en ${network1}`,
        sourceBlock: block2Info.blockNumber.toString(),
        targetNetwork: network1,
        result: {
          success: anchor2Result.success,
          transactionHash: anchor2Result.transactionHash,
          gasUsed: anchor2Result.gasUsed ? anchor2Result.gasUsed.toString() : 'N/A',
          anchoredBlock: anchor2Result.anchoredBlock ? anchor2Result.anchoredBlock.toString() : 'N/A',
          error: anchor2Result.error || null
        }
      });

      const allSuccessful = results.every(r => r.result.success);

      return {
        success: allSuccessful,
        timestamp: new Date().toISOString(),
        network1: network1,
        network2: network2,
        anchoring: results,
        summary: {
          totalTransactions: results.length,
          successfulTransactions: results.filter(r => r.result.success).length,
          totalGasUsed: results.reduce((total, r) => {
            const gas = parseInt(r.result.gasUsed) || 0;
            return total + gas;
          }, 0).toString()
        }
      };
    } catch (error) {
      console.error('Error en el proceso de anclaje cruzado:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        network1: network1,
        network2: network2
      };
    }
  }

  // Verificar la salud de las conexiones
  async checkHealth() {
    const health = {};
    
    for (const [networkName, provider] of Object.entries(this.providers)) {
      try {
        const blockNumber = await provider.getBlockNumber();
        const network = await provider.getNetwork();
        
        health[networkName] = {
          status: 'healthy',
          blockNumber: blockNumber,
          chainId: network.chainId.toString(),
          hasContract: !!this.contracts[networkName]
        };
      } catch (error) {
        health[networkName] = {
          status: 'unhealthy',
          error: error.message,
          hasContract: !!this.contracts[networkName]
        };
      }    }
    
    return health;
  }

  // Obtener información de todas las redes configuradas
  async getNetworksInfo() {
    const networks = {};
    
    for (const [networkName, provider] of Object.entries(this.providers)) {
      try {
        const network = await provider.getNetwork();
        const blockNumber = await provider.getBlockNumber();
        
        networks[networkName] = {
          name: networkName,
          chainId: network.chainId.toString(),
          blockNumber: blockNumber,
          hasContract: !!this.contracts[networkName],
          contractAddress: this.contracts[networkName] ? 
            await this.contracts[networkName].getAddress() : null,
          status: 'connected'
        };
      } catch (error) {
        networks[networkName] = {
          name: networkName,
          chainId: 'unknown',
          blockNumber: 0,
          hasContract: !!this.contracts[networkName],
          contractAddress: null,
          status: 'disconnected',
          error: error.message
        };
      }
    }
    
    return networks;
  }

  // Verificar conexión con una red específica
  async checkNetworkConnection(networkName) {
    if (!this.providers[networkName]) {
      throw new Error(`Red ${networkName} no configurada`);
    }

    try {
      const provider = this.providers[networkName];
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      const gasPrice = await provider.getFeeData();

      return {
        network: networkName,
        chainId: network.chainId.toString(),
        blockNumber: blockNumber,
        gasPrice: gasPrice.gasPrice.toString(),
        connected: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        network: networkName,
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }  }
  // Obtener historial de anclajes
  async getAnchoringHistory(networkName, limit = 10, offset = 0) {
    if (!this.contracts[networkName]) {
      throw new Error(`Contrato no encontrado para la red ${networkName}`);
    }

    try {
      const contract = this.contracts[networkName];
      const totalAnchors = await contract.totalAnchors();
      const totalAnchorsNum = Number(totalAnchors);
      
      // Calcular el rango de bloques a obtener
      const start = Math.max(0, totalAnchorsNum - offset - limit);
      const end = Math.max(0, totalAnchorsNum - offset);
      
      const history = [];
      
      for (let i = end; i > start; i--) {
        try {
          // Usar el método wrapper que ya maneja BigInt correctamente
          const lastBlock = await this.getLastAnchoredBlock(networkName);
          
          if (lastBlock && parseInt(lastBlock.blockNumber) > 0) {
            history.push({
              blockNumber: lastBlock.blockNumber,
              blockHash: lastBlock.blockHash,
              timestamp: new Date(parseInt(lastBlock.timestamp) * 1000).toISOString(),
              chainName: lastBlock.chainName
            });
          }
          break; // Por ahora solo obtenemos el último
        } catch (error) {
          console.error(`Error obteniendo anclaje ${i}:`, error.message);
        }
      }

      return {
        history: history,
        total: totalAnchors.toString(),
        limit: limit,
        offset: offset
      };
    } catch (error) {
      throw new Error(`Error obteniendo historial de ${networkName}: ${error.message}`);
    }
  }
  // Obtener métricas generales del sistema
  async getSystemMetrics() {
    const metrics = {
      networks: {},
      totalAnchors: 0,
      systemUptime: Date.now(),
      lastUpdate: new Date().toISOString()
    };

    // Obtener métricas de cada red
    for (const networkName of Object.keys(this.providers)) {
      try {
        if (this.contracts[networkName]) {
          const stats = await this.getContractStats(networkName);
          metrics.networks[networkName] = stats;
          // Convertir string a número correctamente
          const totalAnchors = parseInt(stats.totalAnchors) || 0;
          metrics.totalAnchors += totalAnchors;
        } else {
          metrics.networks[networkName] = {
            status: 'No contract deployed',
            totalAnchors: '0'
          };
        }
      } catch (error) {
        metrics.networks[networkName] = {
          status: 'Error',
          error: error.message,
          totalAnchors: '0'
        };
      }
    }

    return metrics;
  }
}

module.exports = BlockchainService;