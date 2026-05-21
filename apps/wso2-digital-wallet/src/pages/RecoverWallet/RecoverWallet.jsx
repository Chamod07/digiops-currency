// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import React, { useState } from 'react';
import { message, Modal } from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  CheckOutlined,
  CopyOutlined,
  EyeOutlined,
  LoadingOutlined,
  SnippetsOutlined,
  UndoOutlined,
  WarningFilled,
} from '@ant-design/icons';
import { ethers } from 'ethers';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useNavigate } from 'react-router-dom';
import './RecoverWallet.css';
import {
  CONTINUE,
  COPIED,
  ERROR,
  OK,
  RECOVER_WALLET,
  RECOVER_WALLET_ERROR,
  RECOVER_YOUR_WALLET,
  SUCCESS,
  WALLET_ADDRESS,
  WALLET_PRIVATE_KEY,
} from '../../constants/strings';
import { PASS_PHRASE_LENGTH, STORAGE_KEYS } from '../../constants/configs';
import { saveLocalDataAsync } from '../../helpers/storage';
import { showAlertBox, showToast } from '../../helpers/alerts';

export default function RecoverWallet() {
  const navigate = useNavigate();

  const [wordList, setWordList] = useState(Array(PASS_PHRASE_LENGTH).fill(''));
  const [walletAddress, setWalletAddress] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [walletRecovered, setWalletRecovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPrivateKeyModalOpen, setIsPrivateKeyModalOpen] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [isPrivateKeyCopied, setIsPrivateKeyCopied] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const isFullPhrase = (list) =>
    list.filter((w) => w && w.trim()).length === PASS_PHRASE_LENGTH;
  const continueRecover = isFullPhrase(wordList);

  const fillAllWords = (words) => {
    const next = Array(PASS_PHRASE_LENGTH).fill('');
    for (let i = 0; i < Math.min(words.length, PASS_PHRASE_LENGTH); i++) {
      next[i] = words[i];
    }
    setWordList(next);
  };

  const handleInputChange = (index, value) => {
    const words = value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    if (words.length === PASS_PHRASE_LENGTH) {
      fillAllWords(words);
      return;
    }
    const next = [...wordList];
    next[index] = value;
    setWordList(next);
  };

  const handlePaste = (index, e) => {
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const words = pastedText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    if (words.length === PASS_PHRASE_LENGTH) {
      e.preventDefault();
      fillAllWords(words);
    }
  };

  const handlePasteFromClipboard = async () => {
    if (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function') {
      messageApi.error("Clipboard isn't available. Paste into any box instead.");
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);

      if (words.length === 0) {
        messageApi.error('Clipboard is empty');
        return;
      }
      if (words.length !== PASS_PHRASE_LENGTH) {
        messageApi.error(
          `Clipboard has ${words.length} word${words.length === 1 ? '' : 's'}. Expected ${PASS_PHRASE_LENGTH}.`,
        );
        return;
      }
      fillAllWords(words);
      showToast(SUCCESS, 'Phrase pasted');
    } catch (e) {
      console.error('Clipboard read failed:', e);
      messageApi.error("Couldn't read clipboard. Paste into any box instead.");
    }
  };

  const handleRecover = () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const phrase = wordList.join(' ');
        const wallet = ethers.Wallet.fromMnemonic(phrase);

        setWalletAddress(wallet.address);
        setPrivateKey(wallet.privateKey);

        await saveLocalDataAsync(STORAGE_KEYS.WALLET_ADDRESS, wallet.address);
        await saveLocalDataAsync(STORAGE_KEYS.PRIVATE_KEY, wallet.privateKey);

        if (wallet.address) {
          setWalletRecovered(true);
        }
      } catch (error) {
        setWalletRecovered(false);
        showAlertBox(ERROR, RECOVER_WALLET_ERROR, OK);
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  const handleContinue = () => {
    navigate('/');
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

  return (
    <div className="rw-page">
      {contextHolder}

      <div className="rw-header">
        <p className="rw-subtitle">
          {walletRecovered
            ? 'Your wallet has been restored on this device.'
            : 'Paste your 12-word recovery phrase below, or type each word in order.'}
        </p>
      </div>

      {!walletRecovered ? (
        <>
          <div className="rw-paste-row">
            <button
              type="button"
              className="rw-paste-btn"
              onClick={handlePasteFromClipboard}
            >
              <SnippetsOutlined style={{ fontSize: 14 }} />
              <span>Paste from clipboard</span>
            </button>
          </div>

          <div className="rw-seed-grid">
            {wordList.map((word, i) => (
              <div className="rw-seed-cell" key={i}>
                <span className="rw-seed-num">{i + 1}</span>
                <input
                  className="rw-seed-input"
                  type="text"
                  placeholder={`word ${i + 1}`}
                  value={word}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  onPaste={(e) => handlePaste(i, e)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            ))}
          </div>

          <div className="rw-footer">
            <button
              type="button"
              className="rw-primary-btn"
              onClick={handleRecover}
              disabled={!continueRecover || loading}
            >
              {loading ? (
                <LoadingOutlined style={{ fontSize: 16 }} spin />
              ) : (
                <UndoOutlined style={{ fontSize: 14 }} />
              )}
              <span>{loading ? 'Recovering…' : RECOVER_WALLET}</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="rw-success-chip">
            <CheckCircleFilled
              style={{ color: '#22C55E', fontSize: 18, flexShrink: 0 }}
            />
            <span className="rw-success-text">
              Wallet recovered. Verify the details below before continuing.
            </span>
          </div>

          <div className="rw-key-section">
            <div className="rw-key-row">
              <div className="rw-key-label">Public Wallet Address</div>
              <button
                type="button"
                className="rw-key-btn"
                onClick={() => setIsAddressModalOpen(true)}
                disabled={!walletAddress}
              >
                <EyeOutlined style={{ fontSize: 14 }} />
                <span>Show Wallet Address</span>
              </button>
            </div>

            <div className="rw-key-row">
              <div className="rw-key-label">Private Wallet Key</div>
              <button
                type="button"
                className="rw-key-btn rw-key-btn-danger"
                onClick={() => setIsPrivateKeyModalOpen(true)}
                disabled={!privateKey}
              >
                <EyeOutlined style={{ fontSize: 14 }} />
                <span>Show Private Key</span>
              </button>
            </div>
          </div>

          <div className="rw-footer">
            <button
              type="button"
              className="rw-primary-btn"
              onClick={handleContinue}
            >
              <span>{CONTINUE}</span>
              <ArrowRightOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
        </>
      )}

      <Modal
        open={isAddressModalOpen}
        onCancel={() => setIsAddressModalOpen(false)}
        footer={null}
        title="Wallet Address"
        centered
      >
        <div className="rw-modal">
          <div className="rw-modal-hint">
            This is your public wallet address. Safe to share with anyone.
          </div>
          <CopyToClipboard text={walletAddress || ''} onCopy={handleCopyAddress}>
            <button type="button" className="rw-modal-value">
              <span className="rw-modal-value-text">{walletAddress}</span>
              {isAddressCopied ? <CheckOutlined /> : <CopyOutlined />}
            </button>
          </CopyToClipboard>
        </div>
      </Modal>

      <Modal
        open={isPrivateKeyModalOpen}
        onCancel={() => setIsPrivateKeyModalOpen(false)}
        footer={null}
        title="Private Key"
        centered
      >
        <div className="rw-modal">
          <div className="rw-modal-warning">
            <WarningFilled
              style={{ color: '#EF4444', fontSize: 14, flexShrink: 0 }}
            />
            <span>
              Anyone with this key has full access to your wallet. Never share
              it.
            </span>
          </div>
          <CopyToClipboard
            text={privateKey || ''}
            onCopy={handleCopyPrivateKey}
          >
            <button type="button" className="rw-modal-value">
              <span className="rw-modal-value-text">{privateKey}</span>
              {isPrivateKeyCopied ? <CheckOutlined /> : <CopyOutlined />}
            </button>
          </CopyToClipboard>
        </div>
      </Modal>
    </div>
  );
}
