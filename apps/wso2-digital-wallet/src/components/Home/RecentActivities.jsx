// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import { useEffect, useState, memo, forwardRef, useImperativeHandle, useRef } from 'react';
import { Spin, Pagination } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import { STORAGE_KEYS } from '../../constants/configs';
import {
  ERROR_READING_WALLET_DETAILS,
  RECENT_ACTIVITIES,
} from '../../constants/strings';
import { getLocalDataAsync } from '../../helpers/storage';
import { useTransactionHistory } from '../../hooks/useTransactionHistory';
import TransactionItem from '../shared/TransactionItem';
import { COLORS } from '../../constants/colors';

const RecentActivities = forwardRef(({ walletAddress: propWalletAddress }, ref) => {
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

  const [page, setPage] = useState(1);
  const {
    transactions,
    loading,
    refresh,
    totalCount,
    totalPages,
    page: currentPage,
    pageSize
  } = useTransactionHistory({
    walletAddress,
    pageSize: 5,
    page
  });

  useEffect(() => {
    setPage(1);
  }, [walletAddress]);

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
          <p className="text-muted">no recent activities</p>
        </div>
      );
    }
  }

  const [showPagination, setShowPagination] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setShowPagination(false);
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollRef.current;
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 10 && totalCount > pageSize) {
        setShowPagination(true);
      } else {
        setShowPagination(false);
      }
    };
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [transactions, totalCount, pageSize]);

  return (
    <div className="recent-activities-widget">
      <div className="recent-activities-widget-inner">
        <div className="mt-1">
          <div className="d-flex justify-content-between">
            <div className="sub-heading">
              <h4>{RECENT_ACTIVITIES}</h4>
            </div>
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
          <>
            <div className="recent-activity-container" ref={scrollRef} style={{ maxHeight: 350, overflowY: 'auto' }}>
              <TransactionList transactions={transactions} />
              {showPagination && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination
                    current={page}
                    pageSize={5}
                    total={totalCount}
                    onChange={setPage}
                    showSizeChanger={false}
                    hideOnSinglePage
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

RecentActivities.displayName = 'RecentActivities';

export default memo(RecentActivities);
