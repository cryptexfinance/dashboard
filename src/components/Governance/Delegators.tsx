import React, { useContext, useState, useEffect } from "react";
import { Button, Dropdown } from "react-bootstrap";
import Row from "react-bootstrap/esm/Row";
import { useQuery, gql } from "@apollo/client";
import { useTranslation } from "react-i18next";
import ProfileCard from "./ProfileCard";
import KeeperForm from "./KeeperForm";
import Delegate from "./Delegate";
import Withdraw from "./Withdraw";
import StakerStats from "./StakerStats";
import { governanceContext, networkContext, signerContext } from "../../state";
import { KEEPER_ALL_ENDPOINT } from "../../api";
import { isInLayer1 } from "../../utils/utils";

type props = {
  currentSignerAddress: string;
};
type keeperType = {
  id: string;
  delegatee: string;
  delegatedVotes: string;
  delegatedVotesRaw: string;
  tokenOwners: { stake: string; stakeRaw: string }[];
  totalHoldersRepresented: number;
};

type keepeInfoType = {
  id: number;
  address: string;
  name: string;
  eth_name: string;
  image: string;
  expertise: string[];
  why: string;
  discord: string;
  twitter: string;
  delegatedVotes: number;
  totalHoldersRepresented: number;
};

const Delegators = ({ currentSignerAddress }: props) => {
  const { t } = useTranslation();
  const sortOptions = [
    { key: "0", name: "Votes Descending" },
    { key: "1", name: "Votes Ascending" },
    { key: "2", name: "Delegates Descending" },
    { key: "3", name: "Delegates Ascending" },
  ];
  const [currentSorting, setCurrentSorting] = useState(sortOptions[0]);
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
  const currentNetwork = useContext(networkContext);
  const signer = useContext(signerContext);
  const governance = useContext(governanceContext);

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

  const getDelegatorData = (address: string, currentKeepers: any): keeperType | null => {
    const index = currentKeepers.findIndex(
      // @ts-ignore
      (item) => item.delegatee.toLowerCase() === address.toLowerCase()
    );
    if (index !== -1) {
      return currentKeepers[index];
    }
    return null;
  };

  const sortVotesDesc = (a: keepeInfoType, b: keepeInfoType) => b.delegatedVotes - a.delegatedVotes;

  const sortVotesAsc = (a: keepeInfoType, b: keepeInfoType) => a.delegatedVotes - b.delegatedVotes;

  const sortRepresentedDesc = (a: keepeInfoType, b: keepeInfoType) =>
    b.totalHoldersRepresented - a.totalHoldersRepresented;

  const sortRepresentedAsc = (a: keepeInfoType, b: keepeInfoType) =>
    a.totalHoldersRepresented - b.totalHoldersRepresented;

  const buildKeeperInfo = (dbInfo: any, currentDelegators: any) => {
    const kInfo = new Array<keepeInfoType>();
    for (let i = 0; i < dbInfo.length; i += 1) {
      const kData = getDelegatorData(dbInfo[i].address, currentDelegators);
      if (kData !== null) {
        const info = {
          id: dbInfo[i].id,
          address: dbInfo[i].address,
          name: dbInfo[i].name,
          eth_name: dbInfo[i].eth_name,
          image: dbInfo[i].image,
          expertise: dbInfo[i].expertise,
          why: dbInfo[i].why,
          discord: dbInfo[i].discord,
          twitter: dbInfo[i].twitter,
          delegatedVotes: parseInt(kData.delegatedVotes),
          totalHoldersRepresented: kData.totalHoldersRepresented,
        };
        kInfo.push(info);
      }
    }
    setKeepersInfo(kInfo.sort(sortVotesDesc));
  };

  useEffect(() => {
    const loadData = async () => {
      const loadKeepersFromDB = async (currentDelegators: any) => {
        await fetch(KEEPER_ALL_ENDPOINT, {
          method: "GET",
        })
          .then((response) => response.json())
          .then((responseJson) => {
            buildKeeperInfo(responseJson, currentDelegators);
          })
          .catch((error) => {
            console.error(error);
            setKeepersInfo([]);
          });
      };
      const loadKeepers = async () => {
        if (governance.delegatorFactoryRead) {
          if (data) {
            const currentDelegators: any[] = [];
            await data.delegators.forEach((d: any) => {
              currentDelegators.push(d);
            });
            setKeepers(currentDelegators);
            loadKeepersFromDB(currentDelegators);
          }
        }
      };
      await loadKeepers();
    };
    if (isInLayer1(currentNetwork.chainId)) {
      loadData();
    }
    /* if (FEATURES.KEEPERS_API) {
      loadKeepersFromDB();
    } else {
      setKeepersInfo(delegatorsInfo);
    } */
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

  const handleSortingChange = (option: string) => {
    const sortO = parseInt(option);
    const kInfo = keepersInfo;
    if (sortO === 0) {
      kInfo.sort(sortVotesDesc);
    } else if (sortO === 1) {
      kInfo.sort(sortVotesAsc);
    } else if (sortO === 2) {
      kInfo.sort(sortRepresentedDesc);
    } else {
      kInfo.sort(sortRepresentedAsc);
    }

    setKeepersInfo(kInfo);
    setCurrentSorting(sortOptions[parseInt(option)]);
  };

  return (
    <div className={signer.signer ? "delegation" : "delegation off"}>
      <Row className="staker-wrapper">
        <StakerStats
          refresh={refresh}
          updateData={updateData}
          withdrawTimes={withdrawTimes}
          updateTimes={updateTimes}
          t={t}
        />
      </Row>
      <div className="keepers-options">
        <div className="search-box">
          <div className="sort-box">
            <h6 className="titles">Sort by:</h6>
            <Dropdown onSelect={(eventKey) => handleSortingChange(eventKey || "0")}>
              <Dropdown.Toggle
                variant="secondary"
                id="dropdown-filters"
                className="text-left"
                disabled={!isInLayer1(currentNetwork.chainId)}
              >
                <div className="sort-by-toggle">
                  <span>{currentSorting.name}</span>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {sortOptions.map((item) => (
                  <Dropdown.Item key={item.key} eventKey={item.key}>
                    {item.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        <div className="create">
          <Button
            variant="pink"
            className="w-100"
            onClick={() => showCreateKeeper()}
            disabled={currentSignerAddress === "" || !isInLayer1(currentNetwork.chainId)}
          >
            <>{t("governance.new")}</>
          </Button>
        </div>
      </div>
      <div className="grid profiles">
        {keepersInfo.map((keeperInfo, index) => {
          const keeper = getDelegatorData(keeperInfo.address, keepers);
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
