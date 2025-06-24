const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function saveDeployment(deploymentInfo) {
  try {
    // Crear la carpeta deployments si no existe
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Nombre del archivo basado en la red y timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${deploymentInfo.network}-${deploymentInfo.chainId}-${timestamp}.json`;
    const filePath = path.join(deploymentsDir, fileName);
    
    // Guardar el deployment individual
    fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n✅ Deployment guardado en: ${fileName}`);
    
    // Actualizar o crear el archivo de resumen de todos los deployments
    const summaryPath = path.join(deploymentsDir, "deployments-summary.json");
    let deploymentsSummary = {};
    
    if (fs.existsSync(summaryPath)) {
      deploymentsSummary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
    }
    
    // Añadir o actualizar el deployment en el resumen
    const networkKey = `${deploymentInfo.network}-${deploymentInfo.chainId}`;
    if (!deploymentsSummary[networkKey]) {
      deploymentsSummary[networkKey] = [];
    }
    
    deploymentsSummary[networkKey].push({
      contractAddress: deploymentInfo.contractAddress,
      deploymentTime: deploymentInfo.deploymentTime,
      transactionHash: deploymentInfo.transactionHash,
      deployer: deploymentInfo.deployer,
      anchoredChain: deploymentInfo.anchoredChain,
      fileName: fileName
    });
    
    // Guardar el resumen actualizado
    fs.writeFileSync(summaryPath, JSON.stringify(deploymentsSummary, null, 2));
    console.log(`✅ Resumen actualizado en: deployments-summary.json`);
    
  } catch (error) {
    console.error("❌ Error al guardar el deployment:", error.message);  }
}

async function attemptVerification(contractAddress, constructorArguments, network) {
  console.log("\n=== VERIFICACIÓN AUTOMÁTICA ===");
  
  // Redes que no soportan verificación automática
  const unsupportedNetworks = ["alastria", "hardhat", "localhost"];
  
  if (unsupportedNetworks.includes(network.name.toLowerCase())) {
    console.log(`⚠️  La red ${network.name} no soporta verificación automática.`);
    console.log("Esta es una red privada o local sin explorador de bloques público.");
    return;
  }
  
  try {
    console.log(`🔍 Intentando verificar contrato en ${network.name}...`);
    console.log(`📍 Dirección: ${contractAddress}`);
    console.log(`📝 Argumentos: [${constructorArguments.map(arg => `"${arg}"`).join(", ")}]`);
    
    // Intentar verificar
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArguments,
    });
    
    console.log("✅ Contrato verificado exitosamente!");
    
  } catch (error) {
    console.log("❌ Error en la verificación automática:");
    
    if (error.message.includes("Already Verified")) {
      console.log("ℹ️  El contrato ya está verificado.");
    } else if (error.message.includes("API Key")) {
      console.log("🔑 Error de API Key. Asegúrate de configurar las API keys en hardhat.config.ts");
      console.log("Necesitas configurar:");
      console.log("- ETHERSCAN_API_KEY para redes Ethereum");
      console.log("- POLYGONSCAN_API_KEY para redes Polygon");
      console.log("- BSCSCAN_API_KEY para redes BSC");
    } else {
      console.log(`Detalles: ${error.message}`);
    }
    
    console.log("\n💡 Puedes verificar manualmente más tarde usando:");
    console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "${constructorArguments[0]}" "${constructorArguments[1]}"`);
  }
}

async function main() {
  // Verificar que haya signers disponibles
  const signers = await hre.ethers.getSigners();
  
  if (signers.length === 0) {
    console.error("❌ No hay signers disponibles. Verifica tu configuración de red y clave privada.");
    console.error("Asegúrate de que la variable ADMIN_WALLET_PRIV_KEY esté configurada en tu archivo .env");
    process.exit(1);
  }
  
  const [deployer] = signers;
  
  console.log("Desplegando contratos con la cuenta:", deployer.address);
  
  try {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance de la cuenta:", hre.ethers.formatEther(balance));
  } catch (error) {
    console.error("Error al obtener el balance:", error.message);
  }
  
  // Obtener información de la red actual
  const network = await hre.ethers.provider.getNetwork();
  console.log("Red actual:", network.name, "Chain ID:", network.chainId);
  
  // Determinar nombres de las redes basado en el chain ID
  let thisChainName, anchoredChainName;
  
  switch (network.chainId.toString()) {
    case "2020": // Alastria
      thisChainName = "Alastria";
      anchoredChainName = "Amoy";
      break;
    case "80002": // Amoy
      thisChainName = "Amoy";
      anchoredChainName = "Alastria";
      break;
    case "97": // BSC Testnet
      thisChainName = "BSC Testnet";
      anchoredChainName = "Alastria";
      break;
    // case "": // 
    //   thisChainName = "";
    //   anchoredChainName = "";
    //   break;
    default:
      thisChainName = "Alastria";
      anchoredChainName = "Amoy";
  }
    console.log(`Desplegando contrato para anclar datos de ${anchoredChainName} en ${thisChainName}`);
  
  // Desplegar el contrato
  const AnchorContract = await hre.ethers.getContractFactory("AnchorContract");
  const anchorContract = await AnchorContract.deploy(thisChainName, anchoredChainName);
  
  await anchorContract.waitForDeployment();
  
  const contractAddress = await anchorContract.getAddress();
  
  console.log("AnchorContract desplegado en:", contractAddress);
  console.log("Red actual:", thisChainName);
  console.log("Red anclada:", anchoredChainName);
    // Guardar información del despliegue
  const deploymentTransaction = anchorContract.deploymentTransaction();
  const deploymentInfo = {
    network: thisChainName,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    anchoredChain: anchoredChainName,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: deploymentTransaction ? deploymentTransaction.hash : "N/A"
  };
  
  console.log("\n=== INFORMACIÓN DE DESPLIEGUE ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Verificar el despliegue
  try {
    const stats = await anchorContract.getStats();
    console.log("\n=== VERIFICACIÓN DEL CONTRATO ===");
    console.log("Total de anclajes:", stats[0].toString());
    console.log("Último bloque anclado:", stats[1].toString());
    console.log("Esta red:", stats[2]);
    console.log("Red anclada:", stats[3]);  } catch (error) {
    console.error("Error al verificar el contrato:", error.message);
  }
    // Guardar el deployment en la carpeta deployments
  await saveDeployment(deploymentInfo);
  
  // Intentar verificar el contrato automáticamente
  // await attemptVerification(contractAddress, [thisChainName, anchoredChainName], network);
  
  console.log("\n=== COMANDOS ÚTILES ===");
  console.log(`Para verificar manualmente en Etherscan/Polygonscan:`);
  console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "${thisChainName}" "${anchoredChainName}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  // npx hardhat run scripts/deploy.js --network <network_name>