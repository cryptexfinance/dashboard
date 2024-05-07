import React, { useContext, useState, useEffect } from "react";
import { Accordion, Button } from "react-bootstrap";
import { ethers } from "ethers";
import Table from "react-bootstrap/esm/Table";
import NumberFormat from "react-number-format";
import { useMediaQuery } from "react-responsive";
import { governanceContext, networkContext, signerContext } from "../../state";
import { errorNotification, isInLayer1, notifyUser } from "../../utils/utils";

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
  const isMobile = useMediaQuery({ query: "(max-width: 850px)" });
  const currentNetwork = useContext(networkContext);
  const signer = useContext(signerContext);
  const governance = useContext(governanceContext);
  const [totalStaked, setTotalStaked] = useState("0.0");
  const [stake, setStake] = useState("0.0");
  const [rewards, setRewards] = useState("0.0");
  const [waitTime, setWaitTime] = useState(604800);
  const [lastStakeDate, setLastStakeDate] = useState<Date | null>();
  const [periodEnds, setPeriodEnds] = useState(new Date());

  useEffect(() => {
    async function load() {
      let currentWT = waitTime;
      if (signer.signer && isInLayer1(currentNetwork.chainId) && governance.delegatorFactoryRead) {
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

  const StakedValue = () => (
    <>
      <NumberFormat
        className="number"
        value={stake}
        displayType="text"
        thousandSeparator
        suffix=" CTX"
        decimalScale={2}
      />
    </>
  );

  const LastStakeDate = () => (
    <>{lastStakeDate != null ? lastStakeDate?.toLocaleDateString() : "-"}</>
  );

  const StakeReward = () => (
    <NumberFormat
      className="number"
      value={rewards}
      displayType="text"
      thousandSeparator
      suffix=" CTX"
      decimalScale={4}
    />
  );

  const ClaimButton = () => (
    <Button
      variant="success"
      className="ml-4"
      onClick={() => {
        claimRewards();
      }}
      disabled={!signer.signer || !isInLayer1(currentNetwork.chainId)}
    >
      {t("claim")}
    </Button>
  );

  const RenderMobile = () => (
    <Accordion className="stake-reward-mobile" defaultActiveKey={isMobile ? "1" : "0"}>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <h2>{t("governance.stake-reward")}</h2>
        </Accordion.Header>
        <Accordion.Body>
          <div className="box">
            <div className="title">{t("staked")}</div>
            <div className="value">
              <StakedValue />
            </div>
          </div>
          <div className="box">
            <div className="title">
              {t("last")} {t("staked")}
            </div>
            <div className="value">
              <h6>
                <LastStakeDate />
              </h6>
            </div>
          </div>
          <div className="box">
            <div className="title">{t("governance.staked-reward")}</div>
            <div className="value">
              <StakeReward />
            </div>
          </div>
          <div className="box">
            <div className="title">APR</div>
            <div className="value">
              <b className="fire">{apy()}</b>
            </div>
          </div>
          <div className="box">
            <div className="title">End Date</div>
            <div className="value">
              <h6>{periodEnds.toLocaleDateString()}</h6>
            </div>
          </div>
          <ClaimButton />
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );

  return (
    <div className="mb-2 staker">
      {isMobile ? (
        <RenderMobile />
      ) : (
        <>
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
                  <StakedValue />
                </td>
                <td>
                  <LastStakeDate />
                </td>
                <td className="number">
                  <StakeReward />
                </td>
                <td>
                  <b className="fire">{apy()}</b>
                </td>
                <td className="end-date">{periodEnds.toLocaleDateString()}</td>
                <td align="right">
                  <ClaimButton />
                </td>
              </tr>
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default StakerStats;
