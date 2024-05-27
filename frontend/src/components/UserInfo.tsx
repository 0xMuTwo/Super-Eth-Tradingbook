"use client";
import React, { useEffect, useRef } from "react";
import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  names,
} from "unique-names-generator";
import useUserInfoStore from "@/stores/useUserInfoStore";
const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
const randomNameConfig: Config = {
  dictionaries: [adjectives, names],
  separator: "-",
  length: 2,
  style: "capital",
};
const UserInfo = () => {
  const {
    ethBalance,
    usdtBalance,
    username,
    updateEthBalance,
    updateUsdtBalance,
    updateUsername,
  } = useUserInfoStore();
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      const newUsername = uniqueNamesGenerator(randomNameConfig);
      const newEthAmount = getRandomInt(1, 19);
      const newDollarAmount = getRandomInt(100, 99999);
      updateUsername(newUsername);
      updateEthBalance(newEthAmount);
      updateUsdtBalance(newDollarAmount);
      initialized.current = true;
    }
  }, [updateEthBalance, updateUsdtBalance, updateUsername]);
  return (
    <div className="flex justify-between px-20 items-center h-full">
      <p className="text-xl">{username}</p>
      <div className="flex space-x-10 font-semibold text-lg">
        <p>{ethBalance} ETH</p>
        <p>${usdtBalance.toLocaleString()}</p>
      </div>
    </div>
  );
};
export default UserInfo;
