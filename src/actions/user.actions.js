import {
  closeConnectMetamaskModal,
  closeSignupModal,
  openNotInstalledMetamask,
  openSignupModal,
} from "@actions/modals.actions";
import globalActions from "@actions/global.actions";
import {
  F3M_MARKET_STORAGE_IS_LOGGED_IN,
  F3M_MARKET_STORAGE_USER,
  F3M_MARKET_STORAGE_TOKEN,
  F3M_MARKET_STORAGE_WALLET,
} from "@constants/storage.constants";
import { WALLET_METAMASK, WALLET_ARKANE } from "@constants/global.constants";
import userReducer from "@reducers/user.reducer";
import {
  handleSignMessage,
  isMetamaskInstalled,
} from "@services/metamask.service";
import { setWeb3Provider } from "@services/web3-provider.service";
import { getUser, getAuthToken } from "@helpers/user.helpers";
import BaseActions from "./base-actions";
import api from "@services/api/espa/api.service";
import { toast } from "react-toastify";
import Router from "next/router";

class UserActions extends BaseActions {
  handleArkaneWeb3Load() {
    return async (dispatch) => {
      try {
        const chainId = await window.web3.eth.getChainId();
        const authResult = await Arkane.checkAuthenticated();
        const {
          auth: {
            idTokenParsed: { email },
          },
        } = authResult;
        const wallets = await window.web3.eth.getAccounts();
        localStorage.setItem(F3M_MARKET_STORAGE_IS_LOGGED_IN, 1);
        dispatch(this.setValue("account", wallets[0]));
        dispatch(closeConnectMetamaskModal());
        dispatch(openSignupModal({ email }));
        dispatch(globalActions.changeNetwork("0x" + chainId.toString(16)));
        dispatch(globalActions.setContractParams());
      } catch (e) {
        toast.error("Wallet Connect is failed");
      }
    };
  }

  tryToLogin(source) {
    return async (dispatch) => {
      localStorage.setItem(F3M_MARKET_STORAGE_WALLET, source);
      await setWeb3Provider();
      if (source === WALLET_METAMASK) {
        if (!isMetamaskInstalled()) {
          dispatch(openNotInstalledMetamask());
          console.log("METAMASK WAS NOT DETECTED ON TRY TO LOGIN");
          console.log("METAMASK WAS NOT DETECTED ON TRY TO LOGIN");
          return;
        }

        const { ethereum } = window;

        try {
          const [account] = await ethereum.request({
            method: "eth_requestAccounts",
          });

          if (!account) {
            console.error("Account is epmty.");
            return;
          }

          localStorage.setItem(F3M_MARKET_STORAGE_IS_LOGGED_IN, 1);
          dispatch(this.setValue("account", account));
          dispatch(closeConnectMetamaskModal());
          dispatch(openSignupModal());
          dispatch(globalActions.initApp());
        } catch (e) {
          console.error(e.message);
        }
      } else if (source === WALLET_ARKANE) {
        dispatch(this.handleArkaneWeb3Load());
      }
    };
  }

  tryToSignup(account, userName, email, signMsg, ip) {
    return async (dispatch) => {
      dispatch(this.setValue("isLoading", true));
      if (!signMsg) {
        signMsg = await api.handleSignUp(account, userName, email, ip);
        if (!signMsg) {
          toast.error("Sign Up is failed");
          dispatch(this.setValue("isLoading", false));
          return;
        }
      }

      const { signature } = await handleSignMessage({
        publicAddress: account,
        signMsg,
      });

      dispatch(this.tryAuthentication(account, signMsg, signature));
    };
  }

  tryAuthentication(account, signMsg, signature) {
    return async (dispatch) => {
      try {
        const data = await api.handleAuthentication(
          account,
          signMsg,
          signature
        );
        if (data) {
          const { returnData, secret } = data;
          dispatch(this.setValue("user", returnData));
          localStorage.setItem(F3M_MARKET_STORAGE_IS_LOGGED_IN, 1);
          localStorage.setItem(
            F3M_MARKET_STORAGE_USER,
            JSON.stringify(returnData)
          );
          localStorage.setItem(F3M_MARKET_STORAGE_TOKEN, secret);
        } else {
          dispatch(this.logout());
        }
      } catch (e) {
        console.error(e.message);
        dispatch(this.logout());
      }

      dispatch(closeSignupModal());
      dispatch(this.setValue("isLoading", false));
    };
  }

  logout() {
    return async (dispatch) => {
      const WALLET = localStorage.getItem(F3M_MARKET_STORAGE_WALLET);
      if (WALLET === WALLET_ARKANE) {
        try {
          Arkane.arkaneConnect().logout();
        } catch (err) {}
      }
      dispatch(this.setValue("user", null));
      localStorage.removeItem(F3M_MARKET_STORAGE_IS_LOGGED_IN);
      localStorage.removeItem(F3M_MARKET_STORAGE_USER);
      localStorage.removeItem(F3M_MARKET_STORAGE_TOKEN);
      localStorage.removeItem(F3M_MARKET_STORAGE_WALLET);
      Router.push("/");
    };
  }

  updateProfile(user) {
    return async (dispatch) => {
      try {
        const data = await api.updateProfile(user);
        dispatch(globalActions.setIsLoading(false));
        if (data) {
          dispatch(this.setValue("user", data));
          localStorage.setItem(F3M_MARKET_STORAGE_USER, JSON.stringify(data));
          toast.success("Your profile updated successfully.");
        } else {
        }
      } catch (e) {}
      // dispatch(this.setValue('isLoading', false));
    };
  }

  checkStorageAuth() {
    return async (dispatch) => {
      const user = getUser();
      const token = getAuthToken();
      if (!user || !token) {
        return;
      }
      dispatch(this.setValue("user", user));
    };
  }

  uploadAvatar(file) {
    return async (dispatch) => {
      try {
        dispatch(this.setValue("isLoading", true));
        let url = await api.getPresignedUrl();
        if (url) {
          const result = await api.uploadImageToS3(url, file);
          if (result) {
            const user = getUser();
            const queryIndex = url.indexOf("?");
            if (queryIndex >= 0) {
              url = url.slice(0, queryIndex);
            }
            user.avatar = url;
            dispatch(this.updateProfile(user));
          }
        }
      } catch (e) {}
      dispatch(this.setValue("isLoading", false));
    };
  }
}

export default new UserActions(userReducer);
