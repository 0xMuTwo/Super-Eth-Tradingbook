import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UserInfoState {
  username: string;
  ethBalance: number;
  usdtBalance: number;
  updateUsername: (name: string) => void;
  updateEthBalance: (ethBalance: number) => void;
  updateUsdtBalance: (usdtBalance: number) => void;
}

const useUserInfoStore = create<UserInfoState>()(
  devtools((set) => ({
    ethBalance: 0,
    usdtBalance: 0,
    username: "",
    updateUsername: (name: string) =>
      set((state) => ({ ...state, username: name })),
    updateEthBalance: (ethBalance: number) =>
      set((state) => ({ ...state, ethBalance: ethBalance })),
    updateUsdtBalance: (usdtBalance: number) =>
      set((state) => ({ ...state, usdtBalance: usdtBalance })),
  }))
);

export default useUserInfoStore;
