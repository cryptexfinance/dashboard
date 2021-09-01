export const NETWORKS = {
  mainnet: {
    chainId: 1,
    name: "mainnet",
    eth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
  },
  rinkeby: {
    chainId: 4,
    name: "rinkeby",
    eth: "0x5D3E425A099c2863224d6D63b330Df0F22B299b9",
    weth: "0x5D3E425A099c2863224d6D63b330Df0F22B299b9",
    dai: "0x118a4238E4086FAE2621D0336C0E6cdC1257BE82",
  },
  polygon: {
    chainId: 137,
    name: "matic",
    eth: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    weth: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    dai: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    matic: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  },
};

export const GRAPHQL_ENDPOINT = {
  mainnet: "https://api.thegraph.com/subgraphs/name/cryptexfinance/tcap-graph",
  rinkeby: "https://api.thegraph.com/subgraphs/name/cryptexfinance/tcap-rinkeby-two",
  polygon: "https://api.thegraph.com/subgraphs/name/cryptexfinance/tcap-polygon",
};
