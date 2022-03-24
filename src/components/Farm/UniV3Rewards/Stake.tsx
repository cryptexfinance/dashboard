import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/esm/Button";
import { BigNumber, ethers } from "ethers";
import { UNIV3, encodeIncentive } from "../../../utils/univ3";
import { IncentiveType, PositionType, StakeStatus } from "./types";
import { notifyUser, errorNotification } from "../../../utils/utils";

type props = {
  ownerAddress: string;
  position: PositionType;
  incentive: IncentiveType;
  nfpmContract: ethers.Contract | undefined;
  stakerContract: ethers.Contract | undefined;
  refresh: () => void;
};

const Stake = ({
  ownerAddress,
  position,
  incentive,
  nfpmContract,
  stakerContract,
  refresh,
}: props) => {
  const [title, setTitle] = useState("Stake");
  const [btnDisabled, setBtnDisabled] = useState(true);

  useEffect(() => {
    const cDate = new Date();
    const currentTime = cDate.getTime() / 1000;
    console.log("--- Time ----");
    console.log(currentTime);
    let btnTitle = "Stake";
    let bDisabled = true;
    if (position.status === StakeStatus.not_approved) {
      btnTitle = "Approve";
      bDisabled = false;
    } else if (currentTime < incentive.startTime) {
      bDisabled = false;
      btnTitle = "Deposit";
    } else if (currentTime >= incentive.startTime && currentTime <= incentive.endTime) {
      // eslint-disable-next-line
      bDisabled = !(position.status === StakeStatus.empty || position.status === StakeStatus.deposited);
      // eslint-disable-next-line
    } else {
      bDisabled = false;
    }
    setTitle(btnTitle);
    setBtnDisabled(bDisabled);
    // eslint-disable-next-line
  }, []);

  const approve = async () => {
    try {
      const tx = await nfpmContract?.approve(UNIV3.stakerAddress, position.lpTokenId);
      notifyUser(tx, refresh);
    } catch (error) {
      console.log(error);
      errorNotification("Transaction rejected");
    }
  };

  const deposit = async () => {
    try {
      const tx = await nfpmContract?.safeTransferFrom(
        ownerAddress,
        UNIV3.stakerAddress,
        BigNumber.from(position.lpTokenId),
        encodeIncentive(incentive)
      );
      notifyUser(tx, refresh);
    } catch (error) {
      console.log(error);
      errorNotification("Transaction rejected");
    }
  };

  const stake = async () => {
    try {
      const tx = await stakerContract?.stakeToken(incentive, position.lpTokenId);
      notifyUser(tx, refresh);
    } catch (error) {
      console.log(error);
      errorNotification("Transaction rejected");
    }
  };

  const handleOnClick = () => {
    setBtnDisabled(true);
    if (position.status === StakeStatus.not_approved) {
      approve();
    } else if (position.status === StakeStatus.empty) {
      deposit();
    } else if (position.status === StakeStatus.deposited) {
      stake();
    }
    setBtnDisabled(false);
  };

  return (
    <Button variant="primary" onClick={() => handleOnClick()} disabled={btnDisabled}>
      {title}
    </Button>
  );
};

export default Stake;
