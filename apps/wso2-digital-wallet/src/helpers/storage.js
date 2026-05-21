// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
//
// This software is the property of WSO2 LLC. and its suppliers, if any.
// Dissemination of any information or reproduction of any material contained
// herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
// You may not alter or remove any copyright or other notice from copies of this content.

import { saveLocalData, getLocalData } from "../microapp-bridge";

// Single-flight: `resolveGetLocalData` / `resolveSaveLocalData` are single
// host-overwritten slots on `window.nativebridge`. Concurrent callers would
// clobber each other, so we serialize requests through a FIFO queue.

const getQueue = [];
let getInFlight = false;

const drainGetQueue = () => {
  if (getQueue.length === 0) {
    getInFlight = false;
    return;
  }
  getInFlight = true;
  const { key, resolve, reject } = getQueue.shift();
  try {
    getLocalData(
      key,
      (data) => {
        resolve(data);
        drainGetQueue();
      },
      (err) => {
        reject(err);
        drainGetQueue();
      }
    );
  } catch (e) {
    reject(e);
    drainGetQueue();
  }
};

export function getLocalDataAsync(key) {
  return new Promise((resolve, reject) => {
    getQueue.push({ key, resolve, reject });
    if (!getInFlight) drainGetQueue();
  });
}

const saveQueue = [];
let saveInFlight = false;

const drainSaveQueue = () => {
  if (saveQueue.length === 0) {
    saveInFlight = false;
    return;
  }
  saveInFlight = true;
  const { key, value, resolve, reject } = saveQueue.shift();
  try {
    saveLocalData(
      key,
      value,
      () => {
        resolve();
        drainSaveQueue();
      },
      (err) => {
        reject(err);
        drainSaveQueue();
      }
    );
  } catch (e) {
    reject(e);
    drainSaveQueue();
  }
}

export function saveLocalDataAsync(key, value) {
  return new Promise((resolve, reject) => {
    saveQueue.push({ key, value, resolve, reject });
    if (!saveInFlight) drainSaveQueue();
  });
}
