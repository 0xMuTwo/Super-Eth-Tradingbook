import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  names,
} from "unique-names-generator";

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
  const rawUsername = uniqueNamesGenerator(randomNameConfig);
  const username = rawUsername;
  const ethAmount = getRandomInt(1, 19);
  const dollarAmount = getRandomInt(100, 99999);
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
