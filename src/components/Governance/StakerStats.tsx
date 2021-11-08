import React, { useContext, useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { ethers } from "ethers";
import Table from "react-bootstrap/esm/Table";
import NumberFormat from "react-number-format";
import GovernanceContext from "../../state/GovernanceContext";
import SignerContext from "../../state/SignerContext";
import { errorNotification, notifyUser } from "../../utils/utils";

const sixMonthCtxRewardAmount = 60000;
const apyShowDate = new Date(1633654800 * 1000);
type props = {
  refresh: () => void;
  updateData: boolean;
  withdrawTimes: number[];
  updateTimes: boolean;
};

const StakerStats = ({ refresh, updateData, withdrawTimes, updateTimes }: props) => {
  const signer = useContext(SignerContext);
  const governance = useContext(GovernanceContext);
  const [totalStaked, setTotalStaked] = useState("0.0");
  const [stake, setStake] = useState("0.0");
  const [rewards, setRewards] = useState("0.0");
  const [waitTime, setWaitTime] = useState(604800);
  const [lastStakeDate, setLastStakeDate] = useState<Date | null>();

  useEffect(() => {
    async function load() {
      let currentWT = waitTime;
      if (signer.signer && governance.delegatorFactoryRead) {
        const currentSignerAddress = await signer.signer.getAddress();
        const totalSupplyCall = await governance.delegatorFactoryRead?.totalSupply();
        const currentStakeCall = await governance.delegatorFactoryRead?.balanceOf(
          currentSignerAddress
        );
        const currentRewardCall = await governance.delegatorFactoryRead?.earned(
          currentSignerAddress
        );
        const currentWaitTimeCall = await governance.delegatorFactoryRead?.waitTime();
        // @ts-ignore
        const [
          totalSupply,
          currentStake,
          currentReward,
          currentWaitTime,
        ] = await signer.ethcallProvider?.all([
          totalSupplyCall,
          currentStakeCall,
          currentRewardCall,
          currentWaitTimeCall,
        ]);
        setTotalStaked(ethers.utils.formatEther(totalSupply));
        setStake(ethers.utils.formatEther(currentStake));
        setRewards(ethers.utils.formatEther(currentReward));
        currentWT = parseInt(currentWaitTime.toString());
      }
      if (withdrawTimes.length > 0) {
        const lastDate = new Date();
        lastDate.setTime(withdrawTimes[0] - currentWT * 1000);
        setLastStakeDate(lastDate);
      }
    }
    load();
    // eslint-disable-next-line
  }, [signer, updateData, withdrawTimes, updateTimes]);

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

  const apy = (): string => {
    const currentDate = new Date();
    if (parseFloat(totalStaked) > 0 && currentDate > apyShowDate) {
      const a = Math.round(((2 * sixMonthCtxRewardAmount) / parseFloat(totalStaked)) * 100);
      return a
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        .concat("%");
    }
    return "-";
  };

  return (
    <div className="mb-2 staker">
      <h2>Stake Reward </h2>
      <Table hover className="mt-2">
        <thead>
          <tr>
            <th>Staked</th>
            <th>Last Staked</th>
            <th>Staked Reward</th>
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
            <td>{lastStakeDate != null ? lastStakeDate?.toLocaleDateString() : "-"}</td>
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
            <td>
              <b className="fire">{apy()}</b>
            </td>
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
