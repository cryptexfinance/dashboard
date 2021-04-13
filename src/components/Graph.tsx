import React, { useContext, useEffect, useState } from "react";
import "../styles/graph.scss";
import Card from "react-bootstrap/esm/Card";
import { BigNumber, ethers } from "ethers";
import NumberFormat from "react-number-format";
import { useQuery, gql } from "@apollo/client";
import TokensContext from "../state/TokensContext";
import OraclesContext from "../state/OraclesContext";
import { ReactComponent as StakeIcon } from "../assets/images/graph/stake.svg";
import { ReactComponent as H24Icon } from "../assets/images/graph/24h.svg";
import { ReactComponent as TcapIcon } from "../assets/images/tcap-coin.svg";
import { ReactComponent as WETHIcon } from "../assets/images/graph/weth.svg";
// import { ReactComponent as WBTCIcon } from "../assets/images/graph/WBTC.svg";
import { ReactComponent as DAIIcon } from "../assets/images/graph/DAI.svg";
import cryptexJson from "../contracts/cryptex.json";
import { toUSD } from "../utils/utils";
import Loading from "./Loading";

const Graph = () => {
  const tokens = useContext(TokensContext);
  const oracles = useContext(OraclesContext);

  const [tcapPrice, setTcapPrice] = useState("0.0");
  const [ETHStake, setETHStake] = useState("0");
  const [DAIStake, setDAIStake] = useState("0");
  // const [WBTCStake, setWBTCStake] = useState("0");
  const [TotalStake, setTotalStake] = useState("0");
  const [totalSupply, setTotalSupply] = useState("0.0");
  const [loading, setLoading] = useState(true);

  const VAULTS_STATE = gql`
    {
      states {
        amountStaked
        id
      }
    }
  `;

  const { data } = useQuery(VAULTS_STATE, {
    notifyOnNetworkStatusChange: true,
    pollInterval: 5000,
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    const load = async () => {
      if (oracles && tokens && data) {
        const currentTotalPrice = await oracles.tcapOracle?.getLatestAnswer();
        const TotalTcapPrice = currentTotalPrice.mul(10000000000);
        setTcapPrice(ethers.utils.formatEther(TotalTcapPrice.div(10000000000)));
        let currentDAIStake = BigNumber.from(0);
        let currentWETHStake = BigNumber.from(0);

        await data.states.forEach((s: any) => {
          const networkId = parseInt(process.env.REACT_APP_NETWORK_ID || "4");
          let contracts;

          switch (networkId) {
            case 1:
              contracts = cryptexJson[1].mainnet.contracts;
              break;
            case 4:
              contracts = cryptexJson[4].rinkeby.contracts;
              break;
            default:
              contracts = cryptexJson[4].rinkeby.contracts;
              break;
          }
          switch (s.id.toLowerCase()) {
            case contracts.DAIVaultHandler.address.toLowerCase():
              currentDAIStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
              break;
            case contracts.WETHVaultHandler.address.toLowerCase():
              currentWETHStake = s.amountStaked ? s.amountStaked : BigNumber.from(0);
              break;
            default:
              break;
          }
        });

        const formatDAI = ethers.utils.formatEther(currentDAIStake);
        setDAIStake(formatDAI);

        const formatETH = ethers.utils.formatEther(currentWETHStake);
        setETHStake(formatETH);
        const ethUSD = ethers.utils.formatEther(
          (await oracles.wethOracle?.getLatestAnswer()).mul(10000000000)
        );
        const daiUSD = ethers.utils.formatEther(
          (await oracles.daiOracle?.getLatestAnswer()).mul(10000000000)
        );
        const totalUSD = toUSD(ethUSD, formatETH) + toUSD(daiUSD, formatDAI);
        setTotalStake(totalUSD.toString());

        const currentTotalSupply = await tokens.tcapToken?.totalSupply();
        setTotalSupply(ethers.utils.formatEther(currentTotalSupply));
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, [data]);

  if (loading) {
    return <Loading title="Loading" message="Please wait" />;
  }

  return (
    <div className="graph">
      <div className="grid">
        <Card>
          <StakeIcon className="stake" />
          <h4>Total Staked in USD</h4>
          <h5 className="number neon-green">
            <NumberFormat
              value={TotalStake}
              displayType="text"
              thousandSeparator
              decimalScale={2}
              prefix="$"
            />
          </h5>
        </Card>
        <Card>
          <H24Icon className="h24" />
          <h4>Total Supply</h4>
          <h5 className="number neon-blue">
            <NumberFormat
              value={totalSupply}
              displayType="text"
              thousandSeparator
              decimalScale={2}
            />{" "}
            TCAP
          </h5>
        </Card>
        <Card>
          <TcapIcon className="tcap" />
          <h4>TCAP Price</h4>
          <h5 className="number neon-highlight">
            <NumberFormat
              value={tcapPrice}
              displayType="text"
              thousandSeparator
              decimalScale={2}
              prefix="$"
            />
          </h5>
        </Card>
        <Card>
          <WETHIcon className="weth" />
          <h4>Total Staked in ETH</h4>
          <h5 className="number neon-highlight">
            <NumberFormat value={ETHStake} displayType="text" thousandSeparator decimalScale={2} />{" "}
            ETH
          </h5>
        </Card>
        {/* <Card>
          <WBTCIcon className="wbtc" />
          <h4>Total Staked in WBTC</h4>
          <h5 className="number neon-yellow">
            <NumberFormat value={WBTCStake} displayType="text" thousandSeparator decimalScale={2} />{" "}
            WBTC
          </h5>
        </Card> */}
        <Card>
          <DAIIcon className="dai" />
          <h4>Total Staked in DAI</h4>
          <h5 className="number neon-orange">
            <NumberFormat value={DAIStake} displayType="text" thousandSeparator decimalScale={2} />{" "}
            DAI
          </h5>
        </Card>
      </div>
    </div>
  );
};

export default Graph;
