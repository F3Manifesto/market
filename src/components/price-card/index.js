import React from "react";
import styles from "./styles.module.scss";

const PriceCard = ({ mode = 0, mainText, subText }) => {
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.mainWrapper}>
        <div className={styles.mainText}>
          <p className={mode == 1 ? styles.smallFont : ""}> {mainText} </p>
        </div>
      </div>
      {subText ? (
        <p
          className={`${styles.subText} ${
            mode === 1 ? styles.blackSubText : ""
          }`}
        >
          {" "}
          {subText}{" "}
        </p>
      ) : null}
    </div>
  );
};

export default PriceCard;
