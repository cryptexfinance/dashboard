import React from "react";
import { Button, Card, Col } from "react-bootstrap/esm";
import { GiSpottedMushroom } from "react-icons/gi";
import { FaArrowRight } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import { ReactComponent as VaultIcon } from "../../assets/images/welcome/vault.svg";
import { ReactComponent as StakeIcon } from "../../assets/images/welcome/stake.svg";
import { ReactComponent as FarmIcon } from "../../assets/images/welcome/farm.svg";

const Features = () => {
  const history = useHistory();

  return (
    <Col xs={12} sm={12} md={6} lg={6} className="col-wrapper features">
      <Card>
        <Card.Header>
          <h2>Use Cryptex For</h2>
        </Card.Header>
        <Card.Body>
          <Button
            className="btn-feature"
            onClick={() => {
              history.push("/vaults");
            }}
          >
            <div className="feature-content">
              <VaultIcon />
              <p>Creating Vaults & Minting Index tokens</p>
            </div>
            <div className="feature-action">
              <FaArrowRight size={20} />
            </div>
          </Button>
          <Button
            className="btn-feature"
            onClick={() => {
              history.push("/farm");
            }}
          >
            <div className="feature-content">
              <FarmIcon />
              <p>Providing liquidity</p>
            </div>
            <div className="feature-action">
              <FaArrowRight size={20} />
            </div>
          </Button>
          <Button
            className="btn-feature"
            onClick={() => {
              history.push("/governance");
            }}
          >
            <div className="feature-content">
              <StakeIcon className="stake-icon" />
              <p>Staking & delegating to Crypt Keepers</p>
            </div>
            <div className="feature-action">
              <FaArrowRight size={20} />
            </div>
          </Button>
          <Button
            className="btn-feature"
            onClick={() => {
              history.push("/sewagefruitz");
            }}
          >
            <div className="feature-content">
              <GiSpottedMushroom size={28} className="sewagefruit" />
              <p>Going on quests with Sewage Fruitz</p>
            </div>
            <div className="feature-action">
              <FaArrowRight size={20} />
            </div>
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default Features;
