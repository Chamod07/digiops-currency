// Copyright (c) 2026, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import React, { useEffect, useState, useRef } from "react";
import { Input, Button, Avatar, message } from "antd";
import {
  HomeOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ReceiveCoins.css";
import Wso2MainImg from "../../assets/images/wso2_main.png";
import { QRCodeSVG } from "qrcode.react";
import {
  ERROR_RETRIEVE_WALLET_ADDRESS,
  ERROR_BRIDGE_NOT_READY,
  RECEIVE_COINS_TITLE,
  AMOUNT_TO_RECEIVE,
  GENERATE_QR_CODE,
  SHARE_QR_CODE,
  DOWNLOAD_QR_CODE,
} from "../../constants/strings";
import { getLocalDataAsync } from "../../helpers/storage";
import { STORAGE_KEYS, DEFAULT_WALLET_ADDRESS } from "../../constants/configs";
import { waitForBridge } from "../../helpers/bridge";

function ReceiveCoins() {
  const navigate = useNavigate();
  const qrCodeRef = useRef(null);

  const [messageApi, contextHolder] = message.useMessage();

  const [receiveAmount, setReceiveAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState(DEFAULT_WALLET_ADDRESS);
  const [qrCodeData, setQrCodeData] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);

  const fetchWalletAddress = async (retryCount = 0) => {
    const maxRetries = 3;

    try {
      const isBridgeReady = await waitForBridge();
      if (!isBridgeReady) {
        console.error(ERROR_BRIDGE_NOT_READY);
        messageApi.error(ERROR_BRIDGE_NOT_READY);
        return;
      }
      const walletAddressResponse = await getLocalDataAsync(
        STORAGE_KEYS.WALLET_ADDRESS,
      );
      if (
        walletAddressResponse &&
        walletAddressResponse !== null &&
        walletAddressResponse !== DEFAULT_WALLET_ADDRESS &&
        typeof walletAddressResponse === "string" &&
        walletAddressResponse.length > 2
      ) {
        setWalletAddress(walletAddressResponse);
      } else {
        if (retryCount < maxRetries) {
          setTimeout(() => fetchWalletAddress(retryCount + 1), 1000);
        } else {
          setWalletAddress(DEFAULT_WALLET_ADDRESS);
        }
      }
    } catch (error) {
      console.log(`${ERROR_RETRIEVE_WALLET_ADDRESS} - ${error}`);
      if (retryCount < maxRetries) {
        setTimeout(() => fetchWalletAddress(retryCount + 1), 1000);
      } else {
        messageApi.error(ERROR_RETRIEVE_WALLET_ADDRESS);
        setWalletAddress(DEFAULT_WALLET_ADDRESS);
      }
    }
  };

  useEffect(() => {
    const initializeWallet = async () => {
      await fetchWalletAddress();
    };

    initializeWallet();
    // eslint-disable-next-line
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  const handleGenerateQrCode = () => {
    if (!receiveAmount || parseFloat(receiveAmount) <= 0) {
      messageApi.warning("Please enter a valid amount");
      return;
    }

    // Create QR code data with wallet address and amount
    const qrData = JSON.stringify({
      wallet_address: walletAddress,
      coin_amount: receiveAmount,
    });

    setQrCodeData(qrData);
    setShowQrCode(true);
  };

  const handleDownloadQrCode = () => {
    try {
      const svg = qrCodeRef.current.querySelector("svg");
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `receive-${receiveAmount}-WSO2.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          messageApi.success("QR code downloaded successfully");
        });
      };

      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error("Error downloading QR code:", error);
      messageApi.error("Failed to download QR code");
    }
  };

  const handleShareQrCode = async () => {
    try {
      const svg = qrCodeRef.current.querySelector("svg");
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(async (blob) => {
          try {
            // Use Web Share API
            if (navigator.share && navigator.canShare) {
              const file = new File(
                [blob],
                `receive-${receiveAmount}-WSO2.png`,
                { type: "image/png" },
              );
              const shareData = {
                files: [file],
                title: `Receive ${receiveAmount} WSO2`,
                text: `Scan this QR code to send ${receiveAmount} WSO2 tokens`,
              };

              if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
                messageApi.success("QR code shared successfully");
              } else {
                messageApi.warning(
                  "Share not supported on this device. Please use download instead.",
                );
              }
            } else {
              messageApi.warning(
                "Share not supported on this device. Please use download instead.",
              );
            }
          } catch (error) {
            if (error.name === "AbortError") {
              // User cancelled the share dialog
              console.log("Share cancelled by user");
            } else {
              console.error("Error sharing QR code:", error);
              messageApi.warning(
                "Share not supported. Please use download instead.",
              );
            }
          }
        }, "image/png");
      };

      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error("Error sharing QR code:", error);
      messageApi.error("Failed to share QR code");
    }
  };

  return (
    <div className="receive-coins-container mx-3">
      {contextHolder}
      <div className="receive-header-section mt-4">
        <Button
          type="link"
          icon={<HomeOutlined />}
          onClick={handleBack}
          className="back-button"
        >
          Home
        </Button>
        <span className="receive-header">{RECEIVE_COINS_TITLE}</span>
        <div style={{ width: 60 }}></div>
      </div>

      {!showQrCode ? (
        <div className="receive-input-section">
          <div className="receive-description">
            Enter the amount you want to receive and generate a QR code to share
            with the sender
          </div>

          <div className="amount-input-container">
            <div className="amount-label">{AMOUNT_TO_RECEIVE}</div>
            <div className="amount-input-wrapper">
              <Input
                className="amount-input"
                placeholder="0.00"
                value={receiveAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*(\.\d*)?$/.test(value)) {
                    setReceiveAmount(value);
                  }
                }}
                size="large"
                autoFocus
              />
              <div className="currency-badge">
                <Avatar size={24} src={Wso2MainImg} />
                <span>O2C</span>
              </div>
            </div>
          </div>

          <Button
            block
            className="primary-button generate-qr-button"
            onClick={handleGenerateQrCode}
            disabled={!receiveAmount || parseFloat(receiveAmount) <= 0}
            icon={<QrcodeOutlined />}
          >
            {GENERATE_QR_CODE}
          </Button>
        </div>
      ) : (
        <div className="qr-code-display">
          <div className="qr-display-description">
            Share this QR code with the sender to receive payment
          </div>

          <div className="qr-code-section" ref={qrCodeRef}>
            <div className="qr-code-wrapper">
              <QRCodeSVG
                value={qrCodeData}
                size={220}
                level="M"
                includeMargin={true}
              />
            </div>
            <div className="qr-code-info">
              <div className="qr-info-item">
                <span className="qr-info-label">Amount</span>
                <span className="qr-info-value">{receiveAmount} WSO2</span>
              </div>
              <div className="qr-info-divider"></div>
              <div className="qr-info-item">
                <span className="qr-info-label">Wallet Address</span>
                <span className="qr-info-value wallet-address-text">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                </span>
              </div>
            </div>
          </div>

          <div className="qr-actions">
            <div className="action-buttons-row">
              <Button
                className="default-button action-button"
                onClick={handleDownloadQrCode}
                icon={<DownloadOutlined />}
              >
                {DOWNLOAD_QR_CODE}
              </Button>
              <Button
                className="primary-button action-button"
                onClick={handleShareQrCode}
                icon={<ShareAltOutlined />}
              >
                {SHARE_QR_CODE}
              </Button>
            </div>
            <Button
              block
              className="default-button new-qr-button"
              onClick={() => {
                setShowQrCode(false);
                setReceiveAmount("");
                setQrCodeData("");
              }}
            >
              Generate New QR Code
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceiveCoins;
