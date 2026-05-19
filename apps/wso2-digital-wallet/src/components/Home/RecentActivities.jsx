// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import { useEffect, useState, memo, forwardRef, useImperativeHandle } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { STORAGE_KEYS } from '../../constants/configs';
import {
  RECENT_ACTIVITIES,
  VIEW_ALL,
} from '../../constants/strings';
import { getLocalDataAsync } from '../../helpers/storage';
import { useTransactionHistory } from '../../hooks/useTransactionHistory';
import TransactionItem from '../shared/TransactionItem';
import { COLORS } from '../../constants/colors';

const RECENT_PREVIEW_SIZE = 5;

const RecentActivities = forwardRef(({ walletAddress: propWalletAddress }, ref) => {
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState(propWalletAddress || "");

  useEffect(() => {
    if (propWalletAddress) {
      setWalletAddress(propWalletAddress);
    } else {
      const fetchWalletAddress = async () => {
        try {
          const address = await getLocalDataAsync(STORAGE_KEYS.WALLET_ADDRESS);
          setWalletAddress(address || "");
        } catch (error) {
          console.error('RecentActivities: Error fetching wallet address:', error);
        }
      };
      fetchWalletAddress();
    }
  }, [propWalletAddress]);

  const {
    transactions,
    loading,
    refresh,
    totalCount,
  } = useTransactionHistory({
    walletAddress,
    pageSize: RECENT_PREVIEW_SIZE,
    page: 1
  });

  useImperativeHandle(ref, () => ({
    refreshTransactions: () => {
      refresh();
    }
  }), [refresh]);

  useEffect(() => {
    if (walletAddress && walletAddress !== "") {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  function TransactionList({ transactions }) {
    if (transactions.length > 0) {
      return (
        <>
          {transactions.map((transaction, index) => (
            <TransactionItem
              key={`${transaction.txHash}-${index}`}
              transaction={transaction}
              index={index}
            />
          ))}
        </>
      );
    } else {
      return (
        <div className="mt-5">
          <p className="text-muted">No recent activities.</p>
        </div>
      );
    }
  }

  return (
    <div className="recent-activities-widget">
      <div className="recent-activities-widget-inner">
        <div className="mt-1">
          <div className="d-flex justify-content-between align-items-center">
            <div className="sub-heading">
              <h4>{RECENT_ACTIVITIES}</h4>
            </div>
            {totalCount > RECENT_PREVIEW_SIZE && (
              <span
                className="recent-activities-view-all"
                role="button"
                tabIndex={0}
                onClick={() => navigate('/history')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/history');
                  }
                }}
                style={{
                  color: COLORS.ORANGE_PRIMARY,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {VIEW_ALL}
                <RightOutlined style={{ fontSize: 12 }} />
              </span>
            )}
          </div>
        </div>

        {loading && transactions.length === 0 ? (
          <div className="mt-5">
            <Spin
              indicator={<LoadingOutlined style={{ color: COLORS.ORANGE_PRIMARY }} />}
              style={{ margin: "10px " }}
            />
          </div>
        ) : (
          <div className="recent-activity-container">
            <TransactionList transactions={transactions} />
          </div>
        )}
      </div>
    </div>
  );
});

RecentActivities.displayName = 'RecentActivities';

export default memo(RecentActivities);
