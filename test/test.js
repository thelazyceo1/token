var Promise = require("bluebird");
var getBalance = Promise.promisify(web3.eth.getBalance);
var Xof = artifacts.require("./Xof.sol");
var MockCfaPriceOracle = artifacts.require("./MockCfaPriceOracle.sol");

contract('Xof', function(accounts) {
  var cFA;
  var mockEtherPriceOracle;

  beforeEach(async () => {
    mockEtherPriceOracle = await MockCfaPriceOracle.deployed()
    cFA = await Xof.new(MockCfaPriceOracle.address);
  });

  describe("#issue", async () => {
    it("should update the user's balance",  async ()  => {
      await mockEtherPriceOracle.setPrice(30000);
      await cFA.issue({value: web3.toWei('1', 'ether')});
      const balance = await cFA.balanceOf(accounts[0]);
      assert.equal(balance.valueOf(), 30000);
    });

    it("increments the total supply",  async ()  => {
      await mockEtherPriceOracle.setPrice(30000);
      await cFA.issue({value: web3.toWei('1', 'ether')});
      const totalSupply = await cFA.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 30000);
    });
  });

  describe("#withdraw", async ()  => {
    it("won't let you withdraw more Xof than you have",  async ()  => {
      await mockEtherPriceOracle.setPrice(30000);
      await cFA.issue({value: web3.toWei('1', 'ether')});
      try {
        await cFA.withdraw(30001);
      } catch (error) {
        assert.match(error, /VM Exception[a-zA-Z0-9 ]+: invalid opcode/);
      }
    });

    it("decrements the users balance",  async ()  => {
      await mockEtherPriceOracle.setPrice(30000);
      await cFA.issue({value: web3.toWei('1', 'ether')});
      await cFA.withdraw(30000);
      const balance = await cFA.balanceOf(accounts[0]);
      assert.equal(balance.valueOf(), 0);
    });

    it("decrements the total supply",  async ()  => {
      await mockEtherPriceOracle.setPrice(30000);
      await cFA.issue({value: web3.toWei('1', 'ether')});
      await cFA.withdraw(30000);
      const totalSupply = await cFA.totalSupply.call();
      assert.equal(totalSupply.toNumber(), 0);
    });

    it("if the price hasn't changed you should get back what you put in",  async ()  => {
      await mockEtherPriceOracle.setPrice(30000);
      await cFA.issue({value: web3.toWei('1', 'ether')});
      const amountWithdrawn = await cFA.withdraw.call(30000);
      assert.equal(amountWithdrawn.toNumber(), web3.toWei('1', 'ether'));
    });

    it("if the price of Ether doubles you should get back half as much Ether (the same amount in USD)",  async ()  => {
      await mockEtherPriceOracle.setPrice(30000);
      await cFA.issue({value: web3.toWei('1', 'ether')});
      await mockEtherPriceOracle.setPrice(60000);
      const amountWithdrawn = await cFA.withdraw.call(30000);
      assert.equal(amountWithdrawn.toNumber(), web3.toWei('0.5', 'ether'));
    });

    it("if the price of Ether gets cut in half and the contract can cover the your balance you should get back twice as much Ether (the same amount in USD)",  async ()  => {
      await cFA.donate({value: web3.toWei('1', 'ether')});
      await mockEtherPriceOracle.setPrice(30000);
      await cFA.issue({value: web3.toWei('1', 'ether')});
      await mockEtherPriceOracle.setPrice(15000);
      const amountWithdrawn = await cFA.withdraw.call(30000);
      assert.equal(amountWithdrawn.toNumber(), web3.toWei('2', 'ether'));
    });

    it("if the price of Ether gets cut in half and the contract can't cover the your balance you should get back half as much Ether",  async ()  => {
      await mockEtherPriceOracle.setPrice(30000);
      await cFA.issue({value: web3.toWei('1', 'ether')});
      await mockEtherPriceOracle.setPrice(15000);
      const amountWithdrawn = await cFA.withdraw.call(30000);
      assert.equal(amountWithdrawn.toNumber(), web3.toWei('1', 'ether'));
    });
  })
})