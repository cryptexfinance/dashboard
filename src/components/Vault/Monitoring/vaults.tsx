import React, { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import { ReactComponent as SortIcon } from "../../../assets/images/sort.svg";
import { ReactComponent as SortUpIcon } from "../../../assets/images/sort-up.svg";
import { ReactComponent as SortDownIcon } from "../../../assets/images/sort-down.svg";
import Liquidate from "./Liquidate";
import { PaginationType, VaultsType } from "./types";
import {
  capitalize,
  CollateralIcon,
  numberFormatStr,
  sortCollateralDesc,
  sortCollateralAsc,
  sortCollateralUsdDesc,
  sortCollateralUsdAsc,
  sortDebtDesc,
  sortDebtAsc,
  sortRatioDesc,
  sortRatioAsc,
} from "./common";

type dataType = {
  currentAddress: string;
  vaults: Array<VaultsType>;
  setVaults: (v: Array<VaultsType>) => void;
  pagination: PaginationType;
  refresh: (index: number, symbol: string) => void;
};

export const Vaults = ({ currentAddress, vaults, setVaults, pagination, refresh }: dataType) => {
  const [showLiquidate, setShowLiquidate] = useState(false);
  const [vaultIndex, setVaultIndex] = useState(-1);
  const [vaultId, setVaultId] = useState("");
  const [vaultType, setVaultType] = useState("");
  const [collateralSort, setCollateralSort] = useState(0);
  const [collateralUsdSort, setCollateralUsdSort] = useState(0);
  const [debtSort, setDebtSort] = useState(0);
  const [ratioSort, setRatioSort] = useState(0);

  const liquidateVault = (index: number, id: string, type: string) => {
    setVaultId(id);
    setVaultIndex(index);
    setVaultType(type);
    setShowLiquidate(true);
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

  const sortingIncon = (sortOrder: number) => {
    if (sortOrder === 0) {
      return <SortIcon />;
    }
    if (sortOrder === 1) {
      return <SortDownIcon className="desc" />;
    }
    return <SortUpIcon className="asc" />;
  };

  return (
    <>
      <Table hover className="mt-2 vaults">
        <thead>
          <tr>
            <th className="status">
              Status
              <OverlayTrigger
                key="top"
                placement="right"
                trigger={["hover", "click"]}
                overlay={
                  <Tooltip id="ttip-status" className="vaults-status-tooltip">
                    <span className="empty">Empty</span>: There is not collateral on the vault.{" "}
                    <br />
                    <span className="ready">Ready</span>: Vault has collateral and it is ready to
                    mint TCAP. <br />
                    <span className="active">Active</span>: Vault is minting TCAP. <br />
                    <span className="liquidation">Liquidation</span>: Ratio is less than min
                    required. <br />
                  </Tooltip>
                }
              >
                <Button variant="dark">?</Button>
              </OverlayTrigger>
            </th>
            <th className="collateral">
              Collateral
              <button type="button" className="sort" onClick={() => onSortCollateralClick()}>
                {sortingIncon(collateralSort)}
              </button>
            </th>
            <th className="collateral-usd">
              Collateral (USD)
              <button type="button" className="sort" onClick={() => onSortCollateralUsdClick()}>
                {sortingIncon(collateralUsdSort)}
              </button>
            </th>
            <th>
              <div className="debt">
                <TcapIcon className="tcap" /> <span>Debt</span>
                <button type="button" className="sort" onClick={() => onSortDebtClick()}>
                  {sortingIncon(debtSort)}
                </button>
              </div>
            </th>
            <th className="debt-usd">Debt (USD)</th>
            <th className="ratio">
              Ratio
              <button type="button" className="sort" onClick={() => onSortRatioClick()}>
                {sortingIncon(ratioSort)}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {vaults.map((v, index) => {
            const itemPage = Math.ceil((index + 1) / pagination.itemsPerPage);
            return (
              <tr key={index} className={pagination.current === itemPage ? "show" : "hide"}>
                <td>
                  <div className="status">
                    {v.status === "liquidation" && currentAddress !== "" ? (
                      <Button onClick={() => liquidateVault(index, v.id, v.collateralSymbol)}>
                        <span className={v.status}>{capitalize(v.status)}</span>
                      </Button>
                    ) : (
                      <span className={v.status}>{capitalize(v.status)}</span>
                    )}
                  </div>
                </td>
                <td>
                  <OverlayTrigger
                    key="top"
                    placement="bottom"
                    trigger={["focus", "hover"]}
                    overlay={
                      <Tooltip id="ttip-collateral" className="vaults-tooltip">
                        {numberFormatStr(v.collateralValue, 4, 12)}
                      </Tooltip>
                    }
                  >
                    <div className="collateral">
                      <span className="number">{numberFormatStr(v.collateralValue, 4, 4)}</span>
                      <CollateralIcon name={v.collateralSymbol.toLowerCase()} />
                    </div>
                  </OverlayTrigger>
                </td>
                <td>
                  <div className="collateral-usd">
                    <span className="number">${numberFormatStr(v.collateralUsd, 2, 2)}</span>
                  </div>
                </td>
                <td>
                  <div className="debt">
                    <OverlayTrigger
                      key="top"
                      placement="bottom"
                      trigger={["hover", "focus"]}
                      overlay={
                        <Tooltip id="ttip-debt" className="vaults-tooltip">
                          {numberFormatStr(v.debt, 4, 12)}
                        </Tooltip>
                      }
                    >
                      <span className="number">{numberFormatStr(v.debt, 4, 4)}</span>
                    </OverlayTrigger>
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
                        {v.ratio.toFixed(0)}
                        {v.ratio === 0 ? "" : "%"}
                      </span>
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Liquidate
        show={showLiquidate}
        currentAddress={currentAddress}
        vaultId={vaultId}
        vaultType={vaultType}
        onHide={() => {
          setVaultId("");
          setVaultType("");
          setVaultIndex(-1);
          setShowLiquidate(false);
        }}
        refresh={() => refresh(vaultIndex, vaultType)}
      />
    </>
  );
};
