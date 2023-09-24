import React, { useEffect, useRef, useState } from "react";

import { ethers } from "ethers";
import "./Register.css";
import Chat from "./Chat";

const Register = () => {
  const [provider, setProvider] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [signer, setSigner] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [uname, setuName] = useState("");

  const connectWeb3 = async () => {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    setProvider(provider);

    const accounts = await provider.listAccounts();

    setAccounts(accounts);
  };

  const openChat = (account) => {
    setSigner(account);
    setShowChat(true);
  };

  useEffect(() => {
    connectWeb3();
  }, []);

  return (
    <>
      {!showChat && (
        <div>
          <p className="text-center" style={{ paddingTop: "200px" }}>
            Enter Name & Select Wallet:
          </p>
          <input
            style={{ width: "400px", margin: "auto" }}
            className="form-control mb-1"
            placeholder="Enter your name"
            onChange={(e) => setuName(e.target.value)}
          />
          <div
            style={{
              margin: "auto",
              width: "500px",
              maxHeight: "500px",
              padding: "30px",
              borderRadius: "10px",
              backgroundColor: "#eee",
              overflowY: "auto",
            }}
          >
            <ol>
              {accounts.map((account, index) => (
                <li
                  onClick={() => openChat(account)}
                  className="addr-li"
                  style={{ padding: "10px" }}
                  key={index}
                >
                  {account.address}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
      {showChat && <Chat uname={uname} provider={provider} signer={signer} />}
    </>
  );
};

export default Register;
