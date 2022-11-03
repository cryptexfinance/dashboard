import React, { useContext, useState } from "react";
import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import { ethers } from "ethers";
import NumberFormat from "react-number-format";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Table from "react-bootstrap/esm/Table";
import Tooltip from "react-bootstrap/esm/Tooltip";
import { useQuery, gql } from "@apollo/client";
import { vaultsContext } from "../../../state";
import { ReactComponent as WETHIcon } from "../../../assets/images/graph/weth.svg";
import { ReactComponent as DAIIcon } from "../../../assets/images/graph/DAI.svg";

type props = {
  address: string;
  ethRewards: string;
  daiRewards: string;
  claimRewards: (vaultType: string) => {};
};

const Rewards = ({ address, ethRewards, daiRewards, claimRewards }: props) => {
  const vaults = useContext(vaultsContext);
  const [ethDebt, setEthDebt] = useState("0.0");
  const [daiDebt, setDaiDebt] = useState("0.0");

  const USER_VAULTS = gql`
    query getVault($owner: String!) {
      vaults(where: { owner: $owner }) {
        id
        vaultId
        owner
        collateral
        debt
        currentRatio
        address
        owner
      }
    }
  `;

  async function setDebt(vaultData: any) {
    // TODO: fix if no graph
    await vaultData.vaults.forEach((v: any) => {
      switch (v.address.toLowerCase()) {
        case vaults?.wethVault?.address.toLowerCase():
          setEthDebt(ethers.utils.formatEther(v.debt));
          break;
        case vaults?.wbtcVault?.address.toLowerCase():
          // setWbtcDebt(ethers.utils.formatEther(v.debt));
          break;
        case vaults?.daiVault?.address.toLowerCase():
          setDaiDebt(ethers.utils.formatEther(v.debt));
          break;
        default:
          break;
      }
    });
  }

  const { data, refetch } = useQuery(USER_VAULTS, {
    variables: { owner: address },
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      setDebt(data);
    },
  });

  const claimMintRewards = async (vaultType: string) => {
    await claimRewards(vaultType);
    refetch();
  };

  return (
    <Card className="diamond mt-4">
      <h2>Minting Rewards </h2>
      <Table hover className="mt-2">
        <thead>
          <tr>
            <th />
            <th>Description</th>
            <th>Current Mint</th>
            <th>
              <div className="rewards">
                <div className="title-current">Current Reward</div>
                <div className="button-current">
                  <OverlayTrigger
                    key="top"
                    placement="right"
                    trigger={["hover", "click"]}
                    overlay={
                      <Tooltip id="ttip-current-reward" className="farm-tooltip">
                        Early adopters rewards are issued over 14 days for a total of 500,000 CTX.
                        Assuming approximately 6500 Ethereum blocks per day over 14 days (91,000
                        Ethereum blocks), the per block reward would be 5.4945 CTX split across the
                        debtors at that point in time. 100% of the reward is immediately available.
                      </Tooltip>
                    }
                  >
                    <Button variant="dark">?</Button>
                  </OverlayTrigger>
                </div>
              </div>
            </th>{" "}
            <th>APY</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <WETHIcon className="weth" />
            </td>
            <td>
              <a href="vault/ETH">ETH Vault</a>
            </td>
            <td className="number">
              <NumberFormat
                className="number"
                value={ethDebt}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />{" "}
              TCAP
            </td>
            <td className="number">
              <NumberFormat
                className="number"
                value={ethRewards}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />{" "}
              CTX
            </td>
            <td>
              <b className="fire">Inactive</b>
            </td>
            <td align="right">
              {address === "" ? (
                <>
                  <Button variant="dark" className="" disabled>
                    Mint
                  </Button>
                  <Button variant="dark" className="ml-4" disabled>
                    Claim
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" className="" href="vault/ETH">
                    Mint
                  </Button>
                  <Button
                    variant="success"
                    className=" ml-4"
                    onClick={() => {
                      claimMintRewards("ETH");
                    }}
                  >
                    Claim
                  </Button>
                </>
              )}
            </td>
          </tr>
          <tr>
            <td>
              <DAIIcon className="dai" />
            </td>
            <td>
              <a href="vault/DAI">DAI Vault</a>
            </td>
            <td className="number">
              <NumberFormat
                className="number"
                value={daiDebt}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />{" "}
              TCAP
            </td>
            <td className="number">
              <NumberFormat
                className="number"
                value={daiRewards}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />{" "}
              CTX
            </td>
            <td>
              <b className="fire">Inactive</b>
            </td>
            <td align="right">
              {address === "" ? (
                <>
                  <Button variant="dark" className="" disabled>
                    Mint
                  </Button>
                  <Button variant="dark" className="ml-4" disabled>
                    Claim
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" className="" href="vault/DAI">
                    Mint
                  </Button>
                  <Button
                    variant="success"
                    className="ml-4"
                    onClick={() => {
                      claimMintRewards("DAI");
                    }}
                  >
                    Claim
                  </Button>
                </>
              )}
            </td>{" "}
          </tr>
        </tbody>
      </Table>
    </Card>
  );
};

export default Rewards;
