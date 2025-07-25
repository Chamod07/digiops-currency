// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import './Home.css';

import {
  useEffect,
  useState,
  useRef,
} from 'react';

import {
  Button,
  message,
  Spin,
} from 'antd';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';

import { LoadingOutlined } from '@ant-design/icons';

import RecentActivities from '../../components/Home/RecentActivities';
import { COLORS } from '../../constants/colors';
import {
  DEFAULT_WALLET_ADDRESS,
  STORAGE_KEYS,
} from '../../constants/configs';
import {
  ERROR,
  ERROR_RETRIEVE_WALLET_ADDRESS,
  ERROR_BRIDGE_NOT_READY,
  SEND_TOKENS,
  SUCCESS,
  TOTAL_BALANCE,
  WALLET_ADDRESS_COPIED,
  OK
} from '../../constants/strings';
import { showToast, showAlertBox } from '../../helpers/alerts';
import { getLocalDataAsync } from '../../helpers/storage';
import { waitForBridge } from '../../helpers/bridge';
import { useWalletBalance } from '../../services/query-hooks';

function Home() {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState(DEFAULT_WALLET_ADDRESS);
  const recentActivitiesRef = useRef();

  const [messageApi, contextHolder] = message.useMessage();

  const fetchWalletAddress = async () => {
    try {
      const isBridgeReady = await waitForBridge();
      if (!isBridgeReady) {
        console.error(ERROR_BRIDGE_NOT_READY);
        showAlertBox(ERROR, ERROR_BRIDGE_NOT_READY, OK);
        return;
      }

      const walletAddressResponse = await getLocalDataAsync(
        STORAGE_KEYS.WALLET_ADDRESS
      );
      if (walletAddressResponse !== walletAddress) {
        setWalletAddress(walletAddressResponse);
      }
    } catch (error) {
      console.log(`${ERROR_RETRIEVE_WALLET_ADDRESS} - ${error}`);
      messageApi.error(ERROR_RETRIEVE_WALLET_ADDRESS);
    }
  };

  const [isAccountCopied, setIsAccountCopied] = useState(false);
  const { data: tokenBalance, isLoading: isTokenBalanceLoading, refetch } = useWalletBalance(walletAddress);

  useEffect(() => {
    fetchWalletAddress();
  }, []);

  useEffect(() => {
    if (walletAddress && 
        walletAddress !== DEFAULT_WALLET_ADDRESS && 
        walletAddress !== "0x" && 
        walletAddress.length === 42) {
      refetch();
    }
  }, [walletAddress, refetch]);

  const handleCopyAccount = async () => {
    showToast(SUCCESS, WALLET_ADDRESS_COPIED);
    setIsAccountCopied(true);
    setTimeout(() => {
      setIsAccountCopied(false);
    }, 2000);
  };

  const handleSend = () => {
    navigate("/send");
  };

  useEffect(() => {
    if (!walletAddress || walletAddress?.length === 0) {
      navigate("/create-wallet");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const refreshAllData = async () => {
    await refetch();
    recentActivitiesRef.current?.refreshTransactions();
  };

  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', minHeight: '100vh' }}>
      {contextHolder}
      <div className="wallet-balance-details mt-4" style={{ flex: 'none' }}>
        <span className="total-balance-tag">{TOTAL_BALANCE}</span>
        <span className="total-balance-value">
          {isTokenBalanceLoading ? (
            <Spin
              indicator={<LoadingOutlined style={{ color: COLORS.ORANGE_PRIMARY }} />}
              style={{ margin: "10px " }}
            />
          ) : (
            typeof tokenBalance === 'undefined' ? (
              <span style={{ color: 'red', fontSize: 16 }}>
                Error loading balance. <Button size="small" onClick={refetch}>Retry</Button>
              </span>
            ) : (
              <NumericFormat
                value={tokenBalance}
                displayType={"text"}
                thousandSeparator={true}
                decimalScale={9}
                fixedDecimalScale={false}
              />
            )
          )}
        </span>
        <div className="send-button pt-3">
          <Button className="primary-button container" onClick={handleSend}>{SEND_TOKENS}</Button>
        </div>
      </div>
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
        <RecentActivities ref={recentActivitiesRef} walletAddress={walletAddress} />
      </div>
    </div>
  );
}

export default Home;
