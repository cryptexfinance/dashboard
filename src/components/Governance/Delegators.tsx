import React, { useContext, useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import Row from "react-bootstrap/esm/Row";
import { useQuery, gql } from "@apollo/client";
import { useTranslation } from "react-i18next";
import ProfileCard from "./ProfileCard";
import KeeperForm from "./KeeperForm";
import Delegate from "./Delegate";
import Withdraw from "./Withdraw";
import StakerStats from "./StakerStats";
import SignerContext from "../../state/SignerContext";
import GovernanceContext from "../../state/GovernanceContext";
import { API_ENDPOINT, FEATURES } from "../../utils/constants";
import { delegatorsInfo } from "./data";

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
  const { t } = useTranslation();
  const [keepers, setKeepers] = useState<any[]>([]);
  const [keepersInfo, setKeepersInfo] = useState<any[]>([]);
  const [keeperIndex, setKeeperIndex] = useState(-1);
  const [showKeeperForm, setShowKeeperForm] = useState(false);
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
    const loadKeepers = async () => {
      if (governance.delegatorFactoryRead) {
        if (data) {
          const currentDelegators: any[] = [];
          await data.delegators.forEach((d: any) => {
            currentDelegators.push(d);
          });
          setKeepers(currentDelegators);
        }
      }
    };
    const loadKeepersFromDB = async () => {
      await fetch(`${API_ENDPOINT}/cryptkeeper/all`, {
        method: "GET",
      })
        .then((response) => response.json())
        .then((responseJson) => {
          setKeepersInfo(responseJson);
        })
        .catch((error) => {
          console.error(error);
          setKeepersInfo([]);
        });
    };
    loadKeepers();

    if (FEATURES.KEEPERS_API) {
      loadKeepersFromDB();
    } else {
      setKeepersInfo(delegatorsInfo);
    }
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

  const showCreateKeeper = () => {
    setKeeperIndex(-1);
    setShowKeeperForm(true);
  };

  const showUpdateKeeper = (index: number) => {
    setKeeperIndex(index);
    setShowKeeperForm(true);
  };

  const hideKeeperForm = () => {
    setShowKeeperForm(false);
  };

  const getDelegatorData = (address: string): delegatorType | null => {
    const index = keepers.findIndex(
      (item) => item.delegatee.toLowerCase() === address.toLowerCase()
    );
    if (index !== -1) {
      return keepers[index];
    }
    return null;
  };

  /* const getKeepersData = (address: string): infoType | null => {
    const index = keepersInfo.findIndex(
      (item) => item.address.toLowerCase() === address.toLowerCase()
    );
    if (index !== -1) {
      return keepersInfo[index];
    }
    return null;
  }; */

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
          {FEATURES.KEEPERS_API && (
            <div className="create">
              <Button variant="pink" className="mt-3 mb-4 w-100" onClick={() => showCreateKeeper()}>
                {t("governance.new")}
              </Button>
            </div>
          )}
          <Row className="staker-wrapper">
            <StakerStats
              refresh={refresh}
              updateData={updateData}
              withdrawTimes={withdrawTimes}
              updateTimes={updateTimes}
              t={t}
            />
          </Row>
        </>
      )}
      <div className="grid profiles">
        {keepersInfo.map((keeperInfo, index) => {
          const keeper = getDelegatorData(keeperInfo.address);
          if (keeper) {
            return (
              <ProfileCard
                key={keeperInfo.id}
                delegator={keeper}
                info={keeperInfo}
                showUpdateKeeper={() => showUpdateKeeper(index)}
                openDelegate={openDelegate}
                openWithdraw={openWithdraw}
                addWithdrawTime={addWithdrawTime}
                isSigner={keeper.delegatee.toLowerCase() !== currentSignerAddress.toLowerCase()}
                t={t}
              />
            );
          }
          return <></>;
        })}
      </div>
      <KeeperForm
        isNew={keeperIndex === -1}
        show={showKeeperForm}
        currentAddress={currentSignerAddress}
        delegatorFactory={governance.delegatorFactory}
        keepers={keepers}
        keeperInfo={keeperIndex !== -1 ? keepersInfo[keeperIndex] : null}
        onHide={() => hideKeeperForm()}
        refresh={() => refresh()}
        t={t}
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
        t={t}
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
        t={t}
      />
    </div>
  );
};

export default Delegators;
