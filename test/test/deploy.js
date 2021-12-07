const hre = require("hardhat");
const { ethers } = hre;

module.exports = async function () {

    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const MyContract = await ethers.getContractFactory("MyContract");
    const myContract = await MyContract.deploy();

    console.log("MyContract address:", myContract.address);

    const contractAddressDeployed = myContract.address;

    export { contractAddressDeployed };

    /*let accountToImpersonate = "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"
    const mastSigner = await ethers.getSigner(accountToImpersonate)
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [ "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503"]
    })

    return await mastSigner;*/
};