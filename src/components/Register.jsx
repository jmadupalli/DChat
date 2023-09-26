import React, { useEffect, useState } from "react";
import Web3Modal from 'web3modal';
import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import "./Register.css";
import Chat from "./Chat";
import { toast, ToastContainer } from "react-toastify";

const web3Modal = new Web3Modal({
  network: 'sepolia',
  cacheProvider: false,
  providerOptions: {
    walletConnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "fc0c54701a7b49a1a507619d6ca0a434"
      }
    }
  }
})

const Register = () => {
  const [provider, setProvider] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [signer, setSigner] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [uname, setuName] = useState(localStorage.getItem("uname") ? localStorage.getItem("uname") : '');

  const connectWeb3 = async () => {
    const conn = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(conn);
    setProvider(provider);

    const accounts = await provider.listAccounts();

    setAccounts(accounts);
  };

  const connectHandler = async (e) => {
    if (e.key === "Enter") {
      if (e.target.value.trim().length === 0) {
        toast.error("Please enter a valid name");
        return;
      }
      localStorage.setItem("uname", uname);
      connectWeb3();
    }
  }

  const openChat = (account) => {
    setSigner(account);
    setShowChat(true);
  };

  return (
    <>
      {!showChat && (
        <div>
          <p className="text-center" style={{ paddingTop: "200px" }}>
            Enter Name and hit ENTER to begin:
          </p>
          <input
            style={{ width: "400px", margin: "auto" }}
            className="form-control mb-1"
            placeholder="Enter your name"
            value={uname}
            onChange={(e) => setuName(e.target.value)}
            onKeyUp={(e) => connectHandler(e)}
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
            {accounts.length === 0 && "Wallet not connected yet!"}
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
      {showChat && <Chat uname={uname} setuName={setuName} provider={provider} signer={signer} />}
    </>
  );
};

export default Register;
