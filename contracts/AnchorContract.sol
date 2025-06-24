// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title AnchorContract
 * @dev Contrato para anclar información de otra red blockchain
 */
contract AnchorContract {
    struct BlockInfo {
        uint256 blockNumber;
        bytes32 blockHash;
        bytes32 stateRoot;
        uint256 timestamp;
        string chainName;
    }
    
    address public owner;
    string public thisChainName;
    string public anchoredChainName;
    
    BlockInfo[] public anchoredBlocks;
    mapping(uint256 => BlockInfo) public blockByNumber;
    
    uint256 public lastAnchoredBlock;
    uint256 public totalAnchors;
    
    event BlockAnchored(
        uint256 indexed blockNumber,
        bytes32 indexed blockHash,
        bytes32 stateRoot,
        string chainName,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede ejecutar esta funcion");
        _;
    }
    
    constructor(string memory _thisChainName, string memory _anchoredChainName) {
        owner = msg.sender;
        thisChainName = _thisChainName;
        anchoredChainName = _anchoredChainName;
    }
    
    /**
     * @dev Ancla información de un bloque de otra red
     * @param _blockNumber Número del bloque
     * @param _blockHash Hash del bloque
     * @param _stateRoot State root del bloque
     */
    function anchorBlock(
        uint256 _blockNumber,
        bytes32 _blockHash,
        bytes32 _stateRoot
    ) external onlyOwner {
        require(_blockNumber > lastAnchoredBlock, "El bloque ya fue anclado o es anterior");
        
        BlockInfo memory newBlock = BlockInfo({
            blockNumber: _blockNumber,
            blockHash: _blockHash,
            stateRoot: _stateRoot,
            timestamp: block.timestamp,
            chainName: anchoredChainName
        });
        
        anchoredBlocks.push(newBlock);
        blockByNumber[_blockNumber] = newBlock;
        lastAnchoredBlock = _blockNumber;
        totalAnchors++;
        
        emit BlockAnchored(
            _blockNumber,
            _blockHash,
            _stateRoot,
            anchoredChainName,
            block.timestamp
        );
    }
    
    /**
     * @dev Obtiene información del último bloque anclado
     */
    function getLastAnchoredBlock() external view returns (BlockInfo memory) {
        require(totalAnchors > 0, "No hay bloques anclados");
        return anchoredBlocks[anchoredBlocks.length - 1];
    }
    
    /**
     * @dev Obtiene información de un bloque específico
     * @param _blockNumber Número del bloque
     */
    function getAnchoredBlock(uint256 _blockNumber) external view returns (BlockInfo memory) {
        require(blockByNumber[_blockNumber].blockNumber != 0, "Bloque no encontrado");
        return blockByNumber[_blockNumber];
    }
    
    /**
     * @dev Obtiene los últimos N bloques anclados
     * @param _count Cantidad de bloques a obtener
     */
    function getLastNBlocks(uint256 _count) external view returns (BlockInfo[] memory) {
        require(_count > 0, "Count debe ser mayor a 0");
        require(totalAnchors > 0, "No hay bloques anclados");
        
        uint256 start = totalAnchors > _count ? totalAnchors - _count : 0;
        uint256 length = totalAnchors > _count ? _count : totalAnchors;
        
        BlockInfo[] memory result = new BlockInfo[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = anchoredBlocks[start + i];
        }
        
        return result;
    }
    
    /**
     * @dev Obtiene estadísticas del contrato
     */
    function getStats() external view returns (
        uint256 _totalAnchors,
        uint256 _lastAnchoredBlock,
        string memory _thisChain,
        string memory _anchoredChain
    ) {
        return (totalAnchors, lastAnchoredBlock, thisChainName, anchoredChainName);
    }
    
    /**
     * @dev Transfiere la propiedad del contrato
     * @param newOwner Nueva dirección del propietario
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Nueva direccion no puede ser 0x0");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}