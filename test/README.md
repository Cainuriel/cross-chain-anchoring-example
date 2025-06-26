# 🧪 Tests para AnchorContract

Este directorio contiene una suite completa de tests para el contrato `AnchorContract.sol`, diseñados para validar todas las funcionalidades y casos límite del contrato de anclaje cross-chain.

## 📁 Estructura de Tests

```
test/
├── test.js                           # Tests básicos y fundamentales
├── AnchorContract.advanced.test.js   # Tests avanzados y de rendimiento
└── README.md                         # Esta documentación
```

## 🔬 Tests Básicos (`test.js`)

### Categorías Cubiertas:

1. **Deployment**
   - Verificación de owner inicial
   - Configuración de nombres de chains
   - Estado inicial del contrato

2. **Access Control**
   - Solo owner puede anclar bloques
   - Solo owner puede transferir ownership
   - Rechazo de usuarios no autorizados

3. **Block Anchoring**
   - Anclaje exitoso de bloques
   - Validación de orden secuencial
   - Prevención de bloques duplicados
   - Emisión correcta de eventos

4. **Block Retrieval**
   - Obtención del último bloque anclado
   - Recuperación de bloques específicos
   - Obtención de rangos de bloques (getLastNBlocks)
   - Manejo de bloques inexistentes

5. **Statistics**
   - Contadores de bloques totales
   - Último bloque anclado
   - Información de chains

6. **Ownership Transfer**
   - Transferencia exitosa
   - Emisión de eventos
   - Validación de nueva dirección

7. **Events**
   - BlockAnchored con parámetros correctos
   - OwnershipTransferred

8. **Edge Cases**
   - Valores máximos (uint256)
   - Valores cero
   - Casos límite

9. **Gas Usage**
   - Medición de consumo de gas
   - Verificación de eficiencia

## 🚀 Tests Avanzados (`AnchorContract.advanced.test.js`)

### Categorías Avanzadas:

1. **Performance Tests**
   - Anclaje masivo de bloques (100+ bloques)
   - Recuperación eficiente de grandes rangos
   - Medición de tiempos de ejecución

2. **Integration Tests**
   - Simulación de workflow real de cross-chain anchoring
   - Datos realistas de blockchain
   - Verificación de integridad end-to-end

3. **Security Tests**
   - Prevención de reentrancy (aunque no aplique directamente)
   - Manejo de front-running
   - Validaciones de seguridad

4. **Stress Tests**
   - Valores máximos de uint256
   - Anclaje secuencial rápido
   - Carga de trabajo extrema

5. **Data Integrity Tests**
   - Consistencia entre arrays y mappings
   - Integridad después de múltiples operaciones
   - Verificación de persistencia de datos

6. **Event Verification**
   - Timestamps correctos en eventos
   - Parámetros exactos en emisiones

## 🎯 Ejecución de Tests

### Métodos de Ejecución:

#### 1. **Script PowerShell** (Recomendado para Windows)
```powershell
# Todos los tests
.\run-tests.ps1

# Solo tests básicos
.\run-tests.ps1 -TestType basic

# Solo tests avanzados
.\run-tests.ps1 -TestType advanced

# Con reporte de gas
.\run-tests.ps1 -TestType gas

# Con análisis de cobertura
.\run-tests.ps1 -TestType coverage

# Con output detallado
.\run-tests.ps1 -Verbose
```

#### 2. **Comandos Hardhat Directos**
```bash
# Compilar contratos
npx hardhat compile

# Tests básicos
npx hardhat test test/test.js

# Tests avanzados
npx hardhat test test/AnchorContract.advanced.test.js

# Todos los tests
npx hardhat test

# Con reporte de gas
REPORT_GAS=true npx hardhat test

# Con cobertura (requiere solidity-coverage)
npx hardhat coverage
```

#### 3. **Script Node.js**
```bash
node run-tests.js
```

## 📊 Métricas y Cobertura

### Funciones Cubiertas (100%):
- ✅ `constructor`
- ✅ `anchorBlock`
- ✅ `getLastAnchoredBlock`
- ✅ `getAnchoredBlock`
- ✅ `getLastNBlocks`
- ✅ `getStats`
- ✅ `transferOwnership`

### Modifiers Cubiertos (100%):
- ✅ `onlyOwner`

### Events Cubiertos (100%):
- ✅ `BlockAnchored`
- ✅ `OwnershipTransferred`

### Casos de Prueba:
- **Tests Básicos**: ~30 casos
- **Tests Avanzados**: ~20 casos
- **Total**: ~50+ casos de prueba

## 🛡️ Validaciones de Seguridad

### Controles Implementados:
1. **Access Control**: Solo owner autorizado
2. **Input Validation**: Parámetros válidos requeridos
3. **State Consistency**: Orden secuencial de bloques
4. **Zero Address Protection**: Prevención de transferencia a 0x0
5. **Overflow Protection**: Uso de Solidity 0.8+ con protección automática

### Ataques Prevenidos:
- ✅ Unauthorized access
- ✅ Block replay/reordering
- ✅ Invalid ownership transfer
- ✅ Integer overflow/underflow
- ✅ Reentrancy (no aplica, pero probado)

## 💡 Mejores Prácticas Implementadas

1. **Fixtures**: Uso de `loadFixture` para despliegue eficiente
2. **Assertions Específicas**: Tests detallados con expectativas claras
3. **Event Testing**: Verificación completa de eventos emitidos
4. **Gas Optimization**: Medición y optimización de gas
5. **Edge Cases**: Cobertura de casos límite y especiales
6. **Performance**: Tests de rendimiento y escalabilidad

## 🚨 Requisitos Previos

```bash
# Instalar dependencias básicas
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Para análisis de cobertura (opcional)
npm install --save-dev solidity-coverage

# Para reportes de gas avanzados (opcional)
npm install --save-dev hardhat-gas-reporter
```

## 📈 Interpretación de Resultados

### Salida Típica:
```
  AnchorContract
    Deployment
      ✓ Should set the right owner (45ms)
      ✓ Should set the correct chain names (38ms)
      ✓ Should initialize with zero anchors (25ms)
    ...
    
  50 passing (2s)
```

### Métricas de Gas:
```
·--------------------------------------------|----------------------------|-------------|----------------------------·
|    Solc version: 0.8.28                   ·  Optimizer enabled: true   ·  Runs: 10   ·  Block limit: 30000000 gas  │
·············································|····························|·············|·····························
|  Methods                                   ·               20 gwei/gas                ·       1500.00 usd/eth       │
·················|···························|··············|·············|·············|··············|··············
|  Contract      ·  Method                   ·  Min         ·  Max        ·  Avg        ·  # calls     ·  usd (avg)  │
·················|···························|··············|·············|·············|··············|··············
|  AnchorContract·  anchorBlock              ·       85000  ·     120000  ·      95000  ·          45  ·       2.85  │
·················|···························|··············|·············|·············|··············|··············
```

## 🔧 Troubleshooting

### Problemas Comunes:

1. **Error de compilación**:
   ```bash
   npx hardhat clean
   npx hardhat compile
   ```

2. **Tests fallan por timeout**:
   - Aumentar timeout en `hardhat.config.ts`
   - Verificar conexión de red para tests de integración

3. **Coverage no funciona**:
   ```bash
   npm install --save-dev solidity-coverage
   ```

4. **Gas reporter no funciona**:
   ```bash
   npm install --save-dev hardhat-gas-reporter
   ```

## 📝 Contribuir

Para añadir nuevos tests:

1. Sigue el patrón de naming: `describe` → `it`
2. Usa fixtures para despliegue eficiente
3. Incluye tests positivos y negativos
4. Verifica eventos cuando corresponda
5. Documenta casos complejos
6. Considera casos límite y edge cases

## 📊 Reporte Automático

Después de ejecutar los tests, se genera automáticamente:
- `TEST_SUMMARY.md`: Resumen completo de la ejecución
- `coverage/`: Directorio con reportes de cobertura (si aplica)
- Gas reports en la consola

---

**Última actualización**: ${new Date().toISOString().split('T')[0]}
**Versión del contrato**: 1.0.0
**Solidity**: ^0.8.28
**Hardhat**: ^2.17.2
