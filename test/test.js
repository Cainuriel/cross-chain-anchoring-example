const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AnchorContract", function () {
  let anchorContract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const THIS_CHAIN_NAME = "TestChain";
  const ANCHORED_CHAIN_NAME = "ExternalChain";

  beforeEach(async function () {
    // Obtener las cuentas de prueba
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Desplegar el contrato
    const AnchorContract = await ethers.getContractFactory("AnchorContract");
    anchorContract = await AnchorContract.deploy(THIS_CHAIN_NAME, ANCHORED_CHAIN_NAME);
    await anchorContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await anchorContract.owner()).to.equal(owner.address);
    });

    it("Should set the correct chain names", async function () {
      expect(await anchorContract.thisChainName()).to.equal(THIS_CHAIN_NAME);
      expect(await anchorContract.anchoredChainName()).to.equal(ANCHORED_CHAIN_NAME);
    });

    it("Should initialize with zero anchors", async function () {
      expect(await anchorContract.totalAnchors()).to.equal(0);
      expect(await anchorContract.lastAnchoredBlock()).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("Should allow only owner to anchor blocks", async function () {
      const blockNumber = 100;
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      // El owner puede anclar
      await expect(
        anchorContract.anchorBlock(blockNumber, blockHash, stateRoot)
      ).not.to.be.reverted;

      // Otros usuarios no pueden anclar
      await expect(
        anchorContract.connect(addr1).anchorBlock(101, blockHash, stateRoot)
      ).to.be.revertedWith("Solo el propietario puede ejecutar esta funcion");
    });

    it("Should allow only owner to transfer ownership", async function () {
      // El owner puede transferir
      await expect(
        anchorContract.transferOwnership(addr1.address)
      ).not.to.be.reverted;

      // Otros usuarios no pueden transferir
      await expect(
        anchorContract.connect(addr2).transferOwnership(addr2.address)
      ).to.be.revertedWith("Solo el propietario puede ejecutar esta funcion");
    });
  });

  describe("Block Anchoring", function () {
    it("Should successfully anchor a block", async function () {
      const blockNumber = 100;
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      const tx = await anchorContract.anchorBlock(blockNumber, blockHash, stateRoot);
      
      // Verificar que se emitió el evento
      await expect(tx)
        .to.emit(anchorContract, "BlockAnchored")
        .withArgs(blockNumber, blockHash, stateRoot, ANCHORED_CHAIN_NAME, await time.latest());

      // Verificar que los contadores se actualizaron
      expect(await anchorContract.totalAnchors()).to.equal(1);
      expect(await anchorContract.lastAnchoredBlock()).to.equal(blockNumber);
    });

    it("Should not allow anchoring blocks with lower or equal number", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      // Anclar bloque 100
      await anchorContract.anchorBlock(100, blockHash, stateRoot);

      // No debe permitir anclar bloque 99 (menor)
      await expect(
        anchorContract.anchorBlock(99, blockHash, stateRoot)
      ).to.be.revertedWith("El bloque ya fue anclado o es anterior");

      // No debe permitir anclar bloque 100 (igual)
      await expect(
        anchorContract.anchorBlock(100, blockHash, stateRoot)
      ).to.be.revertedWith("El bloque ya fue anclado o es anterior");
    });

    it("Should anchor multiple blocks in sequence", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      // Anclar varios bloques
      await anchorContract.anchorBlock(100, blockHash, stateRoot);
      await anchorContract.anchorBlock(101, blockHash, stateRoot);
      await anchorContract.anchorBlock(102, blockHash, stateRoot);

      expect(await anchorContract.totalAnchors()).to.equal(3);
      expect(await anchorContract.lastAnchoredBlock()).to.equal(102);
    });
  });

  describe("Block Retrieval", function () {
    beforeEach(async function () {
      // Anclar algunos bloques de prueba
      const blockHash1 = ethers.keccak256(ethers.toUtf8Bytes("block1"));
      const blockHash2 = ethers.keccak256(ethers.toUtf8Bytes("block2"));
      const blockHash3 = ethers.keccak256(ethers.toUtf8Bytes("block3"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      await anchorContract.anchorBlock(100, blockHash1, stateRoot);
      await anchorContract.anchorBlock(101, blockHash2, stateRoot);
      await anchorContract.anchorBlock(102, blockHash3, stateRoot);
    });

    it("Should get last anchored block", async function () {
      const lastBlock = await anchorContract.getLastAnchoredBlock();
      
      expect(lastBlock.blockNumber).to.equal(102);
      expect(lastBlock.chainName).to.equal(ANCHORED_CHAIN_NAME);
    });

    it("Should get specific anchored block", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("block2"));
      const block = await anchorContract.getAnchoredBlock(101);
      
      expect(block.blockNumber).to.equal(101);
      expect(block.blockHash).to.equal(blockHash);
      expect(block.chainName).to.equal(ANCHORED_CHAIN_NAME);
    });

    it("Should revert when getting non-existent block", async function () {
      await expect(
        anchorContract.getAnchoredBlock(999)
      ).to.be.revertedWith("Bloque no encontrado");
    });

    it("Should get last N blocks", async function () {
      // Obtener los últimos 2 bloques
      const lastBlocks = await anchorContract.getLastNBlocks(2);
      
      expect(lastBlocks.length).to.equal(2);
      expect(lastBlocks[0].blockNumber).to.equal(101); // Primero de los últimos 2
      expect(lastBlocks[1].blockNumber).to.equal(102); // Último
    });

    it("Should get all blocks when requesting more than available", async function () {
      // Solicitar más bloques de los que hay
      const allBlocks = await anchorContract.getLastNBlocks(10);
      
      expect(allBlocks.length).to.equal(3); // Solo hay 3 bloques
      expect(allBlocks[0].blockNumber).to.equal(100);
      expect(allBlocks[1].blockNumber).to.equal(101);
      expect(allBlocks[2].blockNumber).to.equal(102);
    });

    it("Should revert when requesting 0 blocks", async function () {
      await expect(
        anchorContract.getLastNBlocks(0)
      ).to.be.revertedWith("Count debe ser mayor a 0");
    });

    it("Should revert when no blocks are anchored", async function () {
      // Desplegar un contrato nuevo sin bloques
      const AnchorContract = await ethers.getContractFactory("AnchorContract");
      const newContract = await AnchorContract.deploy(THIS_CHAIN_NAME, ANCHORED_CHAIN_NAME);
      
      await expect(
        newContract.getLastAnchoredBlock()
      ).to.be.revertedWith("No hay bloques anclados");

      await expect(
        newContract.getLastNBlocks(1)
      ).to.be.revertedWith("No hay bloques anclados");
    });
  });

  describe("Statistics", function () {
    it("Should return correct stats", async function () {
      // Estado inicial
      let stats = await anchorContract.getStats();
      expect(stats._totalAnchors).to.equal(0);
      expect(stats._lastAnchoredBlock).to.equal(0);
      expect(stats._thisChain).to.equal(THIS_CHAIN_NAME);
      expect(stats._anchoredChain).to.equal(ANCHORED_CHAIN_NAME);

      // Después de anclar algunos bloques
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      await anchorContract.anchorBlock(100, blockHash, stateRoot);
      await anchorContract.anchorBlock(101, blockHash, stateRoot);

      stats = await anchorContract.getStats();
      expect(stats._totalAnchors).to.equal(2);
      expect(stats._lastAnchoredBlock).to.equal(101);
    });
  });

  describe("Ownership Transfer", function () {
    it("Should transfer ownership correctly", async function () {
      const tx = await anchorContract.transferOwnership(addr1.address);
      
      // Verificar evento
      await expect(tx)
        .to.emit(anchorContract, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);

      // Verificar que el owner cambió
      expect(await anchorContract.owner()).to.equal(addr1.address);

      // Verificar que el nuevo owner puede anclar bloques
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      await expect(
        anchorContract.connect(addr1).anchorBlock(100, blockHash, stateRoot)
      ).not.to.be.reverted;

      // Verificar que el owner anterior ya no puede
      await expect(
        anchorContract.anchorBlock(101, blockHash, stateRoot)
      ).to.be.revertedWith("Solo el propietario puede ejecutar esta funcion");
    });

    it("Should not allow transfer to zero address", async function () {
      await expect(
        anchorContract.transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("Nueva direccion no puede ser 0x0");
    });
  });

  describe("Events", function () {
    it("Should emit BlockAnchored event with correct parameters", async function () {
      const blockNumber = 100;
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      const tx = await anchorContract.anchorBlock(blockNumber, blockHash, stateRoot);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      await expect(tx)
        .to.emit(anchorContract, "BlockAnchored")
        .withArgs(blockNumber, blockHash, stateRoot, ANCHORED_CHAIN_NAME, block.timestamp);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle large block numbers", async function () {
      const largeBlockNumber = ethers.MaxUint256;
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      // Esto debería funcionar (aunque no es práctico en la realidad)
      await expect(
        anchorContract.anchorBlock(largeBlockNumber, blockHash, stateRoot)
      ).not.to.be.reverted;

      expect(await anchorContract.lastAnchoredBlock()).to.equal(largeBlockNumber);
    });

    it("Should handle zero values correctly", async function () {
      const blockNumber = 1; // No puede ser 0 por la validación
      const blockHash = ethers.ZeroHash;
      const stateRoot = ethers.ZeroHash;

      await expect(
        anchorContract.anchorBlock(blockNumber, blockHash, stateRoot)
      ).not.to.be.reverted;

      const block = await anchorContract.getAnchoredBlock(blockNumber);
      expect(block.blockHash).to.equal(ethers.ZeroHash);
      expect(block.stateRoot).to.equal(ethers.ZeroHash);
    });
  });

  describe("Gas Usage", function () {
    it("Should track gas usage for anchoring", async function () {
      const blockHash = ethers.keccak256(ethers.toUtf8Bytes("test"));
      const stateRoot = ethers.keccak256(ethers.toUtf8Bytes("state"));

      const tx = await anchorContract.anchorBlock(100, blockHash, stateRoot);
      const receipt = await tx.wait();
      
      console.log(`Gas usado para ancoraje: ${receipt.gasUsed.toString()}`);
      
      // Verificar que el gas usado esté dentro de un rango esperado
      expect(receipt.gasUsed).to.be.lt(350000); // Menos de 350k gas (ajustado)
      expect(receipt.gasUsed).to.be.gt(50000);  // Más de 50k gas
    });
  });
});