// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import './Footer.css';

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  HistoryOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';

import {
  HISTORY,
  PROFILE,
  WALLET,
} from '../../constants/strings';

const WALLET_FLOW_PATHS = new Set([
  '/',
  '/send',
  '/receive',
  '/confirm-assets-send',
]);

const NAV_ITEMS = [
  {
    path: '/',
    label: WALLET,
    Icon: WalletOutlined,
    isActive: (pathname) => WALLET_FLOW_PATHS.has(pathname),
  },
  {
    path: '/history',
    label: HISTORY,
    Icon: HistoryOutlined,
    isActive: (pathname) => pathname === '/history',
  },
  {
    path: '/profile',
    label: PROFILE,
    Icon: UserOutlined,
    isActive: (pathname) => pathname === '/profile',
  },
];

const FooterBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="footer-nav" role="navigation" aria-label="Primary">
      {NAV_ITEMS.map(({ path, label, Icon, isActive: matchActive }) => {
        const isActive = matchActive(location.pathname);
        return (
          <button
            key={path}
            type="button"
            className={`footer-nav-item ${isActive ? 'is-active' : ''}`}
            onClick={() => navigate(path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="footer-nav-icon">
              <Icon style={{ fontSize: 22 }} />
            </span>
            <span className="footer-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default FooterBar;
