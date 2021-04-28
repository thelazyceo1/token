// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("ERC contract", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let Token;
  let hardhatToken;
  let owner;
  let addr1;
  let addr3;
  let addr2;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("Xof");
    [owner, addr1,addr3, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    hardhatToken = await Token.deploy();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await hardhatToken.minter()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transfer", function () {

    it("Should transfer tokens between accounts", async function () {
      // Transfer 50 tokens from owner to addr1
      await hardhatToken.transfer(addr1.address, 50);
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      await hardhatToken.connect(addr1).transfer(addr2.address, 50);
      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr2 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr3).transfer(owner.address, 50)
      ).to.be.revertedWith("Not enough tokens");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await hardhatToken.transfer(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await hardhatToken.transfer(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await hardhatToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(100);

      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(50);
    });
  });

  describe("Issue", function () {
    it("Should Mint tokens to the correct accounts", async function () {
      // Mint 50 tokens for addr1
      await hardhatToken.issue(owner.address, 150);
      const addr1Balance = await hardhatToken.balanceOf(owner.address);
      expect(addr1Balance).to.equal(500000150);
    });

     it("Should fail if the sender is not the owner", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).issue(owner.address, 1)
      ).to.be.revertedWith("ERC20: owner only feature");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });


  describe("Burn", function () {
    it("Should Burn tokens from the correct accounts", async function () {
      // Mint 50 tokens for addr1
      await hardhatToken.burn(owner.address, 150);
      const addr1Balance = await hardhatToken.balanceOf(owner.address);
      expect(addr1Balance).to.equal(500000000 - 150);
    });

     it("Should fail if the sender is not the owner", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).burn(owner.address, 1)
      ).to.be.revertedWith("ERC20: owner only feature");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Decrease Allowance", function () {
    it("Should Decrease Allowance tokens from the correct accounts", async function () {
      // Mint 50 tokens for addr1
      await hardhatToken.burn(owner.address, 150);
      const addr1Balance = await hardhatToken.balanceOf(owner.address);
      expect(addr1Balance).to.equal(500000000 - 150);
    });

     it("Should fail if the sender is not the owner", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).burn(owner.address, 1)
      ).to.be.revertedWith("ERC20: owner only feature");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

   describe("Increase Allowance", function () {
    it("Should Increase Allowance tokens from the correct accounts", async function () {
      // Mint 50 tokens for addr1
      await hardhatToken.burn(owner.address, 150);
      const addr1Balance = await hardhatToken.balanceOf(owner.address);
      expect(addr1Balance).to.equal(500000000 - 150);
    });

     it("Should fail if the sender is not the owner", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).burn(owner.address, 1)
      ).to.be.revertedWith("ERC20: owner only feature");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("TransferFrom", function () {
    it("Should TransferFrom tokens from the correct accounts", async function () {
      // Mint 50 tokens for addr1
      await hardhatToken.burn(owner.address, 150);
      const addr1Balance = await hardhatToken.balanceOf(owner.address);
      expect(addr1Balance).to.equal(500000000 - 150);
    });

     it("Should fail if the sender is not the owner", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).burn(owner.address, 1)
      ).to.be.revertedWith("ERC20: owner only feature");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Freeze", function () {
    it("Should Freeze tokens from the correct accounts", async function () {
      // Mint 50 tokens for addr1
      await hardhatToken.burn(owner.address, 150);
      const addr1Balance = await hardhatToken.balanceOf(owner.address);
      expect(addr1Balance).to.equal(500000000 - 150);
    });

     it("Should fail if the sender is not the owner", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).burn(owner.address, 1)
      ).to.be.revertedWith("ERC20: owner only feature");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Unfreeze", function () {
    it("Should Unfreeze tokens from the correct accounts", async function () {
      // Mint 50 tokens for addr1
      await hardhatToken.burn(owner.address, 150);
      const addr1Balance = await hardhatToken.balanceOf(owner.address);
      expect(addr1Balance).to.equal(500000000 - 150);
    });

     it("Should fail if the sender is not the owner", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).burn(owner.address, 1)
      ).to.be.revertedWith("ERC20: owner only feature");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });

})