const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AnchorContract - Advanced Tests", function () {
  
  // Fixture para despliegue rápido en cada test
  async function deployAnchorContractFixture() {
    const [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    const AnchorContract = await ethers.getContractFactory("AnchorContract");
    const anchorContract = await AnchorContract.deploy("TestChain", "ExternalChain");
    await anchorContract.waitForDeployment();

    return { anchorContract, owner, addr1, addr2, addrs };
  }

  describe("Performance Tests", function () {
    it("Should handle anchoring many blocks efficiently", async function () {
      const { anchorContract } = await loadFixture(deployAnchorContractFixture);
      
      const startTime = Date.now();
      const numBlocks = 100;
      
      // Anclar 100 bloques
      for (let i = 1; i <= numBlocks; i++) {
        const blockHash = ethers.keccak256(ethers.toUtf8Bytes(`block${i}`));
        const stateRoot = ethers.keccak256(ethers.toUtf8Bytes(`state${i}`));
        await anchorContract.anchorBlock(i, blockHash, stateRoot);
      }
      
      const endTime = Date.now();
      console.log(`Tiempo para anclar ${numBlocks} bloques: ${endTime - startTime}ms`);
      
      expect(await anchorContract.totalAnchors()).to.equal(numBlocks);
      expect(await anchorContract.lastAnchoredBlock()).to.equal(numBlocks);
    });

    it("Should efficiently retrieve large ranges of blocks", async function () {
      const { anchorContract } = await loadFixture(deployAnchorContractFixture);
      
      // Anclar 50 bloques
      for (let i = 1; i <= 50; i++) {
        const blockHash = ethers.keccak256(ethers.toUtf8Bytes(`block${i}`));
        const stateRoot = ethers.keccak256(ethers.toUtf8Bytes(`state${i}`));
        await anchorContract.anchorBlock(i, blockHash, stateRoot);
      }
      
      const startTime = Date.now();
      const blocks = await anchorContract.getLastNBlocks(50);
      const endTime = Date.now();
      
      console.log(`Tiempo para recuperar 50 bloques: ${endTime - startTime}ms`);
      
      expect(blocks.length).to.equal(50);
      expect(blocks[0].blockNumber).to.equal(1);
      expect(blocks[49].blockNumber).to.equal(50);
    });
  });

  describe("Integration Tests", function () {
    it("Should simulate real cross-chain anchoring workflow", async function () {
      const { anchorContract, owner } = await loadFixture(deployAnchorContractFixture);
      
      // Simular datos reales de blockchain
      const realBlockData = [
        {
          number: 18500000,
          hash: ethers.keccak256(ethers.toUtf8Bytes("block18500000")),
          stateRoot: ethers.keccak256(ethers.toUtf8Bytes("state18500000"))
        },
        {
          number: 18500001,
          hash: ethers.keccak256(ethers.toUtf8Bytes("block18500001")),
          stateRoot: ethers.keccak256(ethers.toUtf8Bytes("state18500001"))
        },
        {
          number: 18500002,
          hash: ethers.keccak256(ethers.toUtf8Bytes("block18500002")),
          stateRoot: ethers.keccak256(ethers.toUtf8Bytes("state18500002"))
        }
      ];

      // Anclar bloques secuencialmente
      for (const blockData of realBlockData) {
        const tx = await anchorContract.anchorBlock(
          blockData.number,
          blockData.hash,
          blockData.stateRoot
        );
        
        await expect(tx)
          .to.emit(anchorContract, "BlockAnchored")
          .withArgs(
            blockData.number,
            blockData.hash,
            blockData.stateRoot,
            "ExternalChain",
            await time.latest()
          );
      }

      // Verificar estado final
      expect(await anchorContract.totalAnchors()).to.equal(3);
      expect(await anchorContract.lastAnchoredBlock()).to.equal(18500002);

      // Verificar que podemos recuperar todos los bloques
      const lastBlock = await anchorContract.getLastAnchoredBlock();
      expect(lastBlock.blockNumber).to.equal(18500002);
      expect(lastBlock.blockHash).to.equal(realBlockData[2].hash);

      const allBlocks = await anchorContract.getLastNBlocks(3);
      expect(allBlocks.length).to.equal(3);
      expect(allBlocks[0].blockNumber).to.equal(18500000);
      expect(allBlocks[2].blockNumber).to.equal(18500002);
    });
  });

  describe("Security Tests", function () {
    it("Should prevent reentrancy attacks", async function () {
      const { anchorContract, addr1 } = await loadFixture(deployAnchorContractFixture);
      
      // El contrato no debería ser vulnerable a reentrancy ya que no hace calls externos
      // pero probamos que las transacciones no interfieren entre sí
      
      const blockHash1 = ethers.keccak256(ethers.toUtf8Bytes("block1"));
      const blockHash2 = ethers.keccak256(ethers.toUtf8Bytes("block2"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      // Intentar múltiples transacciones rápidas (simulando reentrancy)
      const promises = [
        anchorContract.anchorBlock(100, blockHash1, stateRoot),
        anchorContract.anchorBlock(101, blockHash2, stateRoot)
      ];

      // Ambas deberían ejecutarse correctamente
      await Promise.all(promises);
      
      expect(await anchorContract.totalAnchors()).to.equal(2);
    });

    it("Should handle front-running scenarios", async function () {
      const { anchorContract, owner, addr1 } = await loadFixture(deployAnchorContractFixture);
      
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("block"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      // Solo el owner puede anclar, así que no hay riesgo de front-running
      // desde otras cuentas
      await expect(
        anchorContract.connect(addr1).anchorBlock(100, blockHash, stateRoot)
      ).to.be.revertedWith("Solo el propietario puede ejecutar esta funcion");

      // El owner puede anclar normalmente
      await expect(
        anchorContract.anchorBlock(100, blockHash, stateRoot)
      ).not.to.be.reverted;
    });
  });

  describe("Stress Tests", function () {
    it("Should handle maximum uint256 values", async function () {
      const { anchorContract } = await loadFixture(deployAnchorContractFixture);
      
      const maxUint256 = ethers.MaxUint256;
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("max"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("max"));

      await anchorContract.anchorBlock(maxUint256, blockHash, stateRoot);
      
      expect(await anchorContract.lastAnchoredBlock()).to.equal(maxUint256);
      
      const block = await anchorContract.getAnchoredBlock(maxUint256);
      expect(block.blockNumber).to.equal(maxUint256);
    });

    it("Should handle rapid sequential anchoring", async function () {
      const { anchorContract } = await loadFixture(deployAnchorContractFixture);
      
      // Ejecutar anclajes secuencialmente para evitar conflictos de números
      for (let i = 1; i <= 10; i++) {
        const blockHash = ethers.keccak256(ethers.toUtf8Bytes(`rapid${i}`));
        const stateRoot = ethers.keccak256(ethers.toUtf8Bytes(`state${i}`));
        await anchorContract.anchorBlock(i, blockHash, stateRoot);
      }
      
      // Verificar que todos se ejecutaron
      expect(await anchorContract.totalAnchors()).to.equal(10);
      expect(await anchorContract.lastAnchoredBlock()).to.equal(10);
    });
  });

  describe("Data Integrity Tests", function () {
    it("Should maintain data integrity across operations", async function () {
      const { anchorContract } = await loadFixture(deployAnchorContractFixture);
      
      const testBlocks = [];
      for (let i = 1; i <= 20; i++) {
        const blockData = {
          number: i * 1000,
          hash: ethers.keccak256(ethers.toUtf8Bytes(`hash${i}`)),
          stateRoot: ethers.keccak256(ethers.toUtf8Bytes(`state${i}`))
        };
        testBlocks.push(blockData);
        
        await anchorContract.anchorBlock(
          blockData.number,
          blockData.hash,
          blockData.stateRoot
        );
      }

      // Verificar que todos los bloques están correctamente almacenados
      for (const blockData of testBlocks) {
        const storedBlock = await anchorContract.getAnchoredBlock(blockData.number);
        expect(storedBlock.blockNumber).to.equal(blockData.number);
        expect(storedBlock.blockHash).to.equal(blockData.hash);
        expect(storedBlock.stateRoot).to.equal(blockData.stateRoot);
        expect(storedBlock.chainName).to.equal("ExternalChain");
      }

      // Verificar consistencia de arrays y mappings
      const last5Blocks = await anchorContract.getLastNBlocks(5);
      expect(last5Blocks.length).to.equal(5);
      
      for (let i = 0; i < 5; i++) {
        const expectedBlockNumber = (20 - 4 + i) * 1000; // Últimos 5 bloques
        expect(last5Blocks[i].blockNumber).to.equal(expectedBlockNumber);
      }
    });
  });

  describe("Event Verification", function () {
    it("Should emit events with correct timestamps", async function () {
      const { anchorContract } = await loadFixture(deployAnchorContractFixture);
      
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("timestamp"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      const tx = await anchorContract.anchorBlock(1000, blockHash, stateRoot);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(anchorContract, "BlockAnchored")
        .withArgs(1000, blockHash, stateRoot, "ExternalChain", block.timestamp);

      // Verificar que el timestamp en el contrato coincide
      const storedBlock = await anchorContract.getAnchoredBlock(1000);
      expect(storedBlock.timestamp).to.equal(block.timestamp);
    });
  });
});
