// Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Spin, Pagination } from 'antd';
import { LoadingOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { COLORS } from '../../constants/colors';

import { useTransactionHistory } from '../../hooks/useTransactionHistory';
import TransactionItem from '../shared/TransactionItem';

import { useQueryClient } from '@tanstack/react-query';

function TransactionHistory({ walletAddress }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const searchInputRef = useRef(null);

  const queryClient = useQueryClient();
  const allData = queryClient.getQueryData(['transactions', walletAddress]);
  const allTransactions = allData?.transactions || [];

  const {
    transactions,
    loading,
    error,
    refetch,
    totalCount,
  } = useTransactionHistory({ walletAddress, pageSize: 15, filter, page });

  useEffect(() => {
    setPage(1);
  }, [filter, searchTerm, walletAddress]);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(transaction => {
      const currentWallet = walletAddress?.toLowerCase();
      const fromAddress = transaction.from.toLowerCase();
      const toAddress = transaction.to.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      let otherPartyAddress = '';
      if (fromAddress === currentWallet) {
        otherPartyAddress = toAddress;
      } else if (toAddress === currentWallet) {
        otherPartyAddress = fromAddress;
      } else {
        return fromAddress.includes(searchLower) || toAddress.includes(searchLower);
      }
      return otherPartyAddress.includes(searchLower);
    });
  }, [transactions, searchTerm, walletAddress]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  }, []);

  const sentCount = allTransactions.filter(tx => tx.direction === 'send').length;
  const receivedCount = allTransactions.filter(tx => tx.direction === 'receive').length;
  const allCount = allTransactions.length;

  const filters = [
    { key: 'all', label: 'All', count: allCount },
    { key: 'sent', label: 'Sent', count: sentCount },
    { key: 'received', label: 'Received', count: receivedCount },
  ];

  function TransactionList({ transactions }) {
    if (error) {
      return (
        <div className="history-empty">
          <p className="history-empty-text history-empty-text-danger">Error loading transactions.</p>
          <button className="history-empty-action" onClick={() => refetch()}>Retry</button>
        </div>
      );
    }
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
          {searchTerm && (
            <div className="history-filtered-note">
              Showing {filteredTransactions.length} of {transactions.length} filtered transactions
            </div>
          )}
        </>
      );
    }
    return (
      <div className="history-empty">
        <p className="history-empty-text">
          {searchTerm ? 'No transactions match your search' : 'No transaction history found'}
        </p>
        {searchTerm && (
          <button className="history-empty-action" onClick={() => setSearchTerm('')}>Clear Search</button>
        )}
      </div>
    );
  }

  return (
    <div className="transaction-history-widget">
      <div className="transaction-history-widget-inner">
        <div className="history-header">
          <h4 className="history-title">Transaction History</h4>

          <div className="history-filter-pills">
            {filters.map(({ key, label, count }) => {
              const isActive = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  className={`history-pill ${isActive ? 'is-active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  <span>{label}</span>
                  <span className="history-pill-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="history-search-box">
            <SearchOutlined className="history-search-icon" />
            <input
              ref={searchInputRef}
              className="history-search-input"
              placeholder="Search by wallet address..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <button
                type="button"
                className="history-search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <CloseOutlined />
              </button>
            )}
          </div>
        </div>

        {loading && transactions.length === 0 ? (
          <div className="history-loading">
            <Spin
              indicator={<LoadingOutlined style={{ color: COLORS.ORANGE_PRIMARY, fontSize: 24 }} spin />}
            />
            <div className="history-loading-text">Loading transaction history...</div>
          </div>
        ) : (
          <>
            <div className="transaction-history-container">
              <TransactionList transactions={filteredTransactions} />
            </div>
            <div className="history-pagination-wrap">
              <Pagination
                current={page}
                pageSize={15}
                total={totalCount}
                onChange={setPage}
                showSizeChanger={false}
                hideOnSinglePage
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TransactionHistory;
