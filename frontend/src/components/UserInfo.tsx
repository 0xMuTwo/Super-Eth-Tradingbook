"use client";
import React, { useState, useEffect } from "react";
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
  const { updateEthBalance, updateUsdtBalance, updateUsername } =
    useUserInfoStore();
  const [username, setUsername] = useState("");
  const [ethAmount, setEthAmount] = useState(0);
  const [dollarAmount, setDollarAmount] = useState(0);
  useEffect(() => {
    const newUsername = uniqueNamesGenerator(randomNameConfig);
    const newEthAmount = getRandomInt(1, 19);
    const newDollarAmount = getRandomInt(100, 99999);
    setUsername(newUsername);
    setEthAmount(newEthAmount);
    setDollarAmount(newDollarAmount);
    updateEthBalance(newEthAmount);
    updateUsdtBalance(newDollarAmount);
    updateUsername(newUsername);
  }, [updateEthBalance, updateUsdtBalance, updateUsername]);

  return (
    <div className="flex justify-between px-20 items-center h-full">
      <p className="text-xl">{username}</p>
      <div className="flex space-x-10 font-semibold text-lg">
        <p>{ethAmount} ETH</p>
        <p>${dollarAmount.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default UserInfo;
