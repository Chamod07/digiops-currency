// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import React, { useState, useEffect, useMemo } from "react";
import { message, Modal } from "antd";
import {
  ArrowRightOutlined,
  CheckOutlined,
  CopyOutlined,
  EyeOutlined,
  WarningFilled,
} from "@ant-design/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "./WalletPhrase.css";
import { useNavigate } from "react-router-dom";
import {
  CONFIRM_RECOVERY_PHRASE,
  CONTINUE,
  COPIED,
  COPY_TO_CLIPBOARD,
  ERROR_READING_WALLET_DETAILS,
  PHRASE_COPIED,
  RECOVERY_PHRASE,
  RECOVERY_PHRASE_WARNING_TEXT,
  SUCCESS,
  WALLET_ADDRESS,
  WALLET_PRIVATE_KEY,
} from "../../constants/strings";
import { STORAGE_KEYS } from "../../constants/configs";
import { getLocalDataAsync } from "../../helpers/storage";
import { showToast } from "../../helpers/alerts";

function WalletPhrase(props) {
  const { walletPhrase } = props;
  const navigate = useNavigate();

  const [walletAddress, setWalletAddress] = useState("");
  const [walletPrivateKey, setWalletPrivateKey] = useState("");

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPrivateKeyModalOpen, setIsPrivateKeyModalOpen] = useState(false);
  const [isContinueModalOpen, setIsContinueModalOpen] = useState(false);

  const [isPhraseCopied, setIsPhraseCopied] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [isPrivateKeyCopied, setIsPrivateKeyCopied] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const fetchWalletDetails = async () => {
    try {
      const walletAddressResponse = await getLocalDataAsync(
        STORAGE_KEYS.WALLET_ADDRESS,
      );
      const privateKeyResponse = await getLocalDataAsync(
        STORAGE_KEYS.PRIVATE_KEY,
      );
      setWalletPrivateKey(privateKeyResponse);
      setWalletAddress(walletAddressResponse);
    } catch (err) {
      console.log(`${ERROR_READING_WALLET_DETAILS} - ${err}`);
      messageApi.error(ERROR_READING_WALLET_DETAILS);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phraseWords = useMemo(
    () => (walletPhrase ? walletPhrase.split(" ") : []),
    [walletPhrase],
  );

  const handleCopyPhrase = () => {
    showToast(SUCCESS, PHRASE_COPIED);
    setIsPhraseCopied(true);
    setTimeout(() => setIsPhraseCopied(false), 2000);
  };

  const handleCopyAddress = () => {
    showToast(SUCCESS, `${WALLET_ADDRESS} ${COPIED}`);
    setIsAddressCopied(true);
    setTimeout(() => setIsAddressCopied(false), 2000);
  };

  const handleCopyPrivateKey = () => {
    showToast(SUCCESS, `${WALLET_PRIVATE_KEY} ${COPIED}`);
    setIsPrivateKeyCopied(true);
    setTimeout(() => setIsPrivateKeyCopied(false), 2000);
  };

  const handleConfirmBackup = () => {
    setIsContinueModalOpen(false);
    navigate("/");
  };

  const isContinueDisabled = !walletAddress || !walletPrivateKey;

  return (
    <div className="wp-page">
      {contextHolder}

      <div className="wp-header">
        <p className="wp-subtitle">Your new wallet has been created</p>
      </div>

      <div className="wp-danger-chip">
        <WarningFilled
          style={{ color: "#EF4444", fontSize: 16, flexShrink: 0 }}
        />
        <span className="wp-danger-text">{RECOVERY_PHRASE_WARNING_TEXT}</span>
      </div>

      <div className="wp-phrase-card">
        <div className="wp-phrase-grid">
          {phraseWords.map((word, i) => (
            <div className="wp-phrase-cell" key={`${word}-${i}`}>
              <span className="wp-phrase-num">{i + 1}</span>
              <span className="wp-phrase-word">{word}</span>
            </div>
          ))}
        </div>
        <CopyToClipboard text={walletPhrase || ""} onCopy={handleCopyPhrase}>
          <button
            type="button"
            className={`wp-copy-btn ${isPhraseCopied ? "is-copied" : ""}`}
          >
            {isPhraseCopied ? (
              <CheckOutlined style={{ fontSize: 14 }} />
            ) : (
              <CopyOutlined style={{ fontSize: 14 }} />
            )}
            <span>{isPhraseCopied ? PHRASE_COPIED : COPY_TO_CLIPBOARD}</span>
          </button>
        </CopyToClipboard>
      </div>

      <div className="wp-key-section">
        <div className="wp-key-row">
          <div className="wp-key-label">Public Wallet Address</div>
          <button
            type="button"
            className="wp-key-btn"
            onClick={() => setIsAddressModalOpen(true)}
            disabled={!walletAddress}
          >
            <EyeOutlined style={{ fontSize: 14 }} />
            <span>Show Wallet Address</span>
          </button>
        </div>

        <div className="wp-key-row">
          <div className="wp-key-label">Private Wallet Key</div>
          <button
            type="button"
            className="wp-key-btn wp-key-btn-danger"
            onClick={() => setIsPrivateKeyModalOpen(true)}
            disabled={!walletPrivateKey}
          >
            <EyeOutlined style={{ fontSize: 14 }} />
            <span>Show Private Key</span>
          </button>
        </div>
      </div>

      <div className="wp-footer">
        <button
          type="button"
          className="wp-continue-btn"
          onClick={() => setIsContinueModalOpen(true)}
          disabled={isContinueDisabled}
        >
          <span>{CONTINUE}</span>
          <ArrowRightOutlined style={{ fontSize: 14 }} />
        </button>
      </div>

      {/* Show Wallet Address Modal */}
      <Modal
        open={isAddressModalOpen}
        onCancel={() => setIsAddressModalOpen(false)}
        footer={null}
        title="Wallet Address"
        centered
      >
        <div className="wp-modal">
          <div className="wp-modal-hint">
            This is your public wallet address. Safe to share with anyone.
          </div>
          <CopyToClipboard text={walletAddress || ""} onCopy={handleCopyAddress}>
            <button type="button" className="wp-modal-value">
              <span className="wp-modal-value-text">{walletAddress}</span>
              {isAddressCopied ? <CheckOutlined /> : <CopyOutlined />}
            </button>
          </CopyToClipboard>
        </div>
      </Modal>

      {/* Show Private Key Modal */}
      <Modal
        open={isPrivateKeyModalOpen}
        onCancel={() => setIsPrivateKeyModalOpen(false)}
        footer={null}
        title="Private Key"
        centered
      >
        <div className="wp-modal">
          <div className="wp-modal-warning">
            <WarningFilled
              style={{ color: "#EF4444", fontSize: 14, flexShrink: 0 }}
            />
            <span>
              Anyone with this key has full access to your wallet. Never share
              it.
            </span>
          </div>
          <CopyToClipboard
            text={walletPrivateKey || ""}
            onCopy={handleCopyPrivateKey}
          >
            <button type="button" className="wp-modal-value">
              <span className="wp-modal-value-text">{walletPrivateKey}</span>
              {isPrivateKeyCopied ? <CheckOutlined /> : <CopyOutlined />}
            </button>
          </CopyToClipboard>
        </div>
      </Modal>

      {/* Continue / Backup Confirmation Modal */}
      <Modal
        open={isContinueModalOpen}
        onCancel={() => setIsContinueModalOpen(false)}
        footer={null}
        title="Back up your recovery phrase?"
        centered
      >
        <div className="wp-modal">
          <div className="wp-modal-warning">
            <WarningFilled
              style={{ color: "#EF4444", fontSize: 14, flexShrink: 0 }}
            />
            <span>{CONFIRM_RECOVERY_PHRASE}</span>
          </div>
          <div className="wp-modal-actions">
            <button
              type="button"
              className="wp-modal-cancel"
              onClick={() => setIsContinueModalOpen(false)}
            >
              Go Back
            </button>
            <button
              type="button"
              className="wp-modal-confirm"
              onClick={handleConfirmBackup}
            >
              Yes, I have saved it
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default WalletPhrase;
