#!/bin/bash

# 🧪 Script de pruebas para Cross-Chain Anchoring API
# Ejecutar: chmod +x test-api.sh && ./test-api.sh

API_URL="http://localhost:3000"

echo "🚀 Iniciando pruebas de la API Cross-Chain Anchoring..."
echo "📡 API URL: $API_URL"
echo ""

# Función para hacer peticiones y mostrar resultados
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo "🔍 Testing: $description"
    echo "📡 $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "✅ SUCCESS ($http_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo "❌ ERROR ($http_code)"
        echo "$body"
    fi
    
    echo ""
    echo "────────────────────────────────────────"
    echo ""
}

# Esperar un poco entre peticiones
sleep_between_tests() {
    sleep 2
}

# 1. Health Check
test_endpoint "GET" "/health" "" "Health Check - Verificar estado general"
sleep_between_tests

# 2. Networks Info
test_endpoint "GET" "/api/networks" "" "Networks Info - Información de todas las redes"
sleep_between_tests

# 3. Latest Block
test_endpoint "GET" "/api/block/alastria/latest" "" "Latest Block - Último bloque de Alastria"
sleep_between_tests

# 4. Contract Stats
test_endpoint "GET" "/api/contract/alastria/stats" "" "Contract Stats - Estadísticas del contrato"
sleep_between_tests

# 5. Network Connection
test_endpoint "GET" "/api/network/alastria/connection" "" "Network Connection - Verificar conexión"
sleep_between_tests

# 6. Last Anchored Block
test_endpoint "GET" "/api/contract/alastria/last-anchored" "" "Last Anchored - Último bloque anclado"
sleep_between_tests

# 7. Anchored Blocks (últimos 3)
test_endpoint "GET" "/api/contract/alastria/anchored-blocks?count=3" "" "Anchored Blocks - Últimos 3 bloques anclados"
sleep_between_tests

# 8. Automation Status
test_endpoint "GET" "/api/automation/status" "" "Automation Status - Estado de automatización"
sleep_between_tests

# 9. Manual Anchoring (¡La funcionalidad principal!)
echo "⚠️  ATENCIÓN: El siguiente test realizará un anclaje real entre redes"
echo "💰 Esto consumirá gas de tu wallet. ¿Continuar? (y/n)"
read -r continue_anchor

if [ "$continue_anchor" = "y" ] || [ "$continue_anchor" = "Y" ]; then
    test_endpoint "POST" "/api/anchor/amoy/alastria" "" "Manual Anchor - Anclaje manual Amoy → Alastria"
    sleep_between_tests
    
    # Verificar el anclaje
    echo "🔍 Verificando el anclaje realizado..."
    test_endpoint "GET" "/api/contract/alastria/last-anchored" "" "Verificar Anclaje - Último bloque anclado después del anclaje"
    sleep_between_tests
else
    echo "⏭️  Saltando anclaje manual"
    echo ""
fi

# 10. System Metrics
test_endpoint "GET" "/api/metrics" "" "System Metrics - Métricas generales del sistema"
sleep_between_tests

# 11. Anchoring History
test_endpoint "GET" "/api/anchoring-history/alastria?limit=5" "" "Anchoring History - Historial de anclajes"

echo "🎉 Pruebas completadas!"
echo ""
echo "📊 Resumen:"
echo "✅ Si todos los tests muestran SUCCESS, tu API está funcionando correctamente"
echo "❌ Si hay ERRORs, revisa:"
echo "   - Que la API esté ejecutándose (npm run dev)"
echo "   - Que el archivo .env esté configurado"
echo "   - Que tengas gas suficiente en tu wallet"
echo "   - Que las redes estén accesibles"
echo ""
echo "🔧 Para debugging detallado, revisa los logs en la consola donde ejecutas 'npm run dev'"
