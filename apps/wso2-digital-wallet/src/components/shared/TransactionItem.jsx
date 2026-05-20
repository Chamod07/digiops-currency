// Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import React from 'react';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { WSO2_TOKEN } from '../../constants/strings';
import { formatWalletAddress, copyToClipboard } from '../../utils/transactionUtils';

const TransactionItem = ({ transaction, index }) => {
  const isSend = transaction.direction === "send";
  const addressToCopy = isSend ? transaction.to : transaction.from;

  return (
    <div
      key={index}
      className="transaction-item"
      onClick={() => copyToClipboard(addressToCopy, transaction.direction)}
    >
      <div className={`tx-icon ${isSend ? 'sent' : 'received'}`}>
        {isSend ? (
          <ArrowUpOutlined style={{ fontSize: 18 }} />
        ) : (
          <ArrowDownOutlined style={{ fontSize: 18 }} />
        )}
      </div>

      <div className="d-flex flex-column text-start" style={{ flex: 1, minWidth: 0 }}>
        <span className="recent-activity-topic">
          {isSend ? "Sent" : "Received"}
        </span>
        <span className="recent-activity-address">
          {formatWalletAddress(isSend ? transaction.to : transaction.from)}
        </span>
        <span className="recent-activity-time">
          {transaction.timestamp}
        </span>
      </div>

      <span className={`recent-activity-value ${isSend ? 'red-text' : 'green-text'}`}>
        {isSend ? "-" : "+"}
        {transaction.value}
        <span className="recent-activity-ticker">{WSO2_TOKEN}</span>
      </span>
    </div>
  );
};

export default TransactionItem;
