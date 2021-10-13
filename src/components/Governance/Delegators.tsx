import React, { useContext, useState, useEffect } from "react";
// import { Button } from "react-bootstrap";
import Row from "react-bootstrap/esm/Row";
import { useQuery, gql } from "@apollo/client";
import ProfileCard from "./ProfileCard";
import NewDelegator from "./NewDelegator";
import Delegate from "./Delegate";
import Withdraw from "./Withdraw";
import StakerStats from "./StakerStats";
import { delegatorsInfo } from "./data";
import SignerContext from "../../state/SignerContext";
import GovernanceContext from "../../state/GovernanceContext";

type props = {
  currentSignerAddress: string;
};
type delegatorType = {
  id: string;
  delegatee: string;
  delegatedVotes: string;
  delegatedVotesRaw: string;
  tokenOwners: { stake: string; stakeRaw: string }[];
  totalHoldersRepresented: Number;
};

const Delegators = ({ currentSignerAddress }: props) => {
  const [delegators, setDelegators] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelegate, setShowDelegate] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [currentDelegatorAddress, setCurrentDelegatorAddress] = useState("");
  const [currentOwnerStake, setCurrentOwnerStake] = useState("0");
  const [currentWithdrawTime, setCurrentWithdrawTime] = useState(0);
  const [withdrawTimes, setWithdrawTimes] = useState<number[]>([]);
  const [updateData, setUpdateData] = useState(false);
  const [updateTimes, setUpdateTimes] = useState(false);
  const signer = useContext(SignerContext);
  const governance = useContext(GovernanceContext);

  const DELEGATORS = gql`
    query DELEGATORS($currentSignerAddress: String!) {
      delegators(orderBy: delegatedVotesRaw, orderDirection: desc) {
        id
        delegatee
        delegatedVotes
        delegatedVotesRaw
        totalHoldersRepresented
        tokenOwners(where: { tokenOwner: $currentSignerAddress }) {
          stake
          stakeRaw
        }
      }
    }
  `;
  const { data, refetch } = useQuery(DELEGATORS, {
    variables: { currentSignerAddress },
  });

  useEffect(() => {
    const loadDelegators = async () => {
      if (governance.delegatorFactoryRead) {
        if (data) {
          const currentDelegators: any[] = [];
          await data.delegators.forEach((d: any) => {
            currentDelegators.push(d);
          });
          setDelegators(currentDelegators);
        }
      }
    };
    loadDelegators();
    // eslint-disable-next-line
  }, [updateData, data, currentSignerAddress]);

  const refresh = async () => {
    try {
      await refetch();
      setUpdateData(!updateData);
    } catch (error) {
      console.log("Error refetching data");
    }
  };

  const openDelegate = (cDelegator: string) => {
    setCurrentDelegatorAddress(cDelegator);
    setShowDelegate(true);
  };

  const openWithdraw = (cDelegator: string, ownerStake: string, withdrawTime: number) => {
    setCurrentDelegatorAddress(cDelegator);
    setCurrentOwnerStake(ownerStake);
    setCurrentWithdrawTime(withdrawTime);
    setShowWithdraw(true);
  };

  /* const getDelegatorInfo = (address: string): infoType | null => {
    const index = delegatorsInfo.findIndex(
      (item) => item.address.toLowerCase() === address.toLowerCase()
    );
    if (index !== -1) {
      return delegatorsInfo[index];
    }
    return null;
  }; */

  const getDelegatorData = (address: string): delegatorType | null => {
    const index = delegators.findIndex(
      (item) => item.delegatee.toLowerCase() === address.toLowerCase()
    );
    if (index !== -1) {
      return delegators[index];
    }
    return null;
  };

  const addWithdrawTime = (wTime: number) => {
    const wtimes = withdrawTimes;
    wtimes.push(wTime);
    wtimes.sort((a, b) => b - a);
    setWithdrawTimes(wtimes);
    setUpdateTimes(!updateTimes);
  };

  const addTodayWithdrawTime = () => {
    const stakeDate = new Date();
    stakeDate.setDate(stakeDate.getDate() - 7);
    addWithdrawTime(stakeDate.getTime());
  };

  return (
    <div className={signer.signer ? "delegation" : "delegation off"}>
      {signer.signer && (
        <>
          {/* 
          <div className="create">
            <Button variant="pink" className="mt-3 mb-4 w-100" onClick={() => setShowCreate(true)}>
              Create Delegator
            </Button>
          </div>
          */}
          <Row className="staker-wrapper">
            <StakerStats
              refresh={refresh}
              updateData={updateData}
              withdrawTimes={withdrawTimes}
              updateTimes={updateTimes}
            />
          </Row>
        </>
      )}
      <div className="grid profiles">
        {delegatorsInfo.map((dInfo) => {
          const delegator = getDelegatorData(dInfo.address);
          if (delegator) {
            return (
              <ProfileCard
                key={delegator.id}
                delegator={delegator}
                info={dInfo}
                openDelegate={openDelegate}
                openWithdraw={openWithdraw}
                addWithdrawTime={addWithdrawTime}
                action={
                  delegator.delegatee.toLowerCase() === currentSignerAddress.toLowerCase()
                    ? "edit"
                    : "delegate"
                }
              />
            );
          }
          return <></>;
        })}
      </div>
      <NewDelegator
        show={showCreate}
        currentAddress={currentSignerAddress}
        delegatorFactory={governance.delegatorFactory}
        onHide={() => setShowCreate(false)}
        refresh={() => refresh()}
      />
      <Delegate
        show={showDelegate}
        delegatorAddress={currentDelegatorAddress}
        delegatorFactory={governance.delegatorFactory}
        addTodayWithdrawTime={() => addTodayWithdrawTime()}
        onHide={() => {
          setCurrentDelegatorAddress("");
          setShowDelegate(false);
        }}
        refresh={() => refresh()}
      />
      <Withdraw
        show={showWithdraw}
        delegatorAddress={currentDelegatorAddress}
        delegatorFactory={governance.delegatorFactory}
        stakedAmount={currentOwnerStake}
        currentWithdrawTime={currentWithdrawTime}
        onHide={() => {
          setCurrentDelegatorAddress("");
          setShowWithdraw(false);
        }}
        refresh={() => refresh()}
      />
    </div>
  );
};

export default Delegators;
