import React, { useState } from "react";
import ButtonGroup from "react-bootstrap/esm/ButtonGroup";
import Card from "react-bootstrap/esm/Card";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import Pagination from "react-bootstrap/Pagination";
import Table from "react-bootstrap/Table";
import ToggleButton from "react-bootstrap/esm/ToggleButton";
import "../../styles/vault-monitoring.scss";
import { ReactComponent as TcapIcon } from "../../assets/images/tcap-coin.svg";
import { ReactComponent as WETHIcon } from "../../assets/images/graph/weth.svg";
import { ReactComponent as DAIIcon } from "../../assets/images/graph/DAI.svg";
import { ReactComponent as AAVEIcon } from "../../assets/images/graph/aave.svg";
import { ReactComponent as LINKIcon } from "../../assets/images/graph/chainlink.svg";
import { vaults } from "./data";

type iconProps = {
  name: string;
};

export const Monitoring = () => {
  const [radioValue, setRadioValue] = useState("1");
  const radios = [
    { name: "All Vaults", value: "1" },
    { name: "My Vaults", value: "2" },
  ];

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

  const VaultPagination = () => {
    console.log("AA");
    return (
      <Pagination>
        <Pagination.First />
        <Pagination.Prev />
        <Pagination.Item>{1}</Pagination.Item>
        <Pagination.Ellipsis />

        <Pagination.Item>{10}</Pagination.Item>
        <Pagination.Item>{11}</Pagination.Item>
        <Pagination.Item active>{12}</Pagination.Item>
        <Pagination.Item>{13}</Pagination.Item>
        <Pagination.Item disabled>{14}</Pagination.Item>

        <Pagination.Ellipsis />
        <Pagination.Item>{20}</Pagination.Item>
        <Pagination.Next />
        <Pagination.Last />
      </Pagination>
    );
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="vault-monitoring">
      <Card className="diamond mb-2 totals">
        <Card.Header>
          <h5>Totals</h5>
        </Card.Header>
        <Card.Body>
          <Col md={12} className="container">
            <Col md={3} className="total-box">
              <h6>Vaults</h6>
              <span className="number">1,200</span>
            </Col>
            <Col md={3} className="total-box">
              <h6>Collateral (USD)</h6>
              <span className="number">$2,580,200.55</span>
            </Col>
            <Col md={3} className="total-box">
              <div className="debt">
                <h6>Debt</h6>
                <TcapIcon className="tcap-icon" />
              </div>
              <span className="number">5,210.55</span>
            </Col>
            <Col md={3} className="total-box">
              <h6>Debt (USD)</h6>
              <span className="number">$988,180.81</span>
            </Col>
          </Col>
        </Card.Body>
      </Card>
      <Card className="diamond mb-2">
        <Card.Body>
          <Col md={12} className="filters">
            <div className="dd-container">
              <h6 className="titles">Collateral:</h6>
              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-filters" className="text-left">
                  <div className="collateral-toggle">
                    <DAIIcon className="dai" /> <span>DAI</span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item key="1">ETH</Dropdown.Item>
                  <Dropdown.Item key="2">WETH</Dropdown.Item>
                  <Dropdown.Item key="3">DAI</Dropdown.Item>
                  <Dropdown.Item key="4">AAVE</Dropdown.Item>
                  <Dropdown.Item key="5">LINK</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="dd-container">
              <h6 className="titles">Status:</h6>
              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-flags" className="text-left">
                  <div className="status-toggle">
                    <span>All</span>
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item key="1">Empty</Dropdown.Item>
                  <Dropdown.Item key="2">Ready</Dropdown.Item>
                  <Dropdown.Item key="3">Active</Dropdown.Item>
                  <Dropdown.Item key="4">Liquidation</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="dd-container">
              <ButtonGroup className="mb-2">
                {radios.map((radio, idx) => (
                  <ToggleButton
                    key={idx}
                    id={`radio-${idx}`}
                    type="radio"
                    variant="secondary"
                    name="radio"
                    value={radio.value}
                    checked={radioValue === radio.value}
                    onChange={(e) => setRadioValue(e.currentTarget.value)}
                  >
                    {radio.name}
                  </ToggleButton>
                ))}
              </ButtonGroup>
            </div>
          </Col>
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
          <Col md={12} className="pag-container">
            <VaultPagination />
          </Col>
        </Card.Body>
      </Card>
    </div>
  );
};
