import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { gql, useQuery } from "@apollo/client";
import { OraclePricesType } from "./types";
import { getCollateralPrice, VAULT_STATUS } from "../components/Vaults/common";
import { BIG_NUMBER_ZERO } from "../utils/constants";

const VAULT_SUMMARY = gql`
  query VaultSummary {
    protocols {
      id
      totalCollateral
      totalDebt
      createdVaults
      underlyingToken {
        symbol
      }
    }
    vaultSummaryByStatuses {
      id
      status
      totalCollateral
      totalDebt
      vaultsAmount
      underlyingToken {
        symbol
      }
    }
  }
`;

type VaultSummary = {
  id: string;
  collateral: string;
  collateralUsd: string;
  debt: string;
  vaultsAmount: number;
};

export const useVaultsSummary = (
  prices: OraclePricesType,
  loadingPrices: boolean
): [() => {}, Array<VaultSummary>] => {
  const { loading, data, refetch } = useQuery(VAULT_SUMMARY, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
  });
  const [vaultsSummary, setVaultsSummary] = useState<Array<VaultSummary>>([]);

  const loadSummary = (protocols: any, vaultSummaryByStatuses: any) => {
    const s = new Array<VaultSummary>();
    if (protocols && Array.isArray(protocols)) {
      let totalCollateral = ethers.BigNumber.from("0");
      let totalCollateralUsd = 0;
      let totalDebt = ethers.BigNumber.from("0");
      let vaultsAmount = ethers.BigNumber.from("0");

      protocols.forEach((item: any) => {
        const cPrice = getCollateralPrice(prices, item.underlyingToken.symbol);
        const collateralUsd =
          parseFloat(ethers.utils.formatEther(item.totalCollateral)) * parseFloat(cPrice);
        s.push({
          id: item.id,
          collateral: item.totalCollateral,
          collateralUsd: collateralUsd.toFixed(2),
          debt: ethers.utils.formatEther(item.totalDebt),
          vaultsAmount: item.createdVaults,
        });

        totalCollateralUsd += collateralUsd;
        totalCollateral = totalCollateral.add(item.totalCollateral);
        totalDebt = totalDebt.add(item.totalDebt);
        vaultsAmount = vaultsAmount.add(item.createdVaults);
      });
      s.push({
        id: "all",
        collateral: "0",
        collateralUsd: totalCollateralUsd.toFixed(2),
        debt: ethers.utils.formatEther(totalDebt),
        vaultsAmount: vaultsAmount.toNumber(),
      });
    }

    if (vaultSummaryByStatuses) {
      let vEmptyAmount = 0;
      let vReadyAmount = 0;
      let vActiveAmount = 0;
      let vReadyCollaterall = 0;
      let vActiveCollaterall = 0;
      let vActiveDebt = BIG_NUMBER_ZERO;

      vaultSummaryByStatuses.forEach((item: any) => {
        const cPrice = getCollateralPrice(prices, item.underlyingToken.symbol);
        const collateralUsd =
          parseFloat(ethers.utils.formatEther(item.totalCollateral)) * parseFloat(cPrice);

        if (item.status === VAULT_STATUS.empty) {
          vEmptyAmount += parseInt(item.vaultsAmount);
        } else if (item.status === VAULT_STATUS.ready) {
          vReadyAmount += parseInt(item.vaultsAmount);
          vReadyCollaterall += collateralUsd;
        } else {
          vActiveAmount += parseInt(item.vaultsAmount);
          vActiveCollaterall += collateralUsd;
          vActiveDebt = vActiveDebt.add(item.totalDebt);
        }

        s.push({
          id: item.id,
          collateral: item.totalCollateral,
          collateralUsd: collateralUsd.toFixed(2),
          debt: ethers.utils.formatEther(item.totalDebt),
          vaultsAmount: parseInt(item.vaultsAmount),
        });
      });

      s.push({
        id: VAULT_STATUS.empty,
        collateral: "0",
        collateralUsd: "0",
        debt: "0",
        vaultsAmount: vEmptyAmount,
      });
      s.push({
        id: VAULT_STATUS.ready,
        collateral: "0",
        collateralUsd: vReadyCollaterall.toFixed(2),
        debt: "0",
        vaultsAmount: vReadyAmount,
      });
      s.push({
        id: VAULT_STATUS.active,
        collateral: "0",
        collateralUsd: vActiveCollaterall.toFixed(2),
        debt: ethers.utils.formatEther(vActiveDebt),
        vaultsAmount: vActiveAmount,
      });
    }

    setVaultsSummary(s);
  };

  useEffect(
    () => {
      const load = () => {
        if (!loading && data && !loadingPrices) {
          loadSummary(data.protocols, data.vaultSummaryByStatuses);
        }
      };
      load();
    },
    // eslint-disable-next-line
    [loading, data, loadingPrices]
  );

  const refetchSummary = async () => {
    await refetch();
  };

  return [refetchSummary, vaultsSummary];
};
