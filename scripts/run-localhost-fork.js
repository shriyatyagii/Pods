const hre = require('hardhat');
const { TASK_NODE_CREATE_SERVER } = require('hardhat/builtin-tasks/task-names');
const Compound = require('@compound-finance/compound-js');
const jsonRpcUrl = 'http://localhost:8545';
let provider;


const amounts = {
  // 'comp': 25,
  'dai': 100,
  // 'link': 25,
  // 'mkr': 2,
  // 'sushi': 25,
  'uni': 10,
  'usdc': 100,
  // 'usdt': 100,
};


(async function () {
  console.log(`\nRunning a hardhat localhost fork of mainnet at ${jsonRpcUrl}\n`);

  const jsonRpcServer = await hre.run(TASK_NODE_CREATE_SERVER, {
    hostname: 'localhost',
    port: 8545,
    provider: hre.network.provider,
  });

  await jsonRpcServer.listen();

  // Seeding first account with ERC-20 tokens on localhost
  const assetsToSeed = Object.keys(amounts);
  const seedRequests = [];
  assetsToSeed.forEach((asset) => { seedRequests.push(seed(asset.toUpperCase(), amounts[asset])) });
  await Promise.all(seedRequests);
  console.log('\nReady to test locally! To exit, hold Ctrl+C.\n');
})().catch(console.error)


async function seed(asset, amount) {
  const cTokenAddress = Compound.util.getAddress('c' + asset);
  provider = new Compound._ethers.providers.JsonRpcProvider(jsonRpcUrl);
  const accounts = await provider.listAccounts();

  // Impersonating this address
  console.log('Impersonating address on localhost... ', Compound.util.getAddress('c' + asset));
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [ cTokenAddress ],
  });

  // Number of underlying tokens to mint, scaled up so it is an integer
  const numbTokensToSeed = (amount * Math.pow(10, Compound.decimals[asset])).toString();

  const signer = provider.getSigner(cTokenAddress);

  const gasPrice = '0'; // only works in the localhost dev environment
  const transferTrx = await Compound.eth.trx(
    Compound.util.getAddress(asset),
    'function transfer(address, uint256) public returns (bool)',
    [ accounts[0], numbTokensToSeed ],
    { provider: signer, gasPrice }
  );
  await transferTrx.wait(1);

  console.log('Local test account successfully seeded with ' + asset);

  const balanceOf = await Compound.eth.read(
    Compound.util.getAddress(asset),
    'function balanceOf(address) public returns (uint256)',
    [ accounts[0] ],
    { provider }
  );

  const tokens = +balanceOf / Math.pow(10, Compound.decimals[asset]);
  console.log(asset + ' amount in first localhost account wallet:', tokens);
}
