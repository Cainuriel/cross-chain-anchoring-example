# ============================================================================
# Script PowerShell para Tests del Contrato AnchorContract
# ============================================================================

param(
    [string]$TestType = "all",  # all, basic, advanced, coverage, gas
    [switch]$Verbose = $false
)

Write-Host "Ejecutando Tests del Contrato AnchorContract..." -ForegroundColor Cyan
Write-Host ""

# Función para ejecutar comandos con manejo de errores
function Invoke-TestCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "Ejecutando $Description..." -ForegroundColor Yellow
    
    try {
        if ($Verbose) {
            Invoke-Expression $Command
        } else {
            $output = Invoke-Expression $Command 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "OK - $Description completado" -ForegroundColor Green
                if ($output -match "passing|failing") {
                    $testResults = ($output | Select-String "passing|failing").Line
                    Write-Host "   $testResults" -ForegroundColor White
                }
            } else {
                Write-Host "ERROR en $Description" -ForegroundColor Red
                Write-Host $output -ForegroundColor Red
                return $false
            }
        }
        return $true
    } catch {
        Write-Host "ERROR ejecutando: $Command" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $false
    }
}

# Compilar contratos primero
if (!(Invoke-TestCommand "npx hardhat compile" "Compilación de contratos")) {
    exit 1
}

Write-Host ""

# Ejecutar tests según el tipo especificado
switch ($TestType.ToLower()) {
    "basic" {
        Write-Host "Ejecutando solo tests básicos..." -ForegroundColor Cyan
        Invoke-TestCommand "npx hardhat test test/test.js" "Tests básicos"
    }
    
    "advanced" {
        Write-Host "Ejecutando solo tests avanzados..." -ForegroundColor Cyan
        Invoke-TestCommand "npx hardhat test test/AnchorContract.advanced.test.js" "Tests avanzados"
    }
    
    "gas" {
        Write-Host "Ejecutando tests con reporte de gas..." -ForegroundColor Cyan
        $env:REPORT_GAS = "true"
        Invoke-TestCommand "npx hardhat test" "Tests con reporte de gas"
        Remove-Item Env:\REPORT_GAS -ErrorAction SilentlyContinue
    }
    
    "coverage" {
        Write-Host "Ejecutando tests con análisis de cobertura..." -ForegroundColor Cyan
        if (!(Invoke-TestCommand "npx hardhat coverage" "Análisis de cobertura")) {
            Write-Host "WARNING: Coverage requiere 'solidity-coverage'. Instalar con:" -ForegroundColor Yellow
            Write-Host "   npm install --save-dev solidity-coverage" -ForegroundColor Gray
        }
    }
    
    "all" {
        Write-Host "Ejecutando suite completa de tests..." -ForegroundColor Cyan
        
        # Tests básicos
        if (!(Invoke-TestCommand "npx hardhat test test/test.js" "Tests básicos")) {
            exit 1
        }
        
        Write-Host ""
        
        # Tests avanzados
        if (!(Invoke-TestCommand "npx hardhat test test/AnchorContract.advanced.test.js" "Tests avanzados")) {
            exit 1
        }
        
        Write-Host ""
        
        # Reporte de gas
        Write-Host "Generando reporte de gas..." -ForegroundColor Yellow
        $env:REPORT_GAS = "true"
        Invoke-TestCommand "npx hardhat test" "Reporte de gas" | Out-Null
        Remove-Item Env:\REPORT_GAS -ErrorAction SilentlyContinue
        
        Write-Host ""
        
        # Coverage si está disponible
        Write-Host "Intentando análisis de cobertura..." -ForegroundColor Yellow
        if (!(Invoke-TestCommand "npx hardhat coverage" "Análisis de cobertura")) {
            Write-Host "INFO: Para habilitar coverage, instala: npm install --save-dev solidity-coverage" -ForegroundColor Blue
        }
    }
    
    default {
        Write-Host "ERROR: Tipo de test no válido: $TestType" -ForegroundColor Red
        Write-Host "Tipos válidos: all, basic, advanced, coverage, gas" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "OK - Tests completados!" -ForegroundColor Green
Write-Host ""

# Mostrar resumen
Write-Host "RESUMEN:" -ForegroundColor Cyan
Write-Host "   Tests básicos: test/test.js" -ForegroundColor White
Write-Host "   Tests avanzados: test/AnchorContract.advanced.test.js" -ForegroundColor White
Write-Host ""

Write-Host "COMANDOS UTILES:" -ForegroundColor Yellow
Write-Host "   .\test-runner.ps1 -TestType basic     # Solo tests básicos" -ForegroundColor Gray
Write-Host "   .\test-runner.ps1 -TestType advanced  # Solo tests avanzados" -ForegroundColor Gray
Write-Host "   .\test-runner.ps1 -TestType gas       # Con reporte de gas" -ForegroundColor Gray
Write-Host "   .\test-runner.ps1 -TestType coverage  # Con cobertura" -ForegroundColor Gray
Write-Host "   .\test-runner.ps1 -Verbose           # Con output detallado" -ForegroundColor Gray
