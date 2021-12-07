// Example to borrow USDC (or any ERC20 token) using ETH as collateral

const Web3 = require('web3');
const web3 = new Web3('http://127.0.0.1:8545');
const {
  cEthAbi,
  cErcAbi,
  erc20Abi,
} = require('../../contracts.json');

import { contractAddressDeployed  } from "./deploy.js";


// Your Ethereum wallet private key
const privateKey = 'b8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';

// Add your Ethereum wallet to the Web3 object
web3.eth.accounts.wallet.add('0x' + privateKey);
const myWalletAddress = web3.eth.accounts.wallet[0].address;

// Mainnet Contract for cETH (the collateral-supply process is different for cERC20 tokens)
const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
const cEth = new web3.eth.Contract(cEthAbi, cEthAddress);

// Mainnet Contract for the Comptroller & Open Price Feed
const comptrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b';
const priceFeedAddress = '0x6d2299c48a8dd07a872fdd0f8233924872ad1071';

// Mainnet address of underlying token (USDC)
const underlyingAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
const underlying = new web3.eth.Contract(erc20Abi, underlyingAddress);

const cTokenAddress = '0x39aa39c021dfbae8fac545936693ac917d5e7563'; // cUSDC
const cToken = new web3.eth.Contract(cErcAbi, cTokenAddress);
const assetName = 'USDC'; // for the log output lines
const underlyingDecimals = 6; // Number of decimals defined in this ERC20 token's contract


// MyContract
const myContractAbi = require('../../contracts.json').abi;
//const myContractAddress = '0x0Bb909b7c3817F8fB7188e8fbaA2763028956E30';
const myContract = new web3.eth.Contract(myContractAbi, contractAddressDeployed);

const logBalances = () => {
  return new Promise(async (resolve, reject) => {
    let myWalletEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myWalletAddress));
    let myContractEthBalance = +web3.utils.fromWei(await web3.eth.getBalance(myContractAddress));
    let myContractCEthBalance = await cEth.methods.balanceOf(myContractAddress).call() / 1e8;
    let myContractUnderlyingBalance = +await underlying.methods.balanceOf(myContractAddress).call() / Math.pow(10, underlyingDecimals);

    console.log("My Wallet's   ETH Balance:", myWalletEthBalance);
    console.log("MyContract's  ETH Balance:", myContractEthBalance);
    console.log("MyContract's cETH Balance:", myContractCEthBalance);
    console.log(`MyContract's  ${assetName} Balance:`, myContractUnderlyingBalance);

    resolve();
  });
};

const main = async () => {
  const contractIsDeployed = (await web3.eth.getCode(myContractAddress)) !== '0x';

  if (!contractIsDeployed) {
    throw Error('MyContract is not deployed! Deploy it by running the deploy script.');
  }

  await logBalances();

  const ethToSupplyAsCollateral = 1;
  const usdcToSupplyAsCollateral = 10;

  console.log(`\nCalling MyContract.borrowErc20Example with ${ethToSupplyAsCollateral} ETH for collateral...\n`);
  let result = await MyContracts.methods.borrowErc20Example(
      cEthAddress,
      comptrollerAddress,
      priceFeedAddress,
      cTokenAddress,
      underlyingDecimals
    ).send({
    from: myWalletAddress,
    gasLimit: web3.utils.toHex(5000000),
    gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
    value: (ethToSupplyAsCollateral * 1e18).toString()
  });

  // See the solidity functions logs from "MyLog" event
  // console.log(result.events.MyLog);

  await logBalances();

  console.log(`\nNow using mintAndAddLiquidity function ${usdcToSupplyAsCollateral} USDC for collateral...\n`);
  let resultFun = await MyContracts.methods.mintAndAddLiquidity(
    2,
    2
  ).send({
  from: myWalletAddress,
  gasLimit: web3.utils.toHex(5000000),
  gasPrice: web3.utils.toHex(20000000000), // use ethgasstation.info (mainnet only)
  value: (usdcToSupplyAsCollateral * 1e6).toString()
});

  await logBalances();
};

main().catch(async (err) => {
  console.error('ERROR:', err);

  // Create "events" and "emit" them in your Solidity code.
  // Current contract does not have any.
  let logs = await myContract.getPastEvents('allEvents');
  console.log('Logs: ', logs);
});
