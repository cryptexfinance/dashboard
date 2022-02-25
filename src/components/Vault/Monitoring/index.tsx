import React, { useContext, useEffect, useState } from "react";
import ButtonGroup from "react-bootstrap/esm/ButtonGroup";
import Card from "react-bootstrap/esm/Card";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import Pagination from "react-bootstrap/Pagination";
import ToggleButton from "react-bootstrap/esm/ToggleButton";
import "../../../styles/vault-monitoring.scss";
import { useQuery, gql, NetworkStatus } from "@apollo/client";
import NetworkContext from "../../../state/NetworkContext";
import OraclesContext from "../../../state/OraclesContext";
import SignerContext from "../../../state/SignerContext";
import { ReactComponent as TcapIcon } from "../../../assets/images/tcap-coin.svg";
import { ReactComponent as DAIIcon } from "../../../assets/images/graph/DAI.svg";
import { Vaults } from "./vaults";
import { vaultsType } from "../data";
import { isInLayer1, isOptimism, isPolygon, validOracles } from "../../../utils/utils";

export const Monitoring = () => {
  const currentNetwork = useContext(NetworkContext);
  const oracles = useContext(OraclesContext);
  const signer = useContext(SignerContext);
  const [vaults, setVaults] = useState<Array<vaultsType>>([]);
  const [radioValue, setRadioValue] = useState("1");
  const radios = [
    { name: "All Vaults", value: "1" },
    { name: "My Vaults", value: "2" },
  ];
  const vaultsQuery = gql`
    query allVaults {
      vaults(first: 100) {
        id
        vaultId
        owner
        collateral
        debt
        currentRatio
        tokenSymbol
      }
    }
  `;

  const loadPrices = async () => {
    if (signer && oracles && validOracles(currentNetwork.chainId || 1, oracles)) {
      const tcapPriceCall = await oracles.tcapOracleRead?.getLatestAnswer();
      const daiOraclePriceCall = await oracles.daiOracleRead?.getLatestAnswer();

      const ethcalls = [tcapPriceCall, daiOraclePriceCall];
      if (isInLayer1(currentNetwork.chainId)) {
        const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
        const aaveOraclePriceCall = await oracles.aaveOracleRead?.getLatestAnswer();
        const linkOraclePriceCall = await oracles.linkOracleRead?.getLatestAnswer();
        ethcalls.push(wethOraclePriceCall);
        ethcalls.push(aaveOraclePriceCall);
        ethcalls.push(linkOraclePriceCall);
      }
      if (isOptimism(currentNetwork.chainId)) {
        const wethOraclePriceCall = await oracles.wethOracleRead?.getLatestAnswer();
        const linkOraclePriceCall = await oracles.linkOracleRead?.getLatestAnswer();
        const snxOraclePriceCall = await oracles.snxOracleRead?.getLatestAnswer();
        const uniOraclePriceCall = await oracles.uniOracleRead?.getLatestAnswer();
        ethcalls.push(wethOraclePriceCall);
        ethcalls.push(linkOraclePriceCall);
        ethcalls.push(snxOraclePriceCall);
        ethcalls.push(uniOraclePriceCall);
      }
      let tcapOraclePrice;
      let daiOraclePrice;
      let wethOraclePrice;
      let aaveOraclePrice;
      let linkOraclePrice;
      let snxOraclePrice;
      let uniOraclePrice;

      if (isInLayer1(currentNetwork.chainId)) {
        // @ts-ignore
        [
          tcapOraclePrice,
          daiOraclePrice,
          wethOraclePrice,
          aaveOraclePrice,
          linkOraclePrice,
        ] = await signer.ethcallProvider?.all(ethcalls);
      } else if (isOptimism(currentNetwork.chainId)) {
        // @ts-ignore
        [
          tcapOraclePrice,
          daiOraclePrice,
          wethOraclePrice,
          linkOraclePrice,
          snxOraclePrice,
          uniOraclePrice,
        ] = await signer.ethcallProvider?.all(ethcalls);
      }
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  /* const loadVaults = (vaultsData: any) => {
    vautltsData.map((v, index) => {

    });
  } */

  const { data, error, refetch, networkStatus } = useQuery(vaultsQuery, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    onError: () => {
      console.log(error);
    },
    onCompleted: () => {
      // loadVaults(data);
    },
  });

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
          <Vaults vaults={vaults} />
          <Col md={12} className="pag-container">
            <VaultPagination />
          </Col>
        </Card.Body>
      </Card>
    </div>
  );
};
