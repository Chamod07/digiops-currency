// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import './Profile.css';

import {
  useEffect,
  useState,
} from 'react';

import {
  Button,
  Modal,
  Spin,
} from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useNavigate } from 'react-router-dom';

import {
  CheckOutlined,
  CopyOutlined,
  EyeOutlined,
  LoadingOutlined,
  LogoutOutlined,
  QrcodeOutlined,
  RightOutlined,
  WarningFilled,
} from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';

import { COLORS } from '../../constants/colors';
import { STORAGE_KEYS } from '../../constants/configs';
import {
  ERROR,
  ERROR_READING_WALLET_DETAILS,
  ERROR_WHEN_LOGGING_OUT,
  LOGOUT,
  OK,
  SHOW_WALLET_ADDRESS,
  SUCCESS,
  WALLET_ADDRESS_COPIED,
  WALLET_PRIVATE_KEY,
} from '../../constants/strings';
import { showToast, showAlertBox } from '../../helpers/alerts';
import {
  getLocalDataAsync,
  saveLocalDataAsync,
} from '../../helpers/storage';
import {
  getUserWalletAddresses,
  setWalletAsPrimary,
} from '../../services/wallet.service';

const formatWalletAddress = (addr) => {
  if (!addr) return '';
  if (addr.length <= 24) return addr;
  return `${addr.slice(0, 12)}...${addr.slice(-10)}`;
};

