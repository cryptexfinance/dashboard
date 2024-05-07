import React, { useContext, useState } from "react";
import { Button } from "react-bootstrap/esm";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { ethers } from "ethers";
import { useTranslation } from "react-i18next";
import { ReactComponent as SortIcon } from "../../../assets/images/sort.svg";
import { ReactComponent as SortUpIcon } from "../../../assets/images/sort-up.svg";
import { ReactComponent as SortDownIcon } from "../../../assets/images/sort-down.svg";
import Liquidate from "./Liquidate";
import { networkContext } from "../../../state";
import { VaultsPropsType, VaultsType } from "../types";
import { isArbitrum, isInLayer1, numberFormatStr } from "../../../utils/utils";
import {
  capitalize,
  TokenIcon,
  sortCollateralDesc,
  sortCollateralAsc,
  sortCollateralUsdDesc,
  sortCollateralUsdAsc,
  sortDebtDesc,
  sortDebtAsc,
  sortRatioDesc,
  sortRatioAsc,
  sortRewardDesc,
  sortRewardAsc,
  VAULT_STATUS,
} from "../common";
import { TOKENS_SYMBOLS } from "../../../utils/constants";

export const Vaults = ({
  currentAddress,
  vaults,
  setVaults,
  currentStatus,
  pagination,
  refresh,
  setVaultToUpdate,
  myVaults,
}: VaultsPropsType) => {
  const { t } = useTranslation();
  const currentNetwork = useContext(networkContext);
  const indexName = isArbitrum(currentNetwork.chainId) ? TOKENS_SYMBOLS.JPEGz : TOKENS_SYMBOLS.TCAP;
  const [showLiquidate, setShowLiquidate] = useState(false);
  const [vaultIndex, setVaultIndex] = useState(-1);
  const [liqVault, setLiqVault] = useState<VaultsType | null>(null);
  const [collateralSort, setCollateralSort] = useState(0);
  const [collateralUsdSort, setCollateralUsdSort] = useState(0);
  const [debtSort, setDebtSort] = useState(0);
  const [ratioSort, setRatioSort] = useState(0);
  const [rewardSort, setRewardSort] = useState(0);
  // const [renderReward, setRenderReward] = useState(false);

  const liquidateVault = (index: number, lVault: VaultsType) => {
    setVaultIndex(index);
    setLiqVault(lVault);
    setShowLiquidate(true);
  };

  const updateLiqVault = (collateral: ethers.BigNumberish, debt: ethers.BigNumberish) => {
    if (liqVault !== null) {
      refresh(vaultIndex, liqVault.collateralSymbol, liqVault.id, collateral, debt);
    }
  };

  const resetSortTypes = (current: number) => {
    if (current !== 1) {
      setCollateralSort(0);
    }
    if (current !== 2) {
      setCollateralUsdSort(0);
    }
    if (current !== 3) {
      setDebtSort(0);
    }
    if (current !== 4) {
      setRatioSort(0);
    }
    if (current !== 5) {
      setRewardSort(0);
    }
  };

  const onSortCollateralClick = () => {
    const sortType = collateralSort === 1 ? 2 : 1;
    if (sortType === 1) {
      setVaults(vaults.sort(sortCollateralDesc));
    } else {
      setVaults(vaults.sort(sortCollateralAsc));
    }
    setCollateralSort(sortType);
    resetSortTypes(1);
  };

  const onSortCollateralUsdClick = () => {
    const sortType = collateralUsdSort === 1 ? 2 : 1;
    if (sortType === 1) {
      setVaults(vaults.sort(sortCollateralUsdDesc));
    } else {
      setVaults(vaults.sort(sortCollateralUsdAsc));
    }
    setCollateralUsdSort(sortType);
    resetSortTypes(2);
  };

  const onSortDebtClick = () => {
    const sortType = debtSort === 1 ? 2 : 1;
    if (sortType === 1) {
      setVaults(vaults.sort(sortDebtDesc));
    } else {
      setVaults(vaults.sort(sortDebtAsc));
    }
    setDebtSort(sortType);
    resetSortTypes(3);
  };

  const onSortRatioClick = () => {
    const sortType = ratioSort === 1 ? 2 : 1;
    if (sortType === 1) {
      setVaults(vaults.sort(sortRatioDesc));
    } else {
      setVaults(vaults.sort(sortRatioAsc));
    }
    setRatioSort(sortType);
    resetSortTypes(4);
  };

  const onSortRewardClick = () => {
    const sortType = rewardSort === 1 ? 2 : 1;
    if (sortType === 1) {
      setVaults(vaults.sort(sortRewardDesc));
    } else {
      setVaults(vaults.sort(sortRewardAsc));
    }
    setRewardSort(sortType);
    resetSortTypes(5);
  };

  const sortingIncon = (sortOrder: number) => {
    if (sortOrder === 0) {
      return <SortIcon />;
    }
    if (sortOrder === 1) {
      return <SortDownIcon className="desc" />;
    }
    return <SortUpIcon className="asc" />;
  };

  const statusTag = (index: number, v: VaultsType) => {
    if (currentAddress === "") {
      return <span className={v.status}>{capitalize(v.status)}</span>;
    }
    if (v.status === "liquidation") {
      return (
        <Button onClick={() => liquidateVault(index, v)}>
          <span className={v.status}>{capitalize(v.status)}</span>
        </Button>
      );
    }
    return <span className={v.status}>{capitalize(v.status)}</span>;
  };

  const vaultButtonLink = (v: VaultsType) => {
    const vtu = {
      vaultId: v.id,
      assetSymbol: isArbitrum(currentNetwork.chainId) ? TOKENS_SYMBOLS.JPEGz : TOKENS_SYMBOLS.TCAP,
      collateralSymbol: v.collateralSymbol !== "WETH" ? v.collateralSymbol : "ETH",
      isHardVault: v.isHardVault,
    };
    return (
      <Button className="btn-update-vault" onClick={() => setVaultToUpdate(vtu)}>
        <span className={v.status}>Go to Vault</span>
      </Button>
    );
  };

  const newVault = () => {
    const initData = {
      vaultId: "0",
      assetSymbol: !isArbitrum(currentNetwork.chainId) ? TOKENS_SYMBOLS.TCAP : TOKENS_SYMBOLS.JPEGz,
      collateralSymbol: TOKENS_SYMBOLS.ETH,
      isHardVault: isInLayer1(currentNetwork.chainId),
    };
    setVaultToUpdate(initData);
  };

  const IndexIcon = () => {
    if (!isArbitrum(currentNetwork.chainId)) {
      return <TokenIcon name={TOKENS_SYMBOLS.TCAP} />;
    }
    return <TokenIcon name={TOKENS_SYMBOLS.JPEGz} />;
  };

  return (
    <>
      <Table hover className="mt-2 vaults">
        <thead>
          <tr>
            <th className="vault-id">Vault Id</th>
            <th className="status">
              <>{t("status")}</>
              <OverlayTrigger
                key="top"
                placement="right"
                trigger={["hover", "click"]}
                overlay={
                  <Tooltip id="ttip-status" className="vaults-status-tooltip">
                    <>
                      <span className="empty">Empty</span>: {t("monitoring.empty-info")} <br />
                      <span className="ready">Ready</span>:{" "}
                      {t("monitoring.ready-info", { indexName })} <br />
                      <span className="active">Active</span>:{" "}
                      {t("monitoring.active-info", { indexName })} <br />
                      <span className="liquidation">Liquidation</span>:{" "}
                      {t("monitoring.liquidation-info")} <br />
                    </>
                  </Tooltip>
                }
              >
                <Button variant="dark">?</Button>
              </OverlayTrigger>
            </th>
            <th className="collateral">
              <>{t("collateral")}</>
              <button type="button" className="sort" onClick={() => onSortCollateralClick()}>
                {sortingIncon(collateralSort)}
              </button>
            </th>
            <th className="collateral-usd">
              <>{t("collateral")} (USD)</>
              <button type="button" className="sort" onClick={() => onSortCollateralUsdClick()}>
                {sortingIncon(collateralUsdSort)}
              </button>
            </th>
            <th>
              <div className="debt">
                <span>
                  <>{t("debt")}</>
                </span>
                <button type="button" className="sort" onClick={() => onSortDebtClick()}>
                  {sortingIncon(debtSort)}
                </button>
              </div>
            </th>
            <th className="debt-usd">
              <>{t("debt")} (USD)</>
            </th>
            <th className="ratio">
              <>{t("monitoring.ratio")}</>
              <button type="button" className="sort" onClick={() => onSortRatioClick()}>
                {sortingIncon(ratioSort)}
              </button>
            </th>
            {currentStatus === "liquidation" && (
              <th className="ratio">
                <>{t("monitoring.net-reward")}</>
                <button type="button" className="sort" onClick={() => onSortRewardClick()}>
                  {sortingIncon(rewardSort)}
                </button>
              </th>
            )}
            <th />
          </tr>
        </thead>
        <tbody>
          {vaults.map((v, index) => {
            const itemPage = Math.ceil((index + 1) / pagination.itemsPerPage);
            return (
              <tr key={index} className={pagination.current === itemPage ? "show" : "hide"}>
                <td>{numberFormatStr(v.id, 0, 0)}</td>
                <td>
                  <div className="status">
                    {statusTag(index, v)}
                    {v.isHardVault && <span className="mode">H Mode</span>}
                  </div>
                </td>
                <td className="has-tooltip">
                  <OverlayTrigger
                    key={"c-ttip-".concat(index.toString())}
                    placement="bottom"
                    trigger={["focus", "hover"]}
                    overlay={
                      <Tooltip id="ttip-collateral" className="vaults-tooltip">
                        {v.collateralValue}
                      </Tooltip>
                    }
                  >
                    <div className="collateral">
                      <span className="number">{numberFormatStr(v.collateralValue, 4, 4)}</span>
                      <TokenIcon name={v.collateralSymbol.toLowerCase()} />
                    </div>
                  </OverlayTrigger>
                </td>
                <td>
                  <div className="collateral-usd">
                    <span className="number">${numberFormatStr(v.collateralUsd, 2, 2)}</span>
                  </div>
                </td>
                <td className="has-tooltip">
                  <div className="debt">
                    <OverlayTrigger
                      key={"debt-ttip-".concat(index.toString())}
                      placement="bottom"
                      trigger={["hover", "focus"]}
                      overlay={
                        <Tooltip id="ttip-debt" className="vaults-tooltip">
                          {v.debt}
                        </Tooltip>
                      }
                    >
                      <span className="number">{numberFormatStr(v.debt, 4, 4)}</span>
                    </OverlayTrigger>
                    <IndexIcon />
                  </div>
                </td>
                <td>
                  <div className="debt">
                    <span className="number">${numberFormatStr(v.debtUsd, 2, 2)}</span>
                  </div>
                </td>
                <td>
                  <div className="ratio">
                    <OverlayTrigger
                      key="top"
                      placement="bottom"
                      trigger={["focus", "hover"]}
                      overlay={
                        <Tooltip id="ttip-collateral" className="vaults-tooltip">
                          Min Ratio: {v.minRatio}%
                        </Tooltip>
                      }
                    >
                      <span className={v.status}>
                        {v.ratio < 1000000 ? v.ratio.toFixed(0) : v.ratio.toExponential(1)}
                        {v.ratio === 0 ? "" : "%"}
                      </span>
                    </OverlayTrigger>
                  </div>
                </td>
                {currentStatus === VAULT_STATUS.liquidation && (
                  <td>
                    <div className="ratio">
                      <span className="active">${v.netReward.toFixed(2)}</span>
                    </div>
                  </td>
                )}
                <td className="go-to-vault">{v.url !== "" && <>{vaultButtonLink(v)}</>}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {vaults.length === 0 && currentAddress !== "" && myVaults && currentStatus === "all" && (
        <div className="no-vaults-box">
          <p>
            No Vaults yet. Please
            <Button className="btn-create-vault" onClick={() => newVault()}>
              CREATE
            </Button>
            your first vault.
          </p>
        </div>
      )}
      {vaults.length === 0 && !myVaults && (
        <div className="no-vaults-box">
          <p>No vaults found.</p>
        </div>
      )}
      <Liquidate
        show={showLiquidate}
        currentAddress={currentAddress}
        liqVault={liqVault}
        onHide={() => {
          setLiqVault(null);
          setVaultIndex(-1);
          setShowLiquidate(false);
        }}
        refresh={updateLiqVault}
      />
    </>
  );
};
