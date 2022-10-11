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
import { NETWORKS, OS_API_URL } from "../../utils/constants";
import { errorNotification, isGoerli, notifyUser } from "../../utils/utils";
import mushroomMan from "../../assets/images/noti-error.png";
import sewageFruit from "../../assets/images/sewage-fruit.png";
import { whitelist, whitelistGoerli } from "./whitelist";

type props = {
  currentSignerAddress: string;
};

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

const MushroomNft = ({ currentSignerAddress }: props) => {
  const { t } = useTranslation();
  const currentNetwork = useContext(NetworkContext);
  const mushroom = useContext(MushroomNftContext);
  const signer = useContext(SignerContext);
  const merkleTree = useMerkleTree(isGoerli(currentNetwork.chainId) ? whitelistGoerli : whitelist);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [merkleProof, setMerkleProof] = useState<any>();
  const [mintPeriodEnd, setMintPeriodEnd] = useState(new Date());
  const [userStatus, setUserStatus] = useState<UserStatusType>({
    verified: false,
    claimed: false,
    tokenURI: "",
  });
  const [sewagefruit, setSewageFruit] = useState<SewageFruitType>();

  const getTokenId = async (): Promise<number> => {
    let apiUrl = new URL(OS_API_URL.mainnet);
    if (isGoerli(currentNetwork.chainId)) {
      apiUrl = new URL(OS_API_URL.goerli);
    }

    apiUrl.search = new URLSearchParams({
      owner: currentSignerAddress,
      asset_contract_address: NETWORKS.goerli.mushroomNft,
    }).toString();

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
    });

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const responseJson = await response.json();
    let tokenId = 0;
    if (responseJson && responseJson.assets) {
      if (responseJson.assets.length > 0) {
        tokenId = parseInt(responseJson.assets[0].token_id);
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
          setSewageFruit({
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

  const loadData = async () => {
    if (mushroom.mushroomNftRead) {
      setLoading(true);
      const currentUserStatus = userStatus;
      currentUserStatus.verified = merkleTree.verify(currentSignerAddress);

      if (currentUserStatus.verified) {
        setMerkleProof(merkleTree.getProof(currentSignerAddress));

        const userToClaimsCall = await mushroom.mushroomNftRead?.userToClaims(currentSignerAddress);
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
            tokenId = await getTokenId();
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
    if (currentSignerAddress !== "") {
      loadData();
    } else {
      setLoading(false);
    }

    // eslint-disable-next-line
  }, [currentSignerAddress]);

  if (loading) {
    return <Loading />;
  }

  const refresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMint = async () => {
    try {
      const tx = await mushroom.mushroomNft?.mint(currentSignerAddress, merkleProof);
      notifyUser(tx, refresh);
    } catch (error) {
      console.log(error.message);
      errorNotification(t("errors.tran-rejected"));
    }
  };

  const renderImage = () => {
    if (userStatus.verified) {
      if (userStatus.claimed && sewagefruit) {
        return <img src={sewagefruit.image} alt="Sewage Fruit" className="img-minted" />;
      }
      return <img src={sewageFruit} alt="Sewage Fruit" className="img-sewage" />;
    }
    return <img src={mushroomMan} alt="Sewage Fruit" />;
  };

  const renderMintInfo = () => {
    if (userStatus.verified) {
      if (userStatus.claimed && sewagefruit) {
        return (
          <p>
            Swagefruit will be revealed on{" "}
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
        {currentSignerAddress !== "" && (
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris.
            </p>
            <ul>
              <li>Duis aute irure dolor in reprehenderit in voluptate velit.</li>
              <li>Excepteur sint occaecat cupidatat non proident.</li>
              <li>Sunt in culpa qui officia deserunt mollit anim id est laborum.</li>
              <li>
                Sunt in culpa qui officia deserunt mollit anim id est laborum in voluptate velit.
              </li>
            </ul>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod.</p>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default MushroomNft;
