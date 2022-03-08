import React, { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Table from "react-bootstrap/Table";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import Liquidate from "./Liquidate";
import { PaginationType, VaultsType } from "./types";
import { capitalize, CollateralIcon, numberFormatStr } from "./common";

type dataType = {
  currentAddress: string;
  vaults: Array<VaultsType>;
  pagination: PaginationType;
  refresh: () => void;
};

export const Vaults = ({ currentAddress, vaults, pagination, refresh }: dataType) => {
  const [showLiquidate, setShowLiquidate] = useState(false);
  const [vaultId, setVaultId] = useState("");
  const [vaultType, setVaultType] = useState("");

  const liquidateVault = (id: string, type: string) => {
    setVaultId(id);
    setVaultType(type);
    setShowLiquidate(true);
  };

  return (
    <>
      <Table hover className="mt-2 vaults">
        <thead>
          <tr>
            <th className="status">Status</th>
            <th className="collateral">Collateral</th>
            <th className="collateral-usd">Collateral (USD)</th>
            <th>
              <div className="debt">
                <TcapIcon className="tcap" /> <span>Debt</span>
              </div>
            </th>
            <th className="debt-usd">Debt (USD)</th>
            <th className="ratio">Ratio</th>
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
                      <Button onClick={() => liquidateVault(v.id, v.collateralSymbol)}>
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
          setShowLiquidate(false);
        }}
        refresh={() => refresh()}
      />
    </>
  );
};
