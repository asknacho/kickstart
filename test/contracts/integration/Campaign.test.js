const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../../../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../../../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach( async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  await factory.methods.createCampaign('100')
    .send({ from: accounts[0], gas: '1000000'});

  [campaignAddress, _] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface), 
    campaignAddress
  );
});

describe('Campaigns', () => {
  test('processes request', async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('10','ether')
    });

    await campaign.methods
      .createRequest('Buy batteries', web3.utils.toWei('5','ether'), accounts[1])
      .send({ from: accounts[0], gas: '1000000'})

    const providerBalance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[1]),'ether'));

    await campaign.methods
      .approveRequest(0)
      .send({ from: accounts[0], gas: '1000000' })

    await campaign.methods
      .finalizeRequest(0)
      .send({ from: accounts[0], gas: '1000000' });

    const newProviderBalance = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[1]),'ether'));

    expect(newProviderBalance).toBeGreaterThan(providerBalance - 1)
  });
});