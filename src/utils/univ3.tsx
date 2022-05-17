import { ethers } from "ethers";

export const UNIV3 = {
  NFPositionManagerAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
  stakerAddress: "0xe34139463bA50bD61336E0c446Bd8C0867c6fE65",
  mainnet: {
    tcapPool: {
      id: "0x11456b3750E991383bB8943118ed79C1afdEE192",
      feeTier: 3000,
      incentives: [
        {
          rewardToken: "0x321C2fE4446C7c963dc41Dd58879AF648838f98D",
          pool: "0x11456b3750E991383bB8943118ed79C1afdEE192",
          startTime: 1647347412,
          endTime: 1662899412,
          refundee: "0x570f581D23a2AB09FD1990279D9DB6f5DcE18F4A",
        },
      ],
    },
  },
  rinkeby: {
    tcapPool: {
      id: "0xfb7BDD5B703f57BC7807b9D731503050EdC8c722",
      feeTier: 3000,
      incentives: [
        {
          rewardToken: "0xAa715DbD2ED909B7B7727dC864F3B78276D14A19",
          pool: "0xfb7BDD5B703f57BC7807b9D731503050EdC8c722",
          startTime: 1647347412,
          endTime: 1662899412,
          refundee: "0x570f581D23a2AB09FD1990279D9DB6f5DcE18F4A",
        },
      ],
    },
  },
};

export const GRAPHQL_UNIV3_ENDPOINT = {
  mainnet: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  rinkeby: "https://api.thegraph.com/subgraphs/name/cryptexfinance/tcap-rinkeby-two",
};

export const encodeIncentive = (dataMap: any): string => {
  const INCENTIVE_KEY_ABI =
    "tuple(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee)";
  const abiCoder = new ethers.utils.AbiCoder();
  return abiCoder.encode([INCENTIVE_KEY_ABI], [dataMap]);
};

export const computeIncentiveId = (dataMap: any): string => {
  const INCENTIVE_KEY_ABI =
    "tuple(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee)";
  const abiCoder = new ethers.utils.AbiCoder();
  const bytes = abiCoder.encode([INCENTIVE_KEY_ABI], [dataMap]);
  return ethers.utils.keccak256(bytes);
};
