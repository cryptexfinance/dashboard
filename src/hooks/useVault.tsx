import { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Contract } from "ethers-multicall";
import {
  hardVaultsContext,
  oraclesContext,
  networkContext,
  signerContext,
  tokensContext,
  vaultsContext,
} from "../state/index";
import { validVaults, validHardVaults } from "../utils/utils";
import { NETWORKS, TOKENS_SYMBOLS } from "../utils/constants";

type contractsType = {
  currentAsset: ethers.Contract | null;
  currentCollateral: ethers.Contract | null;
  currentVault: ethers.Contract | null;
  currentAssetRead: Contract | null;
  currentCollateralRead: Contract | null;
  currentVaultRead: Contract | null;
  currentCollateralOracleRead: Contract | null;
  currentAssetOracleRead: Contract | null;
};

export const useVault = (
  assetSymbol: string,
  collateralSymbol: string,
  isHardVault: boolean
): [contractsType, boolean] => {
  const currentNetwork = useContext(networkContext);
  const signer = useContext(signerContext);
  const oracles = useContext(oraclesContext);
  const hardVaults = useContext(hardVaultsContext);
  const vaults = useContext(vaultsContext);
  const tokens = useContext(tokensContext);

  const [loadingVault, setLoadingVault] = useState(true);
  const [currentAsset, setCurrentAsset] = useState<ethers.Contract | null>(null);
  const [currentCollateral, setCurrentCollateral] = useState<ethers.Contract | null>(null);
  const [currentVault, setCurrentVault] = useState<ethers.Contract | null>(null);
  const [currentAssetRead, setCurrentAssetRead] = useState<Contract | null>(null);
  const [currentCollateralRead, setCurrentCollateralRead] = useState<Contract | null>(null);
  const [currentVaultRead, setCurrentVaultRead] = useState<Contract | null>(null);
  const [currentOracleRead, setCurrentOracleRead] = useState<Contract | null>(null);
  const [currentAssetOracleRead, setCurrentAssetOracleRead] = useState<Contract | null>(null);

  const loadContracts = async () => {
    let cAsset = tokens.tcapToken;
    let cAssetRead = tokens.tcapTokenRead;
    let cCollateral = tokens.wethToken;
    let cCollateralRead = tokens.wethTokenRead;
    let cVault = hardVaults.wethVault;
    let cVaultRead = hardVaults.wethVaultRead;
    let cOracleRead = oracles.wethOracleRead;
    let cAssetOracleRead = oracles.tcapOracleRead;

    if (isHardVault) {
      cVault = hardVaults.wethVault;
      cVaultRead = hardVaults.wethVaultRead;
    }
    if (assetSymbol === TOKENS_SYMBOLS.JPEGz) {
      cAsset = tokens.jpegzToken;
      cAssetRead = tokens.jpegzTokenRead;
      cAssetOracleRead = oracles.jpegzOracleRead;
    }

    switch (collateralSymbol) {
      case TOKENS_SYMBOLS.DAI:
        if (isHardVault) {
          cVault = hardVaults.daiVault;
          cVaultRead = hardVaults.daiVaultRead;
        } else {
          cVault = vaults.daiVault;
          cVaultRead = vaults.daiVaultRead;
        }
        cCollateral = tokens.daiToken;
        cCollateralRead = tokens.daiTokenRead;
        cOracleRead = oracles.daiOracleRead;
        break;
      case TOKENS_SYMBOLS.AAVE:
        cVault = vaults.aaveVault;
        cVaultRead = vaults.aaveVaultRead;
        cCollateral = tokens.aaveToken;
        cCollateralRead = tokens.aaveTokenRead;
        cOracleRead = oracles.aaveOracleRead;
        break;
      case TOKENS_SYMBOLS.LINK:
        cVault = vaults.linkVault;
        cVaultRead = vaults.linkVaultRead;
        cCollateral = tokens.daiToken;
        cCollateralRead = tokens.daiTokenRead;
        cOracleRead = oracles.linkOracleRead;
        break;
      case TOKENS_SYMBOLS.SNX:
        cVault = vaults.snxVault;
        cVaultRead = vaults.snxVaultRead;
        cCollateral = tokens.snxToken;
        cCollateralRead = tokens.snxTokenRead;
        cOracleRead = oracles.snxOracleRead;
        break;
      case TOKENS_SYMBOLS.UNI:
        cVault = vaults.uniVault;
        cVaultRead = vaults.uniVaultRead;
        cCollateral = tokens.uniToken;
        cCollateralRead = tokens.uniTokenRead;
        cOracleRead = oracles.uniOracleRead;
        break;
      case TOKENS_SYMBOLS.MATIC:
        cVault = vaults.maticVault;
        cVaultRead = vaults.maticVaultRead;
        cCollateral = tokens.maticToken;
        cCollateralRead = tokens.maticTokenRead;
        cOracleRead = oracles.maticOracleRead;
        break;
      case TOKENS_SYMBOLS.WBTC:
        if (isHardVault) {
          cVault = hardVaults.wbtcVault;
          cVaultRead = hardVaults.wbtcVaultRead;
        } else {
          cVault = vaults.wbtcVault;
          cVaultRead = vaults.wbtcVaultRead;
        }
        cCollateral = tokens.wbtcToken;
        cCollateralRead = tokens.wbtcTokenRead;
        cOracleRead = oracles.wbtcOracleRead;
        break;
      case TOKENS_SYMBOLS.USDC:
        cVault = hardVaults.usdcVault;
        cVaultRead = hardVaults.usdcVaultRead;
        cCollateral = tokens.usdcToken;
        cCollateralRead = tokens.usdcTokenRead;
        cOracleRead = oracles.usdcOracleRead;
        break;
      default:
        if (isHardVault) {
          cVault = hardVaults.wethVault;
          cVaultRead = hardVaults.wethVaultRead;
        } else {
          cVault = vaults.wethVault;
          cVaultRead = vaults.wethVaultRead;
        }
        cCollateral = tokens.wethToken;
        cCollateralRead = tokens.wethTokenRead;
        cOracleRead = oracles.wethOracleRead;
        break;
    }

    // @ts-ignore
    setCurrentAsset(cAsset);
    // @ts-ignore
    setCurrentCollateral(cCollateral);
    // @ts-ignore
    setCurrentAssetRead(cAssetRead);
    // @ts-ignore
    setCurrentCollateralRead(cCollateralRead);
    // @ts-ignore
    setCurrentVault(cVault);
    // @ts-ignore
    setCurrentVaultRead(cVaultRead);
    // @ts-ignore
    setCurrentOracleRead(cOracleRead);
    // @ts-ignore
    setCurrentAssetOracleRead(cAssetOracleRead);
  };

  useEffect(() => {
    const load = async () => {
      if (
        signer &&
        signer.signer &&
        validVaults(currentNetwork.chainId || NETWORKS.mainnet.chainId, vaults) &&
        validHardVaults(currentNetwork.chainId || NETWORKS.mainnet.chainId, hardVaults)
      ) {
        setLoadingVault(true);
        await loadContracts();
        setLoadingVault(false);
      }
    };
    load();
    // eslint-disable-next-line
  }, [signer.signer, collateralSymbol, isHardVault]);

  return [
    {
      currentAsset,
      currentCollateral,
      currentVault,
      currentAssetRead,
      currentCollateralRead,
      currentVaultRead,
      currentCollateralOracleRead: currentOracleRead,
      currentAssetOracleRead,
    },
    loadingVault,
  ];
};
