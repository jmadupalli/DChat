import React, { useEffect, useState } from "react";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBBtn,
  MDBTypography,
  MDBTextArea,
  MDBCardHeader,
} from "mdb-react-ui-kit";
import { ToastContainer, toast } from "react-toastify";
import { ethers } from "ethers";

import EthCrypto from "eth-crypto";

import DChat from "../../artifacts/contracts/DChat.sol/DChat.json";

import "react-toastify/dist/ReactToastify.css";

import axios from "axios";

export default function Chat({ uname, provider, signer }) {
  const contractAddress = import.meta.env.VITE_Contract_Address;

  const [privKey, setPrivKey] = useState(null);

  const parentMessages = [];

  const [contract, setContract] = useState(null);

  const [recipients, setRecipients] = useState(() =>
    JSON.parse(localStorage.getItem("recipients_" + signer.address))
      ? JSON.parse(localStorage.getItem("recipients_" + signer.address))
      : {}
  );

  const [currR, setCurrR] = useState(null);

  const [mBox, setMBox] = useState("");

  const [subbed, setSubbed] = useState(false);

  const [fileInp, setFileIinp] = useState(null);

  const subscribeToEvents = async () => {
    if (contract && privKey && !subbed) {
      contract.on("NewMessage", async (message) => {
        setSubbed(() => true);
        if (message[1] == signer.address) {
          const sender = message[0];
          const actMessage = JSON.parse(message[2]);
          const msg = await EthCrypto.decryptWithPrivateKey(
            privKey,
            actMessage.msg
          );
          actMessage["msg"] = msg;
          const recipInfo = await contract.fetchPubKey(sender);
          setRecipients((prev) => {
            return !(sender in prev)
              ? {
                  ...prev,
                  [sender]: {
                    uname: recipInfo[0],
                    pubKey: recipInfo[1],
                    address: sender,
                    messages: [actMessage],
                  },
                }
              : {
                  ...prev,
                  [sender]: {
                    ...prev[sender],
                    messages: [...prev[sender].messages, actMessage],
                  },
                };
          });
        }
      });
    }
  };

  const sendToIPFS = async (e) => {
    if (fileInp) {
      const formData = new FormData();
      formData.append("file", fileInp);

      const res = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_API}`,
        },
      });
      sendMessage(true, res.data.IpfsHash);
    }
  };

  useEffect(() => {
    const connectToContract = async () => {
      const contractF = new ethers.Contract(contractAddress, DChat.abi, signer);
      setContract(contractF);
    };
    connectToContract();
  }, []);

  useEffect(() => {
    const registerUser = async () => {
      if (contract) {
        const isRegistered = await contract.isRegistered(signer.address);
        if (isRegistered[0] === false) {
          const { publicKey, privateKey } = EthCrypto.createIdentity();
          setPrivKey(() => privateKey);
          localStorage.setItem(signer.address, privateKey);
          await contract.registerUser(uname, publicKey);
          toast.info(`${uname}, Registered with the smart contract`, {
            closeOnClick: false,
          });
        } else {
          if (localStorage.getItem(signer.address) != null) {
            setPrivKey(() => localStorage.getItem(signer.address));
          } else toast.error("Private key not found, app won't work");
        }
      }
    };

    registerUser();
  }, [contract]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (contract) {
        const messages = await contract.fetchMessages();
        const t_recipients = {};

        for (const message of messages) {
          if (message[1] === signer.address) {
            const sender = message[0];
            const actMessage = JSON.parse(message[2]);
            const msg = await EthCrypto.decryptWithPrivateKey(
              privKey,
              actMessage.msg
            );
            actMessage["msg"] = msg;
            if (!t_recipients[sender]) {
              const recipInfo = await contract.fetchPubKey(sender);
              t_recipients[sender] = {
                uname: recipInfo[0],
                pubKey: recipInfo[1],
                address: sender,
                messages: [actMessage],
              };
            } else {
              t_recipients[sender].messages.push(actMessage);
            }

            setRecipients(t_recipients);
          }
        }
      }
    };

    subscribeToEvents();

    return () => {
      if (contract) {
        contract.removeAllListeners();
      }
    };
    //fetchMessages();
  }, [privKey]);

  useEffect(() => {
    localStorage.setItem(
      "recipients_" + signer.address,
      JSON.stringify(recipients)
    );
  }, [recipients]);

  const revealPrivKey = () => {
    toast.info(privKey);
  };

  const addNewChat = async (e) => {
    if (e.key === "Enter") {
      const recipient = e.target.value;
      if (!(recipient in recipients)) {
        const isRegistered = await contract.isRegistered(recipient);
        if (isRegistered[0] === false)
          toast.error("Recipient is not registered");
        else {
          const pubKey = (await contract.fetchPubKey(recipient))[1];
          console.log(pubKey);
          setRecipients((recipients) => {
            return {
              ...recipients,
              [recipient]: {
                uname: isRegistered[1],
                pubKey,
                address: recipient,
                messages: [],
              },
            };
          });
        }
        setCurrR(() => recipient);
      }
    }
  };

  const sendMessage = async (isFile = false, ipfsHash = null) => {
    const encrypted = await EthCrypto.encryptWithPublicKey(
      recipients[currR].pubKey,
      !isFile ? mBox : ipfsHash
    );
    const message = !isFile
      ? {
          from: signer.address,
          to: currR,
          type: "text",
          timestamp: Date.now(),
          msg: mBox,
        }
      : {
          from: signer.address,
          to: currR,
          type: "file",
          timestamp: Date.now(),
          msg: ipfsHash,
        };
    setRecipients((prev) => {
      return {
        ...prev,
        [currR]: {
          ...prev[currR],
          messages: [...prev[currR].messages, message],
        },
      };
    });

    await contract
      .sendMessage(currR, JSON.stringify({ ...message, msg: encrypted }))
      .catch((err) => toast.error(err));

    setMBox("");
  };

  return (
    <MDBContainer
      fluid
      className="p-4"
      style={{ backgroundColor: "#eee", height: "100%" }}
    >
      <MDBRow className="mb-4" style={{ height: "95%" }}>
        <MDBCol md="6" lg="5" xl="4" className="mb-4 mb-md-0">
          <h5
            className="font-weight-bold mb-3 text-center"
            style={{ fontSize: "16px" }}
          >
            dApp Contract: {contractAddress}
          </h5>

          <MDBCard style={{ maxHeight: "100%", marginBottom: "50px" }}>
            <MDBCardBody>
              <p>
                <b>Connected with: </b> {signer.address} <br />
                <b>Your Name: </b> {uname} <br />
                <button
                  className="btn btn-primary m-2"
                  onClick={() => revealPrivKey()}
                >
                  Show Private Key
                </button>
              </p>

              <input
                className="form-control mb-3"
                placeholder="Enter Recipient address, and hit ENTER"
                onKeyUp={addNewChat}
              />

              <MDBTypography
                listUnStyled
                className="overflow-auto"
                style={{ maxHeight: "85%" }}
              >
                {Object.keys(recipients).map((r) => {
                  return (
                    <li
                      onClick={() => setCurrR(r)}
                      key={r}
                      className="p-2 border-bottom "
                      style={{
                        backgroundColor: r === currR ? "#eee" : "#fff",
                      }}
                    >
                      <a href="#!" className="d-flex justify-content-between">
                        <div className="d-flex flex-row">
                          <MDBIcon
                            className="fa-3x"
                            far
                            icon="user-circle"
                            style={{
                              width: "50px",
                              color: "#333",
                              margin: "10px",
                            }}
                          />

                          <div className="pt-1">
                            <p className="fw-bold mb-0">
                              {recipients[r].uname}
                            </p>
                            <p className="small text-muted">
                              {/* {recipients[r].messages?.length > 0
                                ? recipients[r].messages[
                                    recipients[r].messages.length - 1
                                  ].msg?.substring(0, 30) + "..."
                                : "..."} */}
                              ...
                            </p>
                          </div>
                        </div>
                        <div className="pt-1">
                          <p className="small text-muted mb-1">--</p>
                          <span className="badge bg-danger float-end"></span>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </MDBTypography>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        <MDBCol md="6" lg="7" xl="8" style={{ height: "100%" }}>
          <MDBTypography
            listUnStyled
            style={{ height: "80%", overflowY: "auto" }}
          >
            {(!currR || recipients[currR]?.messages?.length == 0) && (
              <p style={{ padding: "30px", textAlign: "center" }}>
                {" "}
                No messages yet!
              </p>
            )}

            {currR &&
              recipients[currR]?.messages?.length > 0 &&
              recipients[currR].messages.map((msg, index) => (
                <>
                  {msg.from == signer.address ? (
                    <li key={index} className="d-flex mb-4">
                      <MDBIcon
                        className="fa-3x"
                        icon="user-circle"
                        style={{
                          width: "50px",
                          color: "#333",
                          margin: "10px",
                        }}
                      />
                      <MDBCard style={{ width: "80%" }}>
                        <MDBCardHeader className="d-flex justify-content-between p-3">
                          <p className="fw-bold mb-0">{uname}</p>
                          <p className="text-muted small mb-0">
                            <MDBIcon far icon="clock" />{" "}
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </MDBCardHeader>
                        <MDBCardBody>
                          <p className="mb-0">
                            {msg.type === "text" ? (
                              msg.msg
                            ) : (
                              <>
                                You sent a file through Pinata: <br />
                                <a
                                  href={
                                    import.meta.env.VITE_PINATA_GATEWAY +
                                    msg.msg
                                  }
                                  target="_blank"
                                >
                                  Click here to open
                                </a>{" "}
                              </>
                            )}
                          </p>
                        </MDBCardBody>
                      </MDBCard>
                    </li>
                  ) : (
                    <li
                      key={index}
                      className="d-flex justify-content-between mb-4"
                    >
                      <MDBCard className="w-100">
                        <MDBCardHeader className="d-flex justify-content-between p-3">
                          <p className="fw-bold mb-0">
                            {recipients[currR].uname}
                          </p>
                          <p className="text-muted small mb-0">
                            <MDBIcon far icon="clock" />{" "}
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </MDBCardHeader>
                        <MDBCardBody>
                          <p className="mb-0">
                            {msg.type === "text" ? (
                              msg.msg
                            ) : (
                              <>
                                You received a file through Pinata: <br />
                                <a
                                  href={
                                    import.meta.env.VITE_PINATA_GATEWAY +
                                    msg.msg
                                  }
                                  target="_blank"
                                >
                                  Click here to open
                                </a>{" "}
                              </>
                            )}
                          </p>
                        </MDBCardBody>
                      </MDBCard>
                      <MDBIcon
                        className="fa-3x"
                        icon="user-circle"
                        style={{
                          width: "50px",
                          color: "#333",
                          margin: "10px",
                        }}
                      />
                    </li>
                  )}
                </>
              ))}
          </MDBTypography>
          <div style={{ height: "20%" }}>
            <MDBTextArea
              style={{ backgroundColor: "#fff" }}
              label="Message"
              id="textAreaExample"
              rows={4}
              onChange={(e) => setMBox(e.target.value)}
              value={mBox}
            />
            <MDBBtn
              onClick={(e) => sendMessage()}
              color="info"
              rounded
              className="float-end"
            >
              Send
            </MDBBtn>
            <input
              type="file"
              onChange={(e) => setFileIinp(e.target.files[0])}
              id="button-file"
            />
            <button className="btn btn-info" onClick={() => sendToIPFS()}>
              Send File
            </button>
          </div>
        </MDBCol>
      </MDBRow>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </MDBContainer>
  );
}
