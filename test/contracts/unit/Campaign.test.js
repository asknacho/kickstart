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
  test('deploys a factory', () => {
    expect(factory.options.address).toBeDefined()
  })

  test('deploys a campaign', () => {
    expect(campaign.options.address).toBeDefined()
  })

  test('marks the caller as the campaign manager', async () => {
    const manager = await campaign.methods.manager().call();
    expect(accounts[0]).toBe(manager);
  })

  test('allows people to contribute to a campaign and adds them to the approvers', async () => {

    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200'
    });

    const isContributor = campaign.methods.approvers(accounts[1]).call();

    expect(isContributor).toBeTruthy();

  });

  test('requires a minimum contribution', async () => {
     await expect(
      campaign.methods.contribute()
      .send({
        from: accounts[0],
        value: '10'
      }))
      .rejects.toThrowError(expect.anything());
  })

  describe('create a payment request', () => {
    test('allowed if requested by the campaign manager', async () => {
      await campaign.methods
        .createRequest('Buy batteries', '100', accounts[1])
        .send({
          from: accounts[0],
          gas: '1000000'
        });

      const request = await campaign.methods.requests(0).call();

      expect(request.description).toEqual('Buy batteries');
    });

    test('deny if the requestor is not the campaign manager', async () => {
      await expect(
        campaign.methods
        .createRequest('Buy batteries', '100', accounts[1])
        .send({
          from: accounts[1],
          gas: '1000000'
        }))
        .rejects.toThrowError(expect.anything());

    });
  });
})