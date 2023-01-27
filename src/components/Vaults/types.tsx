import { ethers } from "ethers";

export type PaginationType = {
  previous: number;
  current: number;
  next: number;
  pages: number;
  lastDataPage: number;
  itemsPerPage: number;
  itemsCount: number;
  lastId: string;
};

export type VaultsPropsType = {
  currentAddress: string;
  vaults: Array<VaultsType>;
  setVaults: (v: Array<VaultsType>) => void;
  currentStatus: string;
  pagination: PaginationType;
  refresh: (
    index: number,
    symbol: string,
    vaultId: string,
    collateral: ethers.BigNumberish,
    debt: ethers.BigNumberish
  ) => void;
  setVaultToUpdate: (initData: VaultToUpdateType) => void;
  myVaults: boolean;
};

export type VaultsRatioType = {
  ethRatio: number;
  wethRatio: number;
  daiRatio: number;
  aaveRatio: number;
  linkRatio: number;
  uniRatio: number;
  snxRatio: number;
  maticRatio: number;
  wbtcRatio: number;
  hardEthRatio: number;
  hardWethRatio: number;
  hardDaiRatio: number;
  hardUsdcRatio: number;
};

export type VaultsType = {
  id: string;
  collateralSymbol: string;
  collateralValue: string;
  collateralUsd: string;
  debt: string;
  debtUsd: string;
  ratio: number;
  minRatio: string;
  decimals: number;
  isHardVault: boolean;
  netReward: number;
  status: string;
  blockTS: string;
  url: string;
};

export type VaultsTotalsType = {
  vaults: number;
  collateral: string;
  collateralUSD: string;
  debt: string;
  debtUSD: string;
};

export type VaultToUpdateType = {
  vaultId: string;
  assetSymbol: string;
  collateralSymbol: string;
  isHardVault: boolean;
}

export type DropdownItemType = {
  key: string;
  name: string;
};
