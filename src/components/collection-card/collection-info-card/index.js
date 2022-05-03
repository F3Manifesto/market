import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";

import InfoCard from "@components/info-card";
import PriceCard from "@components/price-card";

import { getExchangeRateETH, getMonaPerEth } from "@selectors/global.selectors";

import styles from "./styles.module.scss";

const CollectionInfoCard = ({ collection }) => {
  const monaPerEth = useSelector(getMonaPerEth);
  const exchangeRate = useSelector(getExchangeRateETH);

  const getPrice = () => {
    return (
      <>
        {(collection.sold / parseFloat(monaPerEth)).toFixed(2)} $MONA
        <span>
          {` `}(${collection.sold.toFixed(2)})
        </span>
      </>
    );
  };

  return (
    <div className={styles.wrapper}>
      <InfoCard>
        <div className={styles.cardBodyWrapper}>
          <div className={styles.pricesWrapper}>
            <PriceCard mode={0} mainText={getPrice()} subText="total sold" />
          </div>
          <Link href={`/marketplace/all/${collection.id}`}>
            <a className={styles.link}>
              <span>SEE ALL</span>
            </a>
          </Link>
        </div>
      </InfoCard>
    </div>
  );
};

export default CollectionInfoCard;
