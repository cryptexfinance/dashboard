import { defaultConfig } from '@web3modal/ethers5/react'

const CoinbaseId = 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa';
const TrustWalletId = '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0';
const RainbowKitId = '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369';
const OkxWalletId = '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709';

export const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

export const arbitrum = {
  chainId: 42161,
  name: 'Arbitrum One',
  currency: 'ETH',
  explorerUrl: 'https://arbiscan.io/',
  rpcUrl: 'https://arb1.arbitrum.io/rpc'
}

export const walletIds = [CoinbaseId, TrustWalletId, RainbowKitId, OkxWalletId]

const metadata = {
  name: 'Cryptex Finance V1',
  description: 'Building innovative, open-source index tokens that empower the crypto and NFT community.',
  url: 'https://cryptex.finance/', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}

export const web3ModalEthersConfig = defaultConfig({
  metadata,
  defaultChainId: 1, // used for the Coinbase SDK
})
