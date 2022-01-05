import React, { useEffect, useState } from "react";
import { Button, Form, Image } from "react-bootstrap";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import { ethers } from "ethers";
import Modal from "react-bootstrap/esm/Modal";
import { ProfileImage } from "./common";
import "../../styles/modal.scss";
import {
  errorNotification,
  getAddressFromENS,
  isValidAddress,
  notifyUser,
} from "../../utils/utils";

type props = {
  isNew: boolean;
  show: boolean;
  currentAddress: string;
  delegatorFactory?: ethers.Contract;
  keepers: any[];
  keeperInfo: any | null;
  onHide: () => void;
  refresh: () => void;
};

const KeeperForm = ({
  isNew,
  show,
  currentAddress,
  delegatorFactory,
  keepers,
  keeperInfo,
  onHide,
  refresh,
}: props) => {
  const [saving, setSaving] = useState(false);
  const [delegatee, setDelegatee] = useState("");
  const [address, setAddress] = useState("");
  const [isEthName, setIsEthName] = useState(false);
  const [delegateeError, setDelegateeError] = useState("");
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [twitter, setTwitter] = useState("");
  const [twitterError, setTwitterError] = useState("");
  const [discord, setDiscord] = useState("");
  const [discordError, setDiscordError] = useState("");
  const [expertise, setExpertise] = useState("");
  const [expertiseError, setExpertiseError] = useState("");
  const [why, setWhy] = useState("");
  const [whyError, setWhyError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");

  const cleanErrors = () => {
    setNameError("");
    setDelegateeError("");
    setWhyError("");
    setExpertiseError("");
    setTwitterError("");
    setDiscordError("");
    setImageError("");
  };

  useEffect(() => {
    if (keeperInfo !== null) {
      setDelegatee(keeperInfo.eth_name);
      setAddress(keeperInfo.address);
      setName(keeperInfo.name);
      setTwitter(keeperInfo.twitter);
      setDiscord(keeperInfo.discord);
      setExpertise(keeperInfo.expertise);
      setWhy(keeperInfo.why);
      setImageUrl(`http://${window.location.hostname}/${keeperInfo.image}`);
    } else {
      setDelegatee("");
      setAddress("");
      setIsEthName(false);
      setName("");
      setTwitter("");
      setDiscord("");
      setExpertise("");
      setWhy("");
      setImageUrl("");
      setImage(null);
    }
    cleanErrors();
  }, [keeperInfo]);

  const keeperExists = (keeperAddress: string) => {
    const index = keepers.findIndex(
      (item) => item.delegatee.toLowerCase() === keeperAddress.toLowerCase()
    );
    return index !== -1;
  };

  const isValidKeeper = async (value: string) => {
    const re1 = /^0x[a-fA-F0-9]{40}$/;
    const re2 = /^[a-zA-Z0-9]{2,20}.eth$/;

    if (!isNew) {
      return true;
    }

    if (re1.test(value.trim()) || re2.test(value.trim())) {
      let add;
      if (re2.test(value.trim())) {
        add = await getAddressFromENS(value);
        if (add === null) {
          setDelegateeError("Please enter a valid ENS name");
          return false;
        }
        if (keeperExists(add)) {
          setDelegateeError("Crypt keeper already exists for this address.");
          return false;
        }

        setIsEthName(true);
        setAddress(add);
        setDelegateeError("");
        return true;
      }

      add = await isValidAddress(value.trim());
      if (add === null) {
        setDelegateeError("Please enter a valid address");
        return false;
      }
      if (keeperExists(add)) {
        setDelegateeError("Crypt keeper already exists for this address.");
        return false;
      }
      setIsEthName(false);
      setAddress(add);
      setDelegateeError("");
      return true;
    }
    setDelegateeError("Please enter a valid eth name or address");
    return false;
  };

  const isNameValid = (value: string): boolean => {
    if (value.trim().length === 0) {
      setNameError("Name cannot be empty");
      return false;
    }
    if (value.trim().length > 25) {
      setNameError("Name is too long (25 characters max)");
      return false;
    }
    setNameError("");
    return true;
  };

  const isTwitterValid = (value: string): boolean => {
    const re = /^[a-zA-Z0-9_]{1,15}$/;
    if (value.trim().length > 0) {
      if (!re.test(value.trim())) {
        setTwitterError("It is not a valid twitter username)");
        return false;
      }
    }
    setTwitterError("");
    return true;
  };

  const isDiscordValid = (value: string): boolean => {
    const re = /^.{3,32}#[0-9]{4}$/;
    if (value.trim().length > 0) {
      if (!re.test(value.trim())) {
        setDiscordError("It is not a valid twitter username)");
        return false;
      }
    }
    setDiscordError("");
    return true;
  };

  const isExpertiseValid = (value: string): boolean => {
    if (value.trim().length === 0) {
      setExpertiseError("Expertise cannot be empty");
      return false;
    }
    if (value.trim().length > 120) {
      setExpertiseError("Expertise is too loong (120 characters  max)");
      return false;
    }
    setExpertiseError("");
    return true;
  };

  const isWhyValid = (value: string): boolean => {
    if (value.trim().length === 0) {
      setWhyError("Why field cannot be empty");
      return false;
    }
    if (value.trim().length > 2500) {
      setWhyError("Why field is too loong (2500 characters  max)");
      return false;
    }
    setWhyError("");
    return true;
  };

  const isImageValid = (value: File | null): boolean => {
    if (value === null) {
      if (isNew) {
        setImageError("Image cannot be empty");
      }
      return !isNew;
    }
    if (value.type !== "image/png" && value.type !== "image/jpg" && value.type !== "image/jpeg") {
      setImageError("Invalid file type");
      return false;
    }
    if (value.size > 100000) {
      setImageError("Image max size is 100 KB");
      setImageUrl("");
      return false;
    }
    setImageError("");
    return true;
  };

  const onChangeDelegatee = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDelegatee(event.target.value);
    isValidKeeper(event.target.value);
  };

  const onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    isNameValid(event.target.value);
  };

  const onChangeTwitter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTwitter(event.target.value);
    isTwitterValid(event.target.value);
  };

  const onChangeDiscord = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDiscord(event.target.value);
    isDiscordValid(event.target.value);
  };

  const onChangeExpertise = (event: React.ChangeEvent<HTMLInputElement>) => {
    setExpertise(event.target.value);
    isExpertiseValid(event.target.value);
  };

  const onChangeWhy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWhy(event.target.value);
    isWhyValid(event.target.value);
  };

  const onChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files !== null) {
      if (typeof event.target.files[0] !== "undefined") {
        setImage(event.target.files[0]);
        if (isImageValid(event.target.files[0])) {
          setImageUrl(URL.createObjectURL(event.target.files[0]));
        }
      }
    } else {
      isImageValid(null);
    }
  };

  const isFormDataValid = (): boolean =>
    isValidKeeper(delegatee) &&
    isNameValid(name) &&
    isExpertiseValid(expertise) &&
    isWhyValid(why) &&
    isTwitterValid(twitter) &&
    isDiscordValid(discord) &&
    isImageValid(image);

  const saveKeeper = async () => {
    const formData = new FormData();
    formData.append("address", address);
    formData.append("name", name);
    formData.append("eth_name", delegatee);
    formData.append("expertise", expertise);
    formData.append("why", why);
    formData.append("discord", discord);
    formData.append("twitter", twitter);
    // @ts-ignore
    formData.append("file", image);
    await fetch(`http://${window.location.hostname}/cryptkeeper/create`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.status === "error") {
          console.log(responseJson.errors);
        }
      })
      .catch((error) => {
        console.error("Error creating");
        errorNotification("Error creating keeper.");
        console.error(error);
      });
  };

  const createKeeper = async (event: React.MouseEvent) => {
    event.preventDefault();
    setSaving(true);
    /* if (delegatorFactory && isFormDataValid() && currentAddress !== "") {
      saveKeeper();
    } */
    if (delegatorFactory && isFormDataValid() && currentAddress !== "") {
      if (delegatee) {
        try {
          const tx = await delegatorFactory.createDelegator(delegatee);
          notifyUser(tx, refresh);
          setDelegatee("");
          await saveKeeper();
          refresh();
          onHide();
        } catch (error) {
          errorNotification("Delegator for the address already exists.");
        }
      } else {
        errorNotification("Field can't be empty");
      }
    }
    setSaving(false);
  };

  const updateKeeper = async () => {
    setSaving(true);
    if (isFormDataValid() && currentAddress !== "") {
      const formData = new FormData();
      formData.append("keeper_id", keeperInfo.id);
      formData.append("name", name);
      formData.append("expertise", expertise);
      formData.append("why", why);
      formData.append("discord", discord);
      formData.append("twitter", twitter);
      // @ts-ignore
      formData.append("file", image);

      await fetch(`http://${window.location.hostname}/cryptkeeper/update`, {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.status === "success") {
            refresh();
            onHide();
          } else {
            console.log(responseJson.errors);
          }
        })
        .catch((error) => {
          errorNotification("Unexpected error saving to DB");
          console.error(error);
        });
    }
    setSaving(false);
  };

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      onHide={() => {
        setDelegatee("");
        onHide();
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Create Crypt Keeper</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="diamond" />
        <Form className="cryptkeeper-form">
          <Col sm={12} md={12} lg={12} className="image-group">
            <Col sm={12} md={4} lg={4}>
              {imageUrl !== "" ? (
                <Image src={imageUrl} roundedCircle className="avatar" />
              ) : (
                <ProfileImage
                  address={address === "" ? currentAddress : address}
                  image=""
                  size={120}
                />
              )}
              <Form.File
                type="file"
                id="custom-file"
                onChange={onChangeImage}
                className={imageError === "" ? "neon-green" : "neon-orange"}
                label="Select your image"
                custom
              />
              <Form.Text className="field-error">{imageError}</Form.Text>
            </Col>
            <Col sm={12} md={8} lg={8}>
              <Col sm={12} md={12} lg={12}>
                <Form.Group className="" controlId="">
                  <Form.Control
                    type="text"
                    required
                    className={delegateeError === "" ? "neon-green" : "neon-orange"}
                    placeholder="Delegatee eth name or address"
                    value={delegatee}
                    onChange={onChangeDelegatee}
                    disabled={!isNew}
                  />
                  {delegateeError === "" && isEthName ? (
                    <Form.Text className="field-info" muted>
                      {address}
                    </Form.Text>
                  ) : (
                    <Form.Text className="field-error">{delegateeError}</Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col sm={12} md={12} lg={12}>
                <Form.Group className="" controlId="">
                  <Form.Control
                    type="text"
                    required
                    className={nameError === "" ? "neon-green" : "neon-orange"}
                    placeholder="Name"
                    value={name}
                    onChange={onChangeName}
                  />
                  <Form.Text className="field-error">{nameError}</Form.Text>
                </Form.Group>
              </Col>
            </Col>
          </Col>
          <Row>
            <Col sm={12} md={12} lg={12}>
              <Form.Group className="" controlId="">
                <Form.Control
                  type="text"
                  required
                  className={expertiseError === "" ? "neon-green" : "neon-orange"}
                  placeholder="Expertise"
                  value={expertise}
                  onChange={onChangeExpertise}
                />
                <Form.Text className="field-error">{expertiseError}</Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={12} lg={12}>
              <Form.Group className="" controlId="">
                <Form.Control
                  required
                  as="textarea"
                  rows={7}
                  className={whyError === "" ? "neon-green" : "neon-orange"}
                  placeholder="Why?"
                  value={why}
                  onChange={onChangeWhy}
                />
                <Form.Text className="field-error">{whyError}</Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col sm={12} md={6} lg={6}>
              <Form.Group className="" controlId="">
                <Form.Control
                  type="text"
                  className={twitterError === "" ? "neon-green" : "neon-orange"}
                  placeholder="Twitter"
                  value={twitter}
                  onChange={onChangeTwitter}
                />
                <Form.Text className="field-error">{twitterError}</Form.Text>
              </Form.Group>
            </Col>
            <Col sm={12} md={6} lg={6}>
              <Form.Group className="" controlId="">
                <Form.Control
                  type="text"
                  className={discordError === "" ? "neon-green" : "neon-orange"}
                  placeholder="Discord"
                  value={discord}
                  onChange={onChangeDiscord}
                />
                <Form.Text className="field-error">{discordError}</Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="pink"
          className="mt-3 mb-4 w-100"
          onClick={isNew ? createKeeper : updateKeeper}
          disabled={saving}
        >
          {isNew ? "Create" : "Update"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default KeeperForm;
