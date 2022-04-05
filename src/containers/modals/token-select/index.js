import Modal from "@components/modal";
import React, { useState } from "react";
import cn from "classnames";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "@components/buttons/button";
import styles from "./styles.module.scss";
import { closeTokenSelect, openBuynowModal } from "@actions/modals.actions";
import { requestSwitchNetwork } from "@services/network.service";
import { getModalParams } from "@selectors/modal.selectors";

const TokenSelectModal = () => {
  const dispatch = useDispatch();
  const [crypto, setCrypto] = useState("mona");
  const { next, params } = useSelector(getModalParams);

  const handleClose = () => {
    dispatch(closeTokenSelect());
  };

  const handleClick = async () => {
    dispatch(closeTokenSelect());
    dispatch(
      next({
        ...params,
        crypto,
      })
    );
  };

  return (
    <>
      {createPortal(
        <Modal
          onClose={() => handleClose()}
          title={"PAYMENT TOKEN"}
          className={styles.modalContent}
        >
          <div className={styles.footer}>
            <p>Choose A Token To Swap For Fashion.</p>
            <div className={styles.tokenWrapper}>
              <div
                onClick={() => setCrypto("insta")}
                className={cn(
                  styles.token,
                  crypto === "insta" && styles.active
                )}
              >
                <img src="/images/crypto/instadapp.png" />
                <span> INSTA </span>
              </div>
              <div
                onClick={() => setCrypto("dai")}
                className={cn(styles.token, crypto === "dai" && styles.active)}
              >
                <img src="/images/crypto/dai.png" />
                <span> DAI </span>
              </div>
              <div
                onClick={() => setCrypto("pickle")}
                className={cn(
                  styles.token,
                  crypto === "pickle" && styles.active
                )}
              >
                <img src="/images/crypto/pickle.png" />
                <span> PICKLE </span>
              </div>
              <div
                onClick={() => setCrypto("weth")}
                className={cn(styles.token, crypto === "weth" && styles.active)}
              >
                <img src="/images/crypto/weth.png" />
                <span> WETH </span>
              </div>
              <div
                onClick={() => setCrypto("mona")}
                className={cn(styles.token, crypto === "mona" && styles.active)}
              >
                <img src="/images/crypto/mona.png" />
                <span> MONA </span>
              </div>
              <div
                onClick={() => setCrypto("aave")}
                className={cn(styles.token, crypto === "aave" && styles.active)}
              >
                <img src="/images/crypto/aave.png" />
                <span> AAVE </span>
              </div>
              {/* <div
                onClick={() => setCrypto('matic')}
                className={cn(styles.token, crypto === 'matic' && styles.active)}
              >
                <img src="/images/crypto/matic.png" />
                <span> MATIC </span>
              </div> */}
            </div>
            <div className={styles.button}>
              <Button
                background="pink"
                onClick={() => handleClick()}
                className={styles.button}
              >
                SELECT
              </Button>
            </div>
          </div>
        </Modal>,
        document.body
      )}
    </>
  );
};

export default TokenSelectModal;
