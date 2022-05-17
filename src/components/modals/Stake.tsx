import React, { useEffect, useContext, useState } from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import { ethers, BigNumber } from "ethers";
import { useTranslation } from "react-i18next";
import SignerContext from "../../state/SignerContext";
import "../../styles/modal.scss";

import { errorNotification, notifyUser } from "../../utils/utils";

type props = {
  show: boolean;
  poolTitle: string;
  poolToken?: ethers.Contract;
  pool?: ethers.Contract;
  balance: string;
  onHide: () => void;
  refresh: () => void;
};

export const Stake = ({ show, poolTitle, poolToken, pool, balance, onHide, refresh }: props) => {
  const { t } = useTranslation();
  const [stakeText, setStakeText] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const signer = useContext(SignerContext);

  // Infinite Approval
  const infiniteApproveValue = BigNumber.from("1157920892373161954235709850086879078532699");

  useEffect(() => {
    async function load() {
      if (poolToken && signer.signer) {
        const currentAddress = await signer.signer.getAddress();
        const approved = await poolToken.allowance(currentAddress, pool?.address);
        if (approved.toString() !== "0") {
          setIsApproved(true);
        } else {
          setIsApproved(false);
        }
      }
    }
    load();
    // eslint-disable-next-line
  }, [poolToken]);

  const onChangeStake = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStakeText(event.target.value);
  };

  const stakeTokens = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (pool) {
      if (stakeText) {
        try {
          const tx = await pool.stake(ethers.utils.parseEther(stakeText));
          notifyUser(tx, refresh);
          setStakeText("");
          onHide();
        } catch (error) {
          if (error.code === 4001) {
            errorNotification(t("errors.tran-rejected"));
          } else {
            errorNotification(t("errors.not-approve"));
          }
        }
      } else {
        errorNotification(t("errors.empty"));
      }
    }
  };

  const infiniteApproveTokens = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (poolToken) {
      try {
        const tx = await poolToken.approve(pool?.address, infiniteApproveValue);
        notifyUser(tx, refresh);
        setStakeText("");
        setIsApproved(true);
      } catch (error) {
        if (error.code === 4001) {
          errorNotification(t("errors.tran-rejected"));
        } else {
          console.log(error);
        }
      }
    }
  };

  const maxStake = async (e: React.MouseEvent) => {
    e.preventDefault();
    setStakeText(balance);
  };

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={() => {
        setStakeText("");
        onHide();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {t("stake")} {poolTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          {t("balance2")}: <b>{balance}</b>
        </p>
        <Form>
          <Form.Group>
            {isApproved ? (
              <>
                <Form.Label>{t("stake2")}</Form.Label>
                <Form.Label className="max">
                  <a href="/" className="number" onClick={maxStake}>
                    MAX
                  </a>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="0"
                  className="neon-green"
                  value={stakeText}
                  onChange={onChangeStake}
                />
              </>
            ) : (
              <></>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {isApproved ? (
          <>
            <Button variant="primary" className="neon-highlight" onClick={stakeTokens}>
              {t("stake")} {t("tokens")}
            </Button>
          </>
        ) : (
          <>
            <Button variant="primary" className="neon-green" onClick={infiniteApproveTokens}>
              {t("infinite-approve")}
            </Button>
          </>
        )}{" "}
        {t("tokens")}
      </Modal.Footer>
    </Modal>
  );
};
