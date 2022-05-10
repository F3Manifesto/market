import moment from "moment";
import Web3 from "web3";
import BaseActions from "@actions/base-actions";
import { toast } from "react-toastify";
import userActions from "@actions/user.actions";
import auctionActions from "@actions/auction.actions";
import auctionPageActions from "@actions/auction.page.actions";
import garmentActions from "@actions/garment.actions";
import garmentPageActions from "@actions/garment.page.actions";
import historyActions from "@actions/history.actions";
import globalReducer from "@reducers/global.reducer";
import { isMetamaskInstalled } from "@services/metamask.service";
import {
  getRewardContractAddressByChainId,
  getMarketplaceContractAddressByChainId,
  getDefaultNetworkChainId,
  getEnabledNetworkByChainId,
  getAPIUrlByChainId,
  getWSUrlByChainId,
} from "@services/network.service";
import {
  getTokenPriceMatic,
  getMarketplaceContract,
} from "@services/contract.service";

import api from "@services/api/api.service";
import ws from "@services/api/ws.service";

import { convertToEth } from "@helpers/price.helpers";
import {
  F3M_MARKET_STORAGE_IS_LOGGED_IN,
  F3M_MARKET_STORAGE_WALLET,
} from "@constants/storage.constants";
import { WALLET_METAMASK, WALLET_ARKANE } from "@constants/global.constants";
import { Web3Ethereum } from "@rarible/web3-ethereum";
import { EthereumWallet } from "@rarible/sdk-wallet";
import { Blockchain } from "@rarible/api-client";
import { createRaribleSdk } from "@rarible/sdk";

class GlobalActions extends BaseActions {
  initApp() {
    return async (dispatch) => {
      /**
       * Get eth/usd rate
       */
      try {
        const rateItem = await api.getEthRate();
        dispatch(this.setValue("exchangeRateETH", rateItem.ethereum.usd));
      } catch (e) {
        toast.error(`Set USD rate error: ${JSON.stringify(e)}`);
      }

      /**
       * Check installed Metamask or 
      Check if Arkane loggedIn
       */
      if (
        (localStorage.getItem(F3M_MARKET_STORAGE_IS_LOGGED_IN) &&
          localStorage.getItem(F3M_MARKET_STORAGE_WALLET) === WALLET_ARKANE) ||
        !isMetamaskInstalled()
      ) {
        dispatch(this.changeNetwork(getDefaultNetworkChainId()));
        await dispatch(this.setContractParams());
        dispatch(this.setValue("isInitialized", true));
        console.log("METAMASK WAS NOT DETECTED ON init");
        console.log("METAMASK WAS NOT DETECTED ON init");
        return;
      }
      const { ethereum } = window;
      window.web3 = new Web3(ethereum);
      /**
       * Init subscribers
       */
      ethereum.on("accountsChanged", (accounts) => {
        const [account] = accounts;
        if (localStorage.getItem(F3M_MARKET_STORAGE_IS_LOGGED_IN)) {
          dispatch(userActions.setValue("account", account || null));
          localStorage.setItem(F3M_MARKET_STORAGE_IS_LOGGED_IN, 1);
        }
      });

      if (
        ethereum.selectedAddress &&
        localStorage.getItem(F3M_MARKET_STORAGE_IS_LOGGED_IN)
      ) {
        dispatch(userActions.setValue("account", ethereum.selectedAddress));
      }

      ethereum.on("chainChanged", async (chainId) => {
        if (!chainId) {
          return;
        }

        dispatch(auctionPageActions.clear());
        dispatch(auctionActions.clear());
        dispatch(historyActions.clear());
        dispatch(garmentActions.clear());
        dispatch(garmentPageActions.clear());

        dispatch(this.resetContratParams());
        dispatch(this.changeNetwork(chainId));

        if (getEnabledNetworkByChainId(chainId)) {
          await dispatch(this.setContractParams());
        } else {
          console.error("Wrong network. Contracts are not deployed yet");
        }
      });

      const web3Ethereum = new Web3Ethereum({ web3: window.web3 });
      const ethWallet = new EthereumWallet(web3Ethereum, Blockchain.POLYGON);
      window.raribleSdk = createRaribleSdk(ethWallet, "prod");

      dispatch(this.changeNetwork(ethereum.chainId));
      await dispatch(this.setContractParams());
      dispatch(this.setValue("isInitialized", true));
    };
  }

  setContractParams() {
    return async (dispatch, getState) => {
      // try {
      //   const monaPerEth = await getTokenPriceMatic();
      //   dispatch(this.setValue('monaPerEth', convertToEth(monaPerEth)));
      // } catch (e) {
      //   console.error(e);
      //   dispatch(this.setValue('monaPerEth', 1));
      // }

      try {
        const { digitalaxAuctionContracts } = await api.getAuctionContracts();

        const [{ minBidIncrement, id, bidWithdrawalLockTime }] =
          digitalaxAuctionContracts;

        dispatch(
          this.setValue("minBidIncrement", convertToEth(minBidIncrement))
        );
        dispatch(this.setValue("auctionContractAddress", id));
        dispatch(this.setValue("bidWithdrawalLockTime", bidWithdrawalLockTime));
      } catch (e) {
        // toast.error(`Set contract params error: ${JSON.stringify(e)}`);
        console.error(e);
      }
    };
  }

  resetContratParams() {
    return async (dispatch) => {
      dispatch(this.setValue("minBidIncrement", 0));
      dispatch(this.setValue("auctionContractAddress", null));
      dispatch(this.setValue("bidWithdrawalLockTime", 0));
    };
  }

  changeNetwork(chainId) {
    return async (dispatch) => {
      const url = getAPIUrlByChainId(chainId);
      const wsUrl = getWSUrlByChainId(chainId);

      api.setUrl(url);
      ws.setUrl(wsUrl);
      dispatch(this.setValue("chainId", chainId));
    };
  }

  setMonaMaticBalance(value) {
    return (dispatch) => {
      dispatch(this.setValue("monaMaticBalance", value));
    };
  }

  setMonaPerEth(value) {
    return (dispatch) => {
      dispatch(this.setValue("monaPerEth", value));
    };
  }

  setMonaEthBalance(value) {
    return (dispatch) => {
      dispatch(this.setValue("monaEthBalance", value));
    };
  }

  setIsLoading(value) {
    return (dispatch) => {
      dispatch(this.setValue("isLoading", value));
    };
  }

  setDtxEthIds(values) {
    return (dispatch) => {
      dispatch(this.setValue("dtxEthIds", values));
    };
  }

  setDtxMaticIds(values) {
    return (dispatch) => {
      dispatch(this.setValue("dtxMaticIds", values));
    };
  }

  setEthNfts(values) {
    return (dispatch) => {
      dispatch(this.setValue("ethNfts", values));
    };
  }

  setMaticNfts(values) {
    return (dispatch) => {
      dispatch(this.setValue("maticNfts", values));
    };
  }

  setAllUsers(values) {
    return (dispatch) => {
      dispatch(this.setValue("allUsers", values));
    };
  }

  setAllDesigners(values) {
    return (dispatch) => {
      dispatch(this.setValue("allDesigners", values));
    };
  }
}

export default new GlobalActions(globalReducer);
