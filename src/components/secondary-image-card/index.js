import React, { useEffect, useState } from "react";
import Link from "next/link";
import InfoCard from "@components/info-card";
import ImageCard from "@components/image-card";
import PriceCard from "@components/price-card";
import { useSelector } from "react-redux";
import { getExchangeRateETH, getMonaPerEth } from "@selectors/global.selectors";
import styles from "./styles.module.scss";
import NewButton from "@components/buttons/newbutton";

const SecondaryImageCard = ({
  product,
  showCollectionName = false,
  showRarity = false,
  isAuction = false,
  sold,
}) => {
  const [offers, setOffers] = useState([]);
  const monaPerEth = useSelector(getMonaPerEth);
  const exchangeRate = useSelector(getExchangeRateETH);

  const getPrice = () => {
    return (
      <>
        {`${product?.price} $MONA`}
        <span>
          {` ($${(parseFloat(monaPerEth) * product?.price).toFixed(2)})
        `}
        </span>
      </>
    );
  };

  const generateUrl = (id) => {
    const items = id.split(":");
    return `/add-secondary-product/${items[1]}:${items[2]}`;
  };

  return (
    <div className={styles.productInfoCardwrapper}>
      <div className={styles.imageWrapper}>
        <ImageCard
          data={product}
          showDesigner
          // offerCount={offers.length}
          showCollectionName={showCollectionName}
          showRarity={showRarity}
          showButton={false}
          isAuction={isAuction}
          imgLink={generateUrl(product?.id)}
          withLink
        />
      </div>
      <div className={styles.infoCardWrapper}>
        <InfoCard bodyClass={styles.noHorizontalPadding}>
          <div className={styles.infoWrapper}>
            <Link href={generateUrl(product?.id)}>
              <a className={styles.link}>
                <NewButton text="MANAGE ITEM" />
                {/* <span>MANAGE ITEM</span> */}
              </a>
            </Link>
            {product?.bestSellOrder ? (
              <PriceCard mainText={getPrice()} subText="LIST PRICE" />
            ) : null}
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default SecondaryImageCard;
