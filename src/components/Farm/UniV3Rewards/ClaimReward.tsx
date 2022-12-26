import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ethers } from "ethers";
import Modal from "react-bootstrap/esm/Modal";
import { useTranslation } from "react-i18next";
import "../../../styles/modal.scss";
import { errorNotification, notifyUser } from "../../../utils/utils";
import { IncentiveType } from "./types";

type props = {
  show: boolean;
  ownerAddress: string;
  currentReward: number;
  incentive: IncentiveType;
  stakerContract?: ethers.Contract;
  onHide: () => void;
  refresh: () => void;
};

const ClaimReward = ({
  show,
  ownerAddress,
  currentReward,
  incentive,
  stakerContract,
  onHide,
  refresh,
}: props) => {
  const { t } = useTranslation();
  const [rewardText, setRewardText] = useState("");
  const [canClaim, setCanClaim] = useState(true);

  const onChangeReward = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRewardText(event.target.value);
  };

  const maxReward = async (e: React.MouseEvent) => {
    e.preventDefault();
    setRewardText(currentReward.toString());
  };

  const claim = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (stakerContract && canClaim) {
      setCanClaim(false);
      if (rewardText && parseFloat(rewardText) > 0) {
        if (parseFloat(rewardText) <= currentReward) {
          try {
            const tx = await stakerContract.claimReward(
              incentive.rewardToken,
              ownerAddress,
              ethers.utils.parseEther(rewardText)
            );
            notifyUser(tx, refresh);
            setRewardText("");
            onHide();
          } catch (error) {
            errorNotification(t("errors.tran-rejected"));
          }
        } else {
          errorNotification("Not enough CTX reward");
        }
      } else {
        errorNotification(t("errors.empty"));
      }
      setCanClaim(true);
    }
  };

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={() => {
        setRewardText("");
        onHide();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {t("farming.univ3.claim-reward")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="diamond" />
        <Form>
          <Form.Group className="" controlId="">
            <Form.Label>{t("farming.univ3.amount-claim")}</Form.Label>
            <Form.Label className="max">
              <a href="/" className="number" onClick={maxReward}>
                MAX
              </a>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="0"
              className="neon-green"
              value={rewardText}
              onChange={onChangeReward}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="pink" className="mt-3 mb-4 w-100" onClick={claim} disabled={!canClaim}>
          {canClaim ? t("farming.univ3.claim-reward") : t("claiming")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClaimReward;
