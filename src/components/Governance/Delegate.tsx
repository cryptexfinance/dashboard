import React, { useContext, useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ethers, BigNumber } from "ethers";
import Modal from "react-bootstrap/esm/Modal";
import "../../styles/modal.scss";
import SignerContext from "../../state/SignerContext";
import TokensContext from "../../state/TokensContext";
import { errorNotification, notifyUser } from "../../utils/utils";

type props = {
  show: boolean;
  delegatorAddress: string;
  delegatorFactory?: ethers.Contract;
  onHide: () => void;
  refresh: () => void;
};

const Delegate = ({ show, delegatorAddress, delegatorFactory, onHide, refresh }: props) => {
  const tokens = useContext(TokensContext);
  const signer = useContext(SignerContext);
  const [stakeText, setStakeText] = useState("");
  const [ctxBalance, setCtxBalance] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  // Infinite Approval
  const infiniteApproveValue = BigNumber.from("39614081250000000000000000000");

  useEffect(() => {
    async function load() {
      if (signer.signer && tokens.ctxTokenRead && delegatorFactory && delegatorAddress) {
        const currentAddress = await signer.signer.getAddress();
        const currentCtxBalanceCall = await tokens.ctxTokenRead?.balanceOf(currentAddress);
        const delegatorAllowanceCall = await tokens.ctxTokenRead?.allowance(
          currentAddress,
          delegatorFactory?.address
        );
        // @ts-ignore
        const [currentCtxBalance, delegatorAllowance] = await signer.ethcallProvider?.all([
          currentCtxBalanceCall,
          delegatorAllowanceCall,
        ]);
        const ctxString = ethers.utils.formatEther(currentCtxBalance);
        setCtxBalance(ctxString);
        setIsApproved(delegatorAllowance.toString() !== "0");
      }
    }
    load();
    // eslint-disable-next-line
  }, [delegatorAddress]);

  const onChangeStake = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStakeText(event.target.value);
  };

  const maxStake = async (e: React.MouseEvent) => {
    e.preventDefault();
    setStakeText(ctxBalance);
  };

  const stake = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (delegatorFactory && delegatorAddress) {
      if (stakeText && parseFloat(stakeText) > 0) {
        if (parseFloat(stakeText) <= parseFloat(ctxBalance)) {
          try {
            const tx = await delegatorFactory.stake(
              delegatorAddress,
              ethers.utils.parseEther(stakeText)
            );
            notifyUser(tx, refresh);
            setStakeText("");
            onHide();
          } catch (error) {
            errorNotification("Not enough CTX balance.");
          }
        } else {
          errorNotification("Not enough CTX balance");
        }
      } else {
        errorNotification("Field can't be empty");
      }
    }
  };

  const infiniteApproveTokens = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (tokens.ctxToken) {
      try {
        const tx = await tokens.ctxToken.approve(delegatorFactory?.address, infiniteApproveValue);
        notifyUser(tx, refresh);
        setStakeText("");
        setIsApproved(true);
      } catch (error) {
        if (error.code === 4001) {
          errorNotification("Transaction rejected");
        } else {
          console.log(error);
        }
      }
    }
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
        <Modal.Title id="contained-modal-title-vcenter">Stake & Delegate</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="diamond" />
        <Form>
          <Form.Group className="" controlId="">
            {isApproved ? (
              <>
                <p>
                  Stake and Delegate CTX to this Crypt Keeper. Each time you Stake and Delegate, you
                  must wait a minimum of 7 days before you can withdraw.
                </p>
                <Form.Label>Amount to Stake</Form.Label>
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
              <p>Approve delegating CTX tokens. You only have to do this once.</p>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {isApproved ? (
          <Button variant="pink" className="mt-3 mb-4 w-100" onClick={stake}>
            Delegate
          </Button>
        ) : (
          <Button variant="primary" className="neon-green" onClick={infiniteApproveTokens}>
            Infinite Approve
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default Delegate;
