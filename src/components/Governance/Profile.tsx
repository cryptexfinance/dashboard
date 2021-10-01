import React from "react";
import { Image, Badge } from "react-bootstrap";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Modal from "react-bootstrap/esm/Modal";
import "../../styles/delegators.scss";
import Blockies from "react-blockies";
import { makeShortAddress } from "../../utils/utils";
import { VoteBadge } from "./common";
import discordImg from "../../assets/images/discord-icon.jpg";
import { infoType } from "./data";

type props = {
  delegator: {
    id: string;
    delegatee: string;
    delegatedVotes: string;
    delegatedVotesRaw: string;
    tokenOwners: { stake: string; stakeRaw: string }[];
    totalHoldersRepresented: Number;
  };
  info: infoType;
  show: boolean;
  onHide: () => void;
};

const Profile = ({ delegator, info, show, onHide }: props) => {
  const ethNameFormat = () => {
    if (info?.eth_name.includes(".eth")) {
      return info?.eth_name;
    }
    return makeShortAddress(info?.eth_name);
  };

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={() => {
        onHide();
      }}
    >
      <Modal.Header closeButton />
      <Modal.Body>
        <div className="fullprofile">
          <Row>
            <Col md={4} lg={4}>
              {info.image ? (
                <Image src={"images/".concat(info.image)} roundedCircle className="avatar" />
              ) : (
                <Blockies
                  className="blockie"
                  seed={delegator.delegatee}
                  size={10}
                  scale={10}
                  color="#ffffff"
                  bgColor="#e440f2"
                  spotColor="#7940f2"
                />
              )}
            </Col>
            <Col md={8} lg={8} className="main-info">
              <h4>{info?.name}</h4>
              <h5>{ethNameFormat()}</h5>
              <div className="badges">
                <div className="votes">
                  <VoteBadge
                    address={delegator.id}
                    amount={delegator.delegatedVotes}
                    label="Votes"
                  />
                  <VoteBadge
                    address={delegator.id}
                    amount={delegator.totalHoldersRepresented.toString()}
                    label="Represented"
                  />
                </div>
                <div className="accounts">
                  <Badge pill variant="highlight">
                    <img src={discordImg} className="discord" alt="discord logo" />
                    {info.discord_username}
                  </Badge>
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <h5 className="mt-2">Why should you delegate to me?</h5>
            <p>{info?.why}</p>
          </Row>
          <div className="content">
            {info.development && (
              <Row>
                <h5 className="mt-2">Development</h5>
                <p>{info.development}</p>
              </Row>
            )}
            {info.brand && (
              <Row>
                <h5 className="mt-2">Brand</h5>
                <p>{info.brand}</p>
              </Row>
            )}
            {info.operations && (
              <Row>
                <h5 className="mt-2">Operations</h5>
                <p>{info.operations}</p>
              </Row>
            )}
            {info.other && (
              <Row>
                <h5 className="mt-2">Other</h5>
                <p>{info.other}</p>
              </Row>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Profile;
