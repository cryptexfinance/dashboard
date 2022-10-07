import React, { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/esm/Card";
import Spinner from "react-bootstrap/Spinner";
import { useTranslation } from "react-i18next";
import "../../styles/sewagefruit.scss";
import Loading from "../Loading";
import SignerContext from "../../state/SignerContext";
import MushroomNftContext from "../../state/MushroomNftContext";
import NetworkContext from "../../state/NetworkContext";
import { useMerkleTree } from "../../hooks/useMerkleTree";
import { NETWORKS } from "../../utils/constants";
import { errorNotification, isGoerli, notifyUser } from "../../utils/utils";
import mushroomMan from "../../assets/images/noti-error.png";
import sewageFruit from "../../assets/images/sewage-fruit.png";
import { whitelist, whitelistGoerli } from "./whitelist";

type SewageFruitType = {
  description: string;
  image: string;
  status: string;
};

type UserStatusType = {
  verified: boolean;
  claimed: boolean;
  tokenURI: string;
};

const SewageFruit = () => {
  const { t } = useTranslation();
  // const { isInitialized, Moralis } = useMoralis();
  const currentNetwork = useContext(NetworkContext);
  const signer = useContext(SignerContext);
  const mushroom = useContext(MushroomNftContext);
  const merkleTree = useMerkleTree(isGoerli(currentNetwork.chainId) ? whitelistGoerli : whitelist);
  const [signerAddress, setSignerAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [merkleProof, setMerkleProof] = useState<any>();
  const [mintPeriodEnd, setMintPeriodEnd] = useState(new Date());
  const [userStatus, setUserStatus] = useState<UserStatusType>({
    verified: false,
    claimed: false,
    tokenURI: "",
  });
  const [fruitInfo, setFruitInfo] = useState<SewageFruitType>();

  const getTokenId = async (currentAddress: string): Promise<number> => {
    const apiUrl = new URL(`https://deep-index.moralis.io/api/v2/${currentAddress}/nft`);

    apiUrl.search = new URLSearchParams({
      chain: isGoerli(currentNetwork.chainId) ? "goerli" : "eth",
      format: "decimal",
      token_addresses: NETWORKS.goerli.mushroomNft,
    }).toString();

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": process.env.REACT_APP_MORALIS_API_KEY || "",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const responseJson = await response.json();
    let tokenId = 0;
    if (responseJson && responseJson.result) {
      if (responseJson.result.length > 0) {
        tokenId = parseInt(responseJson.result[0].token_id);
      }
    }

    return tokenId;
  };

  const loadFruitData = async (tokenURI: string) => {
    fetch(tokenURI, {
      method: "GET",
    })
      .then((response) => response.json())
      .then((resp) => {
        if (resp) {
          let status = "";
          if (resp.attributes.length > 0) {
            if (resp.attributes[0].trait_type === "Status") {
              status = resp.attributes[0].value;
            }
          }
          setFruitInfo({
            description: resp.description,
            image: resp.image,
            status,
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const loadData = async (currentAddress: string) => {
    if (mushroom.mushroomNftRead) {
      setLoading(true);
      const currentUserStatus = userStatus;
      currentUserStatus.verified = merkleTree.verify(currentAddress);

      if (currentUserStatus.verified) {
        setMerkleProof(merkleTree.getProof(currentAddress));

        const userToClaimsCall = await mushroom.mushroomNftRead?.userToClaims(currentAddress);
        const mintPeriodCall = await mushroom.mushroomNftRead?.mintPeriod();

        // @ts-ignore
        const [userClaims, mintPeriod] = await signer.ethcallProvider?.all([
          userToClaimsCall,
          mintPeriodCall,
        ]);
        const endDate = new Date(mintPeriod.toNumber() * 1000);
        setMintPeriodEnd(endDate);

        currentUserStatus.claimed = userClaims;
        if (currentUserStatus.claimed) {
          let tokenId = 0;
          try {
            tokenId = await getTokenId(currentAddress);
          } catch (error) {
            console.log(error);
          }
          if (tokenId > 0) {
            const tokenURICall = await mushroom.mushroomNftRead?.tokenURI(tokenId);
            // @ts-ignore
            const [tokenURI] = await signer.ethcallProvider?.all([tokenURICall]);
            currentUserStatus.tokenURI = tokenURI;
            await loadFruitData(tokenURI);
          }
        }
      }
      setUserStatus(currentUserStatus);
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (signer && signer.signer) {
        const currentAddress = await signer.signer.getAddress();
        if (currentAddress !== "") {
          setSignerAddress(currentAddress);
          loadData(currentAddress);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line
  }, [signer.signer]);

  if (loading) {
    return <Loading />;
  }

  const refresh = async () => {
    setRefreshing(true);
    await loadData(signerAddress);
    setRefreshing(false);
  };

  const handleMint = async () => {
    try {
      const tx = await mushroom.mushroomNft?.mint(signerAddress, merkleProof);
      notifyUser(tx, refresh);
    } catch (error) {
      console.log(error.message);
      errorNotification(t("errors.tran-rejected"));
    }
  };

  const renderImage = () => {
    if (userStatus.verified) {
      if (userStatus.claimed && fruitInfo) {
        return <img src={fruitInfo.image} alt="Sewage Fruit" className="img-minted" />;
      }
      return <img src={sewageFruit} alt="Sewage Fruit" className="img-sewage" />;
    }
    return <img src={mushroomMan} alt="Sewage Fruit" />;
  };

  const renderMintInfo = () => {
    if (userStatus.verified) {
      if (userStatus.claimed && fruitInfo) {
        return (
          <p>
            Sewage Fruit MINTED. It will be revealed on DATE/TIME{" "}
            <span className="neon-pink">{mintPeriodEnd.toLocaleString()}</span>.
          </p>
        );
      }
      return (
        <p>
          <span className="neon-pink">Congrats!</span> You're eligible to mint a sewagefruit.
        </p>
      );
    }
    return (
      <p>
        <span className="neon-orange">Sorry!</span> You're not eligible to mint.
      </p>
    );
  };

  return (
    <div className="sewage-fruit">
      <h2>Sewage Fruit</h2>
      <div className="content">
        {signerAddress !== "" && (
          <Card className="diamond mint">
            <Card.Header>{renderMintInfo()}</Card.Header>
            <Card.Body>
              {refreshing ? (
                <Spinner variant="danger" className="spinner" animation="border" />
              ) : (
                renderImage()
              )}
            </Card.Body>
            {userStatus.verified && !userStatus.claimed && (
              <Card.Footer>
                <Button
                  variant="success"
                  className="neon-green"
                  onClick={handleMint}
                  disabled={refreshing}
                >
                  Mint
                </Button>
              </Card.Footer>
            )}
          </Card>
        )}
        <Card className="diamond info">
          <Card.Body>
            <p>
              Sewage Fruit is an NFT collection of 2,500 fungi’s. Not only can you use your NFT as
              your PFP but it will serve as access to exclusive rewards through quests set out by
              the DAO. Whether its minting TCAP or staking CTX we want people to explore our
              protocol and learn along the way.
            </p>
            <br />
            {signerAddress === "" && (
              <p>
                Connect your wallet to see if you are eligible to mint a Sewage Fruit. If you aren’t
                eligible, public mint will be available on XX/XX/XXXX.
              </p>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default SewageFruit;