function Profile() {
  const navigate = useNavigate();

  const [walletAddress, setWalletAddress] = useState('');
  const [walletPrivateKey, setWalletPrivateKey] = useState('');
  const [userWallets, setUserWallets] = useState([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);

  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState(false);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPrivateKeyModalOpen, setIsPrivateKeyModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [isPrivateKeyCopied, setIsPrivateKeyCopied] = useState(false);

  const fetchWalletDetails = async () => {
    try {
      const walletAddressResponse = await getLocalDataAsync(STORAGE_KEYS.WALLET_ADDRESS);
      const privateKeyResponse = await getLocalDataAsync(STORAGE_KEYS.PRIVATE_KEY);
      setWalletAddress(walletAddressResponse);
      setWalletPrivateKey(privateKeyResponse);
    } catch (error) {
      console.log(`${ERROR_READING_WALLET_DETAILS} - ${error}`);
    }
  };

  const fetchUserWallets = async () => {
    try {
      setIsLoadingWallets(true);
      const wallets = await getUserWalletAddresses();
      setUserWallets(wallets);
    } catch (error) {
      console.log(`${ERROR_READING_WALLET_DETAILS} - ${error}`);
      showAlertBox(ERROR, ERROR_READING_WALLET_DETAILS, OK);
      setUserWallets([]);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
    fetchUserWallets();
  }, []);

  const handleCopyAddress = () => {
    showToast(SUCCESS, WALLET_ADDRESS_COPIED);
    setIsAddressCopied(true);
    setTimeout(() => setIsAddressCopied(false), 2000);
  };

  const handleCopyPrivateKey = () => {
    showToast(SUCCESS, `${WALLET_PRIVATE_KEY} copied`);
    setIsPrivateKeyCopied(true);
    setTimeout(() => setIsPrivateKeyCopied(false), 2000);
  };

  const handleSetAsPrimary = async () => {
    if (!selectedWallet || selectedWallet.defaultWallet) return;

    setIsSettingPrimary(true);
    try {
      await setWalletAsPrimary(selectedWallet.walletAddress);
      showToast(SUCCESS, 'Primary wallet updated');
      await fetchUserWallets();
      setIsWalletModalOpen(false);
      setSelectedWallet(null);
    } catch (error) {
      console.error('Error setting wallet as primary:', error);
      showAlertBox(ERROR, "Couldn't set as primary wallet", OK);
    } finally {
      setIsSettingPrimary(false);
    }
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await saveLocalDataAsync(STORAGE_KEYS.WALLET_ADDRESS, '');
      await saveLocalDataAsync(STORAGE_KEYS.PRIVATE_KEY, '');
    } catch (error) {
      console.log(`${ERROR_WHEN_LOGGING_OUT} - ${error}`);
    }
    setIsLoggingOut(false);
    setIsLogoutModalOpen(false);
    navigate('/create-wallet');
  };

  return (
    <div className="profile-page">
      {/* Wallet Details Modal */}
      <Modal
        open={isWalletModalOpen}
        onCancel={() => setIsWalletModalOpen(false)}
        footer={null}
        title="Wallet Details"
        centered
      >
        {selectedWallet && (
          <div>
            <div className="profile-modal-address">{selectedWallet.walletAddress}</div>
            <div className="profile-modal-meta">
              Created on {new Date(selectedWallet.createdOn).toLocaleString()}
            </div>
            {selectedWallet.defaultWallet && (
              <div className="profile-modal-tag-row">
                <span className="profile-primary-tag">Primary</span>
              </div>
            )}
            {!selectedWallet.defaultWallet && (
              <div className="profile-modal-action">
                <Button
                  type="primary"
                  disabled={isSettingPrimary}
                  loading={isSettingPrimary}
                  onClick={handleSetAsPrimary}
                  style={{
                    minWidth: '160px',
                    backgroundColor: COLORS.ORANGE_PRIMARY,
                    color: COLORS.WHITE,
                  }}
                >
                  Set as Primary
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal
        open={isQrModalOpen}
        onCancel={() => setIsQrModalOpen(false)}
        footer={null}
        title="Wallet QR Code"
        centered
      >
        <div className="profile-qr-modal">
          <div className="profile-qr-subtitle">Share this QR code to receive coins</div>
          <div className="profile-qr-canvas">
            <QRCodeSVG
              value={JSON.stringify({ wallet_address: walletAddress })}
              size={200}
              level="M"
            />
          </div>
          <CopyToClipboard text={walletAddress} onCopy={handleCopyAddress}>
            <button className="profile-qr-address" type="button">
              <span className="profile-qr-address-text">{walletAddress}</span>
              {isAddressCopied ? <CheckOutlined /> : <CopyOutlined />}
            </button>
          </CopyToClipboard>
        </div>
      </Modal>

      {/* Private Key Modal */}
      <Modal
        open={isPrivateKeyModalOpen}
        onCancel={() => setIsPrivateKeyModalOpen(false)}
        footer={null}
        title="Private Key"
        centered
      >
        <div className="profile-pk-modal">
          <div className="profile-pk-warning">
            Anyone with this key has full access to your wallet. Never share it.
          </div>
          <CopyToClipboard text={walletPrivateKey || ''} onCopy={handleCopyPrivateKey}>
            <button className="profile-pk-value" type="button">
              <span className="profile-pk-value-text">{walletPrivateKey}</span>
              {isPrivateKeyCopied ? <CheckOutlined /> : <CopyOutlined />}
            </button>
          </CopyToClipboard>
        </div>
      </Modal>

      <div className="profile-section">
        <h2 className="profile-title">Profile</h2>

        <div className="profile-group-label">Wallet Keys</div>
        <div className="profile-card">
          <button
            type="button"
            className="profile-btn"
            onClick={() => setIsQrModalOpen(true)}
          >
            <span className="profile-btn-icon neutral">
              <QrcodeOutlined style={{ fontSize: 18, color: '#1C1917' }} />
            </span>
            <span className="profile-btn-text">
              <span className="profile-btn-label">{SHOW_WALLET_ADDRESS}</span>
              <span className="profile-btn-sub">View your public QR code</span>
            </span>
            <RightOutlined className="profile-btn-chevron" />
          </button>

          <button
            type="button"
            className="profile-btn"
            onClick={() => setIsPrivateKeyModalOpen(true)}
          >
            <span className="profile-btn-icon warning">
              <EyeOutlined style={{ fontSize: 18, color: COLORS.ORANGE_PRIMARY }} />
            </span>
            <span className="profile-btn-text">
              <span className="profile-btn-label warning">Show Private Key</span>
              <span className="profile-btn-sub">Keep this secret at all times</span>
            </span>
            <RightOutlined className="profile-btn-chevron" />
          </button>
        </div>

        <div className="profile-group-label">My Wallets</div>
        {isLoadingWallets ? (
          <div className="profile-wallets-loading">
            <Spin
              indicator={<LoadingOutlined style={{ color: COLORS.ORANGE_PRIMARY }} spin />}
            />
          </div>
        ) : userWallets.length === 0 ? (
          <div className="profile-wallets-empty">No wallets found.</div>
        ) : (
          <div className="profile-wallets">
            {userWallets.map((wallet, idx) => (
              <button
                key={wallet.walletAddress + idx}
                type="button"
                className="profile-wallet-card"
                onClick={() => {
                  setSelectedWallet(wallet);
                  setIsWalletModalOpen(true);
                }}
              >
                <span className="profile-wallet-info">
                  <span className="profile-wallet-addr">
                    {formatWalletAddress(wallet.walletAddress)}
                  </span>
                  <span className="profile-wallet-date">
                    Created {new Date(wallet.createdOn).toLocaleDateString()}
                  </span>
                </span>
                {wallet.defaultWallet && (
                  <span className="profile-primary-tag">Primary</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="profile-logout">
          <div className="profile-card">
            <button type="button" className="profile-btn" onClick={handleLogoutClick}>
              <span className="profile-btn-icon danger">
                <LogoutOutlined style={{ fontSize: 18, color: '#EF4444' }} />
              </span>
              <span className="profile-btn-text">
                <span className="profile-btn-label danger">{LOGOUT}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={isLogoutModalOpen}
        onCancel={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        footer={null}
        title="Log out of your wallet?"
        centered
        maskClosable={!isLoggingOut}
        closable={!isLoggingOut}
      >
        <div className="profile-logout-modal">
          <div className="profile-logout-warning">
            <WarningFilled style={{ color: '#EF4444', fontSize: 16, flexShrink: 0 }} />
            <span className="profile-logout-warning-text">
              You'll need your 12-word recovery phrase to log back in. Without it,
              your funds can't be restored.
            </span>
          </div>
          <div className="profile-logout-actions">
            <button
              type="button"
              className="profile-logout-cancel"
              onClick={() => setIsLogoutModalOpen(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </button>
            <button
              type="button"
              className="profile-logout-confirm"
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <LoadingOutlined style={{ fontSize: 14 }} spin />
              ) : (
                <LogoutOutlined style={{ fontSize: 14 }} />
              )}
              <span>{isLoggingOut ? 'Logging out…' : LOGOUT}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Profile;
