import React from "react";
import Table from "react-bootstrap/Table";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import { ReactComponent as WETHIcon } from "../../../assets/images/graph/weth.svg";
import { ReactComponent as DAIIcon } from "../../../assets/images/graph/DAI.svg";
import { ReactComponent as AAVEIcon } from "../../../assets/images/graph/aave.svg";
import { ReactComponent as LINKIcon } from "../../../assets/images/graph/chainlink.svg";
import { vaultsType } from "../data";

type dataType = {
  vaults: Array<vaultsType>;
};
type iconProps = {
  name: string;
};

export const Vaults = ({ vaults }: dataType) => {
  const CollateralIcon = ({ name }: iconProps) => {
    console.log("AA");
    switch (name) {
      case "eth":
        return <WETHIcon className="eth" />;
      case "dai":
        return <DAIIcon className="dai" />;
      case "aave":
        return <AAVEIcon className="aave" />;
      default:
        return <LINKIcon className="link" />;
    }
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
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
          console.log("enter");
          return (
            <tr key={index}>
              <td>
                <div className="status">
                  <span className={v.status}>{capitalize(v.status)}</span>
                </div>
              </td>
              <td>
                <div className="collateral">
                  <span className="number">{v.collateral_value}</span>
                  <CollateralIcon name={v.collateral} />
                </div>
              </td>
              <td>
                <div className="collateral-usd">
                  <span className="number">${v.collateral_usd}</span>
                </div>
              </td>
              <td>
                <div className="debt">
                  <span className="number">{v.debt}</span>
                </div>
              </td>
              <td>
                <div className="debt">
                  <span className="number">${v.debt_usd}</span>
                </div>
              </td>
              <td>
                <div className="ratio">
                  <span className={v.status}>
                    {v.ratio}
                    {v.ratio === "N/A" ? "" : "%"}
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};
