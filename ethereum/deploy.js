const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const compiledFactory = require('./build/CampaignFactory.json');

const provider = new HDWalletProvider(
  'super course taxi ostrich grain garbage inspire purity section flag trigger save',
  'https://rinkeby.infura.io/KOYtjmFJWQ6FqD4c3Npx'
)
const web3 = new Web3(provider)

const deploy = async () => {
  const accounts = await web3.eth.getAccounts()
  console.log('Attempting to deploy from account', accounts[0])

  const contract = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode})
    .send({ from: accounts[0], gas: '1000000' })

  console.log('Contract address', contract.options.address)
}

deploy()
