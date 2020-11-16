import chai, { expect } from 'chai'
import { Contract, Wallet, providers } from 'ethers'
import { solidity, deployContract } from 'ethereum-waffle'

import Beef from '../build/Beef.json'
import Timelock from '../build/Timelock.json'
import GovernorAlpha from '../build/GovernorAlpha.json'

import { DELAY } from './utils'

chai.use(solidity)

interface GovernanceFixture {
  beef: Contract
  timelock: Contract
  governorAlpha: Contract
}

export async function governanceFixture(
  [wallet]: Wallet[],
  provider: providers.Web3Provider
): Promise<GovernanceFixture> {
  // deploy Beef, sending the total supply to the deployer
  const { timestamp: now } = await provider.getBlock('latest')
  const timelockAddress = Contract.getContractAddress({ from: wallet.address, nonce: 1 })
  const beef = await deployContract(wallet, Beef, [wallet.address, timelockAddress, now + 60 * 60])

  // deploy timelock, controlled by what will be the governor
  const governorAlphaAddress = Contract.getContractAddress({ from: wallet.address, nonce: 2 })
  const timelock = await deployContract(wallet, Timelock, [governorAlphaAddress, DELAY])
  expect(timelock.address).to.be.eq(timelockAddress)

  // deploy governorAlpha
  const governorAlpha = await deployContract(wallet, GovernorAlpha, [timelock.address, beef.address])
  expect(governorAlpha.address).to.be.eq(governorAlphaAddress)

  return { beef, timelock, governorAlpha }
}
