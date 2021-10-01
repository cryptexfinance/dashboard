import React, { useContext, useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { ethers } from "ethers";
import Table from "react-bootstrap/esm/Table";
import NumberFormat from "react-number-format";
import GovernanceContext from "../../state/GovernanceContext";
import SignerContext from "../../state/SignerContext";
import { errorNotification, notifyUser } from "../../utils/utils";

type props = {
  currentSignerAddress: string;
  refresh: () => void;
};

const StakerStats = ({ currentSignerAddress, refresh }: props) => {
  const signer = useContext(SignerContext);
  const governance = useContext(GovernanceContext);
  const [stake, setStake] = useState("0.0");
  const [rewards, setRewards] = useState("0.0");

  useEffect(() => {
    async function load() {
      if (governance.delegatorFactoryRead) {
        const currentStakeCall = await governance.delegatorFactoryRead?.balanceOf(
          currentSignerAddress
        );
        const currentRewardCall = await governance.delegatorFactoryRead?.earned(
          currentSignerAddress
        );
        // @ts-ignore
        const [currentStake, currentReward] = await signer.ethcallProvider?.all([
          currentStakeCall,
          currentRewardCall,
        ]);
        setStake(ethers.utils.formatEther(currentStake));
        setRewards(ethers.utils.formatEther(currentReward));
      }
    }
    load();
    // eslint-disable-next-line
  }, [currentSignerAddress]);

  const claimRewards = async () => {
    if (governance.delegatorFactory) {
      try {
        const tx = await governance.delegatorFactory.getReward();
        notifyUser(tx, refresh);
      } catch (error) {
        if (error.code === 4001) {
          errorNotification("Transaction rejected");
        } else {
          errorNotification("Insufficient funds to stake");
        }
      }
    }
  };

  return (
    <div className="mb-2 staker">
      <h2>Stake Reward </h2>
      <Table hover className="mt-2">
        <thead>
          <tr>
            <th>Stake</th>
            <th>Rewards</th>
            <th>APY</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="number">
              <NumberFormat
                className="number"
                value={stake}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />{" "}
              CTX
            </td>
            <td className="number">
              <NumberFormat
                className="number"
                value={rewards}
                displayType="text"
                thousandSeparator
                prefix=""
                decimalScale={2}
              />{" "}
              CTX
            </td>
            <td>-</td>
            <td align="right">
              <Button
                variant="success"
                className="ml-4"
                onClick={() => {
                  claimRewards();
                }}
              >
                Claim
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default StakerStats;
