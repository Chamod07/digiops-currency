// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import './Footer.css';

import React, { useEffect } from 'react';
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
import { waitForBridge } from '../../helpers/bridge';
import { requestDeviceSafeAreaInsets } from '../../microapp-bridge';

const NAV_ITEMS = [
  { path: '/', label: WALLET, Icon: WalletOutlined },
  { path: '/history', label: HISTORY, Icon: HistoryOutlined },
  { path: '/profile', label: PROFILE, Icon: UserOutlined },
];

const MIN_BOTTOM_PADDING_PX = 8;

const FooterBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ready = await waitForBridge();
      if (!ready || cancelled) return;
      requestDeviceSafeAreaInsets((data) => {
        if (cancelled) return;
        const bottom = data?.insets?.bottom;
        if (typeof bottom === 'number') {
          const value = Math.max(MIN_BOTTOM_PADDING_PX, bottom);
          document.documentElement.style.setProperty(
            '--safe-area-bottom',
            `${value}px`
          );
        }
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <nav className="footer-nav" role="navigation" aria-label="Primary">
      {NAV_ITEMS.map(({ path, label, Icon }) => {
        const isActive = location.pathname === path;
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
