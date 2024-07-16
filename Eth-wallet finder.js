const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

let configPath;

// Check if running as a packaged executable
if (process.pkg) {
  // If packaged, use a relative path from the executable's location
  configPath = path.join(path.dirname(process.execPath), 'config.json');
} else {
  // If running normally, use the current directory
  configPath = path.resolve(__dirname, 'config.json');
}

// Load configuration from config.json
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const INFURA_API_KEY = config.infuraApiKey;

async function main() {
  try {
    if (!INFURA_API_KEY) {
      throw new Error('Infura API key not found in config.json');
    }

    // Construct the provider URL with the API key
    const providerUrl = `https://mainnet.infura.io/v3/${INFURA_API_KEY}`;
    console.log('Using Provider URL:', providerUrl);

    // Create a provider for Ethereum mainnet
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    // Test the connection to the network
    const network = await provider.getNetwork();
    console.log('Connected to the Ethereum network:', network);

    // Generate a random mnemonic
    const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
    console.log('Mnemonic Phrase:', mnemonic);

    // Use the mnemonic to create a wallet
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);

    // Get the address
    const address = wallet.address;
    console.log('Address:', address);

    // Get the balance of the address
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.utils.formatEther(balance);
    console.log('Balance:', formattedBalance, 'ETH');

    // Check if balance is greater than 0
    if (parseFloat(formattedBalance) > 0) {
      const data = `Mnemonic Phrase: ${mnemonic}\nAddress: ${address}\nBalance: ${formattedBalance} ETH\n`;
      saveData(data);
    } else {
      console.log('Skipping mnemonic with zero balance');
    }

    // Repeat the process by calling main() again
    await main();
  } catch (error) {
    console.error('Error:', error.message);
    // Retry by calling main() again on error
    await main();
  }
}

function saveData(data) {
  const filePath = path.resolve(__dirname, 'mnemonics_with_balance.txt');

  fs.appendFile(filePath, data + '\n', (err) => {
    if (err) {
      console.error('Error saving data:', err);
    } else {
      console.log('Data saved successfully');
    }
  });
}

// Start the script
main().catch((error) => console.error('Unexpected error in main:', error));