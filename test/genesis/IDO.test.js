
const {
  userAddress,
  governorAddress,
  genesisGroup,
  minterAddress,
  beneficiaryAddress1,
  beneficiaryAddress2,
  ZERO_ADDRESS,
  BN,
  expectEvent,
  expectRevert,
  expect,
  time,
  IDO,
  Fei,
  Tribe,
  MockPair,
  MockRouter,
  getCore
} = require('../helpers');

describe('IDO', function () {
  const LIQUIDITY_INCREMENT = 10000; // amount of liquidity created by mock for each deposit

  beforeEach(async function () {
    
    this.core = await getCore(true);

    this.fei = await Fei.at(await this.core.fei());
    this.tribe = await Tribe.at(await this.core.tribe());

    this.pair = await MockPair.new(this.fei.address, this.tribe.address);
    this.router = await MockRouter.new(this.pair.address);

    this.window = new BN(4 * 365 * 24 * 60 * 60);
    this.ido = await IDO.new(this.core.address, beneficiaryAddress1, this.window, this.pair.address, this.router.address);
    await this.core.grantMinter(this.ido.address, {from: governorAddress});
    await this.core.grantBurner(this.ido.address, {from: governorAddress});

    await this.core.allocateTribe(this.ido.address, 100000, {from: governorAddress});
  });

  describe('Init', function() {
    describe('Bad Duration', function() {
      it('reverts', async function() {
        await expectRevert(IDO.new(this.core.address, beneficiaryAddress1, 0, this.pair.address, this.router.address), "LinearTokenTimelock: duration is 0");
      });
    });

    describe('Bad Beneficiary', function() {
      it('reverts', async function() {
        await expectRevert(IDO.new(this.core.address, ZERO_ADDRESS, this.window, this.pair.address, this.router.address), "LinearTokenTimelock: Beneficiary must not be 0 address");
      });
    });

    it('pair', async function() {
      expect(await this.ido.pair()).to.be.equal(this.pair.address);
    });

    it('router', async function() {
      expect(await this.ido.router()).to.be.equal(this.router.address);
    });

    it('duration', async function() {
      expect(await this.ido.duration()).to.be.bignumber.equal(this.window);
    });

    it('locked token', async function() {
      expect(await this.ido.lockedToken()).to.be.equal(this.pair.address);
    });

    it('beneficiary', async function() {
      expect(await this.ido.beneficiary()).to.be.equal(beneficiaryAddress1);
      expect(await this.ido.pendingBeneficiary()).to.be.equal(ZERO_ADDRESS);
    });

    it('initial balance', async function() {
      expect(await this.ido.initialBalance()).to.be.bignumber.equal('0');
    });
  });

  describe('UnlockLiquidity', function() {
    describe('Not Governor', function() {
      it('reverts', async function() {
        await expectRevert(this.ido.unlockLiquidity({from: userAddress}), "CoreRef: Caller is not a governor");
      });
    });

    describe('From Governor', function() {
      beforeEach(async function() {
        await this.ido.unlockLiquidity({from: governorAddress});
      });
      it('succeeds', async function() {
        expect(await this.ido.totalToken()).to.be.bignumber.equal(new BN('0'));
      });
    });
  });

  describe('Swap', function() {
    describe('Not Genesis Group', function() {
      it('reverts', async function() {
        await expectRevert(this.ido.swapFei('5000', {from: userAddress}), "CoreRef: Caller is not GenesisGroup");
      });
    });

    describe('From Genesis Group', function() {
      beforeEach(async function() {
        await this.pair.setReserves('500000', '100000');
        await this.fei.mint(this.pair.address, '500000', {from: minterAddress});

        await this.fei.mint(genesisGroup, '50000', {from: minterAddress});
        await this.core.allocateTribe(this.pair.address, 100000, {from: governorAddress});
      });

      describe('Not approved', function() {
        it('reverts', async function() {
          await expectRevert(this.ido.swapFei('50000', {from: genesisGroup}), "ERC20: transfer amount exceeds allowance");
        });
      });
      describe('Approved', function() {
        beforeEach(async function() {
          await this.fei.approve(this.ido.address, '50000', {from: genesisGroup});
          await this.ido.swapFei('50000', {from: genesisGroup});
        });

        it('genesis group balances', async function() {
          expect(await this.fei.balanceOf(this.ido.address)).to.be.bignumber.equal(new BN(0));
        });

        it('updates pair balances', async function() {
          expect(await this.fei.balanceOf(this.pair.address)).to.be.bignumber.equal(new BN(500000)); // swap amount is burned
        });
      });
    });
  });

  describe('Deploy', function() {
    describe('Not Genesis Group', function() {
      it('reverts', async function() {
        await expectRevert(this.ido.deploy(['5000000000000000000'], {from: userAddress}), "CoreRef: Caller is not GenesisGroup");
      });
    });

    describe('From Genesis Group', function() {
      beforeEach(async function() {
        expectEvent(
          await this.ido.deploy(['5000000000000000000'], {from: genesisGroup}),
          'Deploy',
          {
            _amountFei: "500000",
            _amountTribe: "100000"
          }
        );
      });

      it('updates ido balances', async function() {
        expect(await this.fei.balanceOf(this.ido.address)).to.be.bignumber.equal(new BN(0));
        expect(await this.tribe.balanceOf(this.ido.address)).to.be.bignumber.equal(new BN(0));
        expect(await this.pair.balanceOf(this.ido.address)).to.be.bignumber.equal(new BN(10000));
      });

      it('updates pair balances', async function() {
        expect(await this.fei.balanceOf(this.pair.address)).to.be.bignumber.equal(new BN(500000));
        expect(await this.tribe.balanceOf(this.pair.address)).to.be.bignumber.equal(new BN(100000));
      });

      it('updates total token', async function() {
        expect(await this.ido.totalToken()).to.be.bignumber.equal(new BN(LIQUIDITY_INCREMENT));
      });

      describe('After window', function() {
        beforeEach(async function() {
          await time.increase(this.window);
          expectEvent(
            await this.ido.release(beneficiaryAddress1, LIQUIDITY_INCREMENT, {from: beneficiaryAddress1}),
            'Release',
            {
              _beneficiary: beneficiaryAddress1,
              _recipient: beneficiaryAddress1,
              _amount: new BN(LIQUIDITY_INCREMENT)
            }
          );
        });

        it('already released all', async function() {
          expect(await this.ido.initialBalance()).to.be.bignumber.equal(new BN(LIQUIDITY_INCREMENT));
          expect(await this.ido.alreadyReleasedAmount()).to.be.bignumber.equal(new BN(LIQUIDITY_INCREMENT));
        });

        it('nothing available for release', async function() {
          expect(await this.ido.availableForRelease()).to.be.bignumber.equal(new BN(0));
        });

        it('updates user balances', async function() {
          expect(await this.pair.balanceOf(beneficiaryAddress1)).to.be.bignumber.equal(new BN(LIQUIDITY_INCREMENT));
        });
      });
    });
  });
  
  describe('Beneficiary', function() {
    it('change succeeds', async function() {
      await this.ido.setPendingBeneficiary(beneficiaryAddress2, {from: beneficiaryAddress1});
      expect(await this.ido.pendingBeneficiary()).to.be.equal(beneficiaryAddress2);
      expect(await this.ido.beneficiary()).to.be.equal(beneficiaryAddress1);
      await this.ido.acceptBeneficiary({from: beneficiaryAddress2});
      expect(await this.ido.beneficiary()).to.be.equal(beneficiaryAddress2);
    });

    it('unauthorized set fails', async function() {
      await expectRevert(this.ido.setPendingBeneficiary(beneficiaryAddress2, {from: beneficiaryAddress2}), "LinearTokenTimelock: Caller is not a beneficiary");
    });

    it('unauthorized accept fails', async function() {
      await this.ido.setPendingBeneficiary(beneficiaryAddress2, {from: beneficiaryAddress1});
      expect(await this.ido.pendingBeneficiary()).to.be.equal(beneficiaryAddress2);
      expect(await this.ido.beneficiary()).to.be.equal(beneficiaryAddress1);
      await expectRevert(this.ido.acceptBeneficiary({from: userAddress}), "LinearTokenTimelock: Caller is not pending beneficiary");
    });
  });
});