// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("DuniaBank contract", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let Token;
  let hardhatToken;
  let owner;
  let alice;
  let bob;
  let others;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("DuniaBank");
    [owner, alice, bob, ...others] = await ethers.getSigners();

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
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });
  });

  describe("Transactions", function () {
    it("should mark addresses as enrolled", async function () {

    });

    it("should not mark unenrolled users as enrolled", async function () {

    });

    it("should deposit correct amount", async function () {

    });

    it("should log a deposit event when a deposit is made", async function () {

    });

    it("should withdraw correct amount", async function () {

    });

    it("should not be able to withdraw more than has been deposited", async function () {

    });

    it("should emit the appropriate event when a withdrawal is made", async function () {

    });

    it("Deposit To Savings", async function () {

    });

    it("Withdraw from Savings", async function () {

    });

    it("Remove liquidity", async function () {

    });

    it("Add liquidity", async function () {

    });
  });
});