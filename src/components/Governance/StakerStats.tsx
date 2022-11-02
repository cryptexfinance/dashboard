import React, { useContext, useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { ethers } from "ethers";
import Table from "react-bootstrap/esm/Table";
import NumberFormat from "react-number-format";
import GovernanceContext from "../../state/GovernanceContext";
import SignerContext from "../../state/SignerContext";
import { errorNotification, notifyUser } from "../../utils/utils";

const sixMonthCtxRewardAmount = 12654;
const apyShowDate = new Date(1633654800 * 1000);
type props = {
  refresh: () => void;
  updateData: boolean;
  withdrawTimes: number[];
  updateTimes: boolean;
  t: any;
};

const StakerStats = ({ refresh, updateData, withdrawTimes, updateTimes, t }: props) => {
  const signer = useContext(SignerContext);
  const governance = useContext(GovernanceContext);
  const [totalStaked, setTotalStaked] = useState("0.0");
  const [stake, setStake] = useState("0.0");
  const [rewards, setRewards] = useState("0.0");
  const [waitTime, setWaitTime] = useState(604800);
  const [lastStakeDate, setLastStakeDate] = useState<Date | null>();
  const [periodEnds, setPeriodEnds] = useState(new Date());

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
        const currentPeriodEndsCall = await governance.delegatorFactoryRead?.periodFinish();

        // @ts-ignore
        const [totalSupply, currentStake, currentReward, currentWaitTime, currentPeriodEnds] =
          await signer.ethcallProvider?.all([
            totalSupplyCall,
            currentStakeCall,
            currentRewardCall,
            currentWaitTimeCall,
            currentPeriodEndsCall,
          ]);
        setTotalStaked(ethers.utils.formatEther(totalSupply));
        setStake(ethers.utils.formatEther(currentStake));
        setRewards(ethers.utils.formatEther(currentReward));
        currentWT = parseInt(currentWaitTime.toString());
        setWaitTime(currentWT);
        setPeriodEnds(new Date(currentPeriodEnds.toNumber() * 1000));
      }
    }
    load();
    // eslint-disable-next-line
  }, [signer, updateData,]);

  useEffect(() => {
    async function load() {
      if (withdrawTimes.length > 0) {
        const lastDate = new Date();
        lastDate.setTime(withdrawTimes[0] - waitTime * 1000);
        setLastStakeDate(lastDate);
      }
    }
    load();
  }, [withdrawTimes, updateTimes, waitTime]);

  const claimRewards = async () => {
    if (governance.delegatorFactory) {
      try {
        const tx = await governance.delegatorFactory.getReward();
        notifyUser(tx, refresh);
      } catch (error) {
        if (error.code === 4001) {
          errorNotification(t("errors.tran-rejected"));
        } else {
          errorNotification(t("errors.no-funds"));
        }
      }
    }
  };

  const apy = (): string => {
    const currentDate = new Date();
    if (parseFloat(totalStaked) > 0 && currentDate > apyShowDate) {
      const a = Math.round(((4 * sixMonthCtxRewardAmount) / parseFloat(totalStaked)) * 100);
      return a
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        .concat("%");
    }
    return "-";
  };

  return (
    <div className="mb-2 staker">
      <h2>{t("governance.stake-reward")}</h2>
      <Table hover className="mt-2">
        <thead>
          <tr>
            <th>{t("staked")}</th>
            <th>
              <>
                {t("last")} {t("staked")}
              </>
            </th>
            <th>{t("governance.staked-reward")}</th>
            <th>APR</th>
            <th className="end-date">End Date</th>
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
            <td className="end-date">{periodEnds.toLocaleDateString()}</td>
            <td align="right">
              <Button
                variant="success"
                className="ml-4"
                onClick={() => {
                  claimRewards();
                }}
              >
                {t("claim")}
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default StakerStats;
