export const NETWORKS = {
  mainnet: {
    chainId: 1,
    hexChainId: "0x1",
    name: "mainnet",
    eth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
    mushroomNft: "0x91877f3928379E972aC28Ea9076DED52C9738b7c",
    ethPool: "0xa87e2c5d5964955242989b954474ff2eb08dd2f5",
    ethUniPool: "0x11456b3750E991383bB8943118ed79C1afdEE192",
    daiPool: "",
    ctxPool: "0x2a93167ed63a31f35ca4788e2eb9fbd9fa6089d0",
    lpUrl: "https://app.sushi.com",
    alchemyUrl: "https://eth-mainnet.g.alchemy.com/v2/".concat(
      process.env.REACT_APP_ALCHEMY_KEY || ""
    ),
    infuraRpcUrl: "https://mainnet.infura.io/v3/".concat(process.env.REACT_APP_INFURA_ID || ""),
    infuraFortmaticRpcUrl: "https://mainnet.infura.io/v3/".concat(
      process.env.REACT_APP_FORTMATIC_INFURA_ID || ""
    ),
  },
  goerli: {
    chainId: 5,
    hexChainId: "0x5",
    name: "goerli",
    dai: "0x6c913fa678C81c567A11EdF19E06bE758DBeFe2D",
    eth: "0xFfb99f4A02712C909d8F7cC44e67C87Ea1E71E83",
    weth: "0xAEb34d4C107BDa831C0B50d68eb13F2469FB21f5",
    mushroomNft: "0x209c23db16298504354112fa4210d368e1d564da",
    alchemyUrl: "https://eth-goerli.g.alchemy.com/v2/".concat(
      process.env.REACT_APP_ALCHEMY_KEY_GOERLI || ""
    ),
    infuraRpcUrl: "https://goerli.infura.io/v3/".concat(process.env.REACT_APP_INFURA_ID || ""),
    infuraFortmaticRpcUrl: "https://goerli.infura.io/v3/".concat(
      process.env.REACT_APP_FORTMATIC_INFURA_ID || ""
    ),
  },
  arbitrum: {
    chainId: 42161,
    hexChainId: "0xA4B1",
    name: "Arbitrum One",
    eth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    weth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    dai: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  },
  arbitrum_goerli: {
    chainId: 421613,
    hexChainId: "0x66EED",
    name: "Arbitrum Goerli",
    eth: "0xfe46F29B9fC3d83d09336dDe9195553aDb812A16",
    weth: "0xfe46F29B9fC3d83d09336dDe9195553aDb812A16",
    dai: "0x630c6B571ba97081215a10690364eF352AA98d20",
  },
  optimism: {
    chainId: 10,
    hexChainId: "0xA",
    name: "optimism",
    eth: "0x4200000000000000000000000000000000000006",
    weth: "0x4200000000000000000000000000000000000006",
    dai: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
    link: "0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6",
    snx: "0x8700daec35af8ff88c16bdf0418774cb3d7599b4",
    uni: "0x6fd9d7ad17242c41f7131d257212c54a0e816691",
    infuraRpcUrl: "https://optimism-mainnet.infura.io/v3/".concat(
      process.env.REACT_APP_INFURA_ID || ""
    ),
  },
  okovan: {
    chainId: 69,
    hexChainId: "0x45",
    name: "opt-kovan",
    eth: "0x13fcDc22A2C9E558f21d17B688C38B2B5E2B4eF6",
    weth: "0x13fcDc22A2C9E558f21d17B688C38B2B5E2B4eF6",
    dai: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
    infuraRpcUrl: "https://optimism-kovan.infura.io/v3/".concat(
      process.env.REACT_APP_INFURA_ID || ""
    ),
  },
  polygon: {
    chainId: 137,
    hexChainId: "0x89",
    name: "matic",
    dai: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    matic: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  },
  mumbai: {
    chainId: 80001,
    hexChainId: "0x13881",
    name: "matic",
    dai: "0xb89c4c3ED0C6CA1C6a522CD2ddE9B197D4142Fe2",
    matic: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
  },
};

export const API_ENDPOINT = "https://test-api.cryptex.finance";

export const GRAPHQL_ENDPOINT = {
  mainnet: "https://api.thegraph.com/subgraphs/name/cryptexfinance/tcap-graph",
  goerli: "https://api.thegraph.com/subgraphs/name/jdestephen/cryptex-goerli-demo",
  arbitrum: "https://api.thegraph.com/subgraphs/name/jdestephen/cryptex-arbitrum-demo",
  arbitrum_goerli: "https://api.thegraph.com/subgraphs/name/jdestephen/arbitrum-goerli-demo",
  optimism: "https://api.thegraph.com/subgraphs/name/cryptexfinance/cryptex-optimism",
  okovan: "https://api.thegraph.com/subgraphs/name/jdestephen/tcap-demo",
  polygon: "https://api.thegraph.com/subgraphs/name/cryptexfinance/tcap-polygon",
  mumbai: "https://api.thegraph.com/subgraphs/name/cryptexfinance/tcap-polygon",
};

export const OS_API_URL = {
  mainnet: "https://deep-index.moralis.io/api/v2",
  goerli: "https://deep-index.moralis.io/api/v2",
};

export const FEATURES = {
  KEEPERS_API: true,
  NEW_VAULTS: true,
  OPTIMISM: false,
  POLYGON: false,
};

export const TOKENS_SYMBOLS = {
  AAVE: "AAVE",
  DAI: "DAI",
  ETH: "ETH",
  JPEGz: "JPEGz",
  LINK: "LINK",
  MATIC: "MATIC",
  SNX: "SNX",
  TCAP: "TCAP",
  UNI: "UNI",
  USDC: "USDC",
  WETH: "WETH",
  WBTC: "WBTC",
};
