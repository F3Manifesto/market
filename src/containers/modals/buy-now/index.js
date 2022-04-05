import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector, useDispatch } from "react-redux";
import { BigNumber, utils as ethersUtils } from "ethers";
import {
  getMonaPerEth,
  getChainId,
  getExchangeRateETH,
} from "@selectors/global.selectors";
import PropTypes from "prop-types";
import Button from "@components/buttons/button";
import Modal from "@components/modal";
import {
  closeBuynowModal,
  openESPAReadyModal,
  openPurchaseSuccessModal,
} from "@actions/modals.actions";
import Loader from "@components/loader";
import bidActions from "@actions/bid.actions";
import { getModalParams } from "@selectors/modal.selectors";
import { removeZeros } from "@helpers/price.helpers";
import styles from "./styles.module.scss";
import { getPayableTokenReport } from "@services/api/apiService";
import { tokens } from "@utils/paymentTokens";

const BuyNow = ({ className, title, buttonText1, buttonText2 }) => {
  const dispatch = useDispatch();
  const requests = useRef([]);

  const { id, priceEth, secondary, orderId, tokenAddress, crypto } =
    useSelector(getModalParams);
  const chainId = useSelector(getChainId);
  const isMatic = chainId === "0x13881" || chainId === "0x89";
  const [loading, setLoading] = useState(false);
  const [cryptoPrice, setCryptoPrice] = useState(0);
  const monaPerEth = useSelector(getMonaPerEth);
  const ethPrice = useSelector(getExchangeRateETH);

  const [isDisabled, setIsDisabled] = useState(false);
  const [showError, setShowError] = useState(null);
  const [approved, setApproved] = useState(false);

  const handleClose = () => {
    dispatch(closeBuynowModal());
  };

  const handleSuccess = () => {
    handleClose();
    dispatch(openPurchaseSuccessModal());
    // dispatch(openESPAReadyModal());
  };

  useEffect(() => {
    if (crypto) {
      const fetchCryptoPrice = async () => {
        const { payableTokenReport } = await getPayableTokenReport(
          chainId,
          tokens[crypto].address
        );

        const updatedPrice = payableTokenReport.payload / 1e18;
        setCryptoPrice(
          ((ethPrice * monaPerEth * priceEth) / updatedPrice).toFixed(4)
        );
      };

      fetchCryptoPrice();
    }
  }, [crypto]);

  const handleClick = (mode) => {
    setShowError(null);
    setIsDisabled(true);
    setLoading(true);
    if (!secondary) {
      dispatch(bidActions.buyNow(id, priceEth, mode === 0, crypto)).then(
        (request) => {
          requests.current.push(request);
          request.promise
            .then(() => {
              if (mode === 0 && approved === false) {
                setApproved(true);
                setIsDisabled(false);
                setLoading(false);
              } else {
                handleSuccess();
              }
            })
            .catch((e) => {
              setShowError(e.message);
              setIsDisabled(false);
              setLoading(false);
            });
        }
      );
    } else {
      dispatch(bidActions.secondaryBuyNow(orderId))
        .then(() => {
          handleSuccess();
          setIsDisabled(false);
          setLoading(false);
        })
        .catch((e) => {
          setShowError(e.message);
          setIsDisabled(false);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    async function getMonaApproval() {
      if (!secondary) {
        dispatch(bidActions.getApprovedInToken(crypto)).then((val) => {
          setApproved(val);
        });
      } else {
        dispatch(bidActions.getSecondaryApprovedInToken(crypto)).then((val) => {
          setApproved(val);
        });
      }
    }

    getMonaApproval();

    return () => {
      requests.current.forEach((request) => request.unsubscribe());
      requests.current = [];
    };
  }, []);

  return (
    <>
      {createPortal(
        <Modal
          onClose={() => handleClose()}
          title={title}
          titleStyle={styles.textCenter}
          className={className}
        >
          {loading && <Loader active />}
          <div className={styles.footer}>
            <p className={styles.footerCaption}>
              <span>
                Need to top up $MONA? You can get it from{" "}
                <a href="https://uniswap.org/" target="_blank">
                  Uniswap
                </a>{" "}
                and bridge it to Polygon with our customer{" "}
                <a href="https://skins.digitalax.xyz/bridge/" target="_blank">
                  Multi-Token Bridge
                </a>
                . Or, purchase it directly from{" "}
                <a href="https://quickswap.exchange/" target="_blank">
                  Quickswap
                </a>
                .
              </span>
            </p>
            <div className={styles.selectWrapper}>
              <span>
                {crypto
                  ? cryptoPrice
                  : removeZeros(`${parseFloat(priceEth).toFixed(4)}`)}{" "}
                ${crypto ? crypto : "MONA"}
              </span>
              <Button
                isDisabled={isDisabled || !isMatic}
                onClick={() => handleClick(approved ? 1 : 0)}
                className={styles.button}
              >
                {approved || crypto === "matic" ? `USE $${crypto}` : "APPROVE"}
              </Button>
            </div>
            {showError && <p className={styles.error}>{showError}</p>}
          </div>
        </Modal>,
        document.body
      )}
    </>
  );
};

BuyNow.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  buttonText1: PropTypes.string,
  buttonText2: PropTypes.string,
};

BuyNow.defaultProps = {
  className: "",
  title: "BUY NOW",
  buttonText1: "USE $MONA",
  buttonText2: "USE ETH",
};

export default BuyNow;
