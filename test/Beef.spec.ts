import chai, { expect } from 'chai'
import { BigNumber, Contract, constants, utils } from 'ethers'
import { solidity, MockProvider, createFixtureLoader, deployContract } from 'ethereum-waffle'
import { ecsign } from 'ethereumjs-util'

import { governanceFixture } from './fixtures'
import { expandTo18Decimals, mineBlock } from './utils'

import Beef from '../build/Beef.json'

chai.use(solidity)

const DOMAIN_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('EIP712Domain(string name,uint256 chainId,address verifyingContract)')
)

const PERMIT_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)

describe('Beef', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999,
    },
  })
  const [wallet, other0, other1] = provider.getWallets()
  const loadFixture = createFixtureLoader([wallet], provider)

  let beef: Contract
  beforeEach(async () => {
    const fixture = await loadFixture(governanceFixture)
    beef = fixture.beef
  })

  it('permit', async () => {
    const domainSeparator = utils.keccak256(
      utils.defaultAbiCoder.encode(
        ['bytes32', 'bytes32', 'uint256', 'address'],
        [DOMAIN_TYPEHASH, utils.keccak256(utils.toUtf8Bytes('Uniswap')), 1, beef.address]
      )
    )

    const owner = wallet.address
    const spender = other0.address
    const value = 123
    const nonce = await beef.nonces(wallet.address)
    const deadline = constants.MaxUint256
    const digest = utils.keccak256(
      utils.solidityPack(
        ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
        [
          '0x19',
          '0x01',
          domainSeparator,
          utils.keccak256(
            utils.defaultAbiCoder.encode(
              ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
              [PERMIT_TYPEHASH, owner, spender, value, nonce, deadline]
            )
          ),
        ]
      )
    )

    const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(wallet.privateKey.slice(2), 'hex'))

    await beef.permit(owner, spender, value, deadline, v, utils.hexlify(r), utils.hexlify(s))
    expect(await beef.allowance(owner, spender)).to.eq(value)
    expect(await beef.nonces(owner)).to.eq(1)

    await beef.connect(other0).transferFrom(owner, spender, value)
  })

  it('nested delegation', async () => {
    await beef.transfer(other0.address, expandTo18Decimals(1))
    await beef.transfer(other1.address, expandTo18Decimals(2))

    let currectVotes0 = await beef.getCurrentVotes(other0.address)
    let currectVotes1 = await beef.getCurrentVotes(other1.address)
    expect(currectVotes0).to.be.eq(0)
    expect(currectVotes1).to.be.eq(0)

    await beef.connect(other0).delegate(other1.address)
    currectVotes1 = await beef.getCurrentVotes(other1.address)
    expect(currectVotes1).to.be.eq(expandTo18Decimals(1))

    await beef.connect(other1).delegate(other1.address)
    currectVotes1 = await beef.getCurrentVotes(other1.address)
    expect(currectVotes1).to.be.eq(expandTo18Decimals(1).add(expandTo18Decimals(2)))

    await beef.connect(other1).delegate(wallet.address)
    currectVotes1 = await beef.getCurrentVotes(other1.address)
    expect(currectVotes1).to.be.eq(expandTo18Decimals(1))
  })

  it('mints', async () => {
    const { timestamp: now } = await provider.getBlock('latest')
    const beef = await deployContract(wallet, Beef, [wallet.address, wallet.address, now + 60 * 60])
    const supply = await beef.totalSupply()

    await expect(beef.mint(wallet.address, 1)).to.be.revertedWith('beef::mint: minting not allowed yet')

    let timestamp = await beef.mintingAllowedAfter()
    await mineBlock(provider, timestamp.toString())

    await expect(beef.connect(other1).mint(other1.address, 1)).to.be.revertedWith('beef::mint: only the minter can mint')
    await expect(beef.mint('0x0000000000000000000000000000000000000000', 1)).to.be.revertedWith('beef::mint: cannot transfer to the zero address')

    // can mint up to 2%
    const mintCap = BigNumber.from(await beef.mintCap())
    const amount = supply.mul(mintCap).div(100)
    await beef.mint(wallet.address, amount)
    expect(await beef.balanceOf(wallet.address)).to.be.eq(supply.add(amount))

    timestamp = await beef.mintingAllowedAfter()
    await mineBlock(provider, timestamp.toString())
    // cannot mint 2.01%
    await expect(beef.mint(wallet.address, supply.mul(mintCap.add(1)))).to.be.revertedWith('beef::mint: exceeded mint cap')
  })
})
