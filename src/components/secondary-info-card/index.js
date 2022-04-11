import React, { useEffect, useState } from "react";
import Link from "next/link";
import InfoCard from "@components/info-card";
import ImageCard from "@components/image-card";
import PriceCard from "@components/price-card";
import NewButton from "@components/buttons/newbutton";
import { useSelector } from "react-redux";
import { getExchangeRateETH, getMonaPerEth } from "@selectors/global.selectors";
import styles from "./styles.module.scss";

const SecondaryInfoCard = ({
  product,
  showCollectionName = false,
  showRarity = false,
}) => {
  const monaPerEth = useSelector(getMonaPerEth);
  const exchangeRate = useSelector(getExchangeRateETH);
  const [bidOrders, setBidOrders] = useState([]);

  if (!product) {
    return <></>;
  }

  const fetchOrderBids = async () => {
    const { orders } = await getOrderBidsByItem(product.id);
    setBidOrders(orders);
  };

  useEffect(() => {
    if (product) {
      fetchOrderBids();
      // if (product.bestSellOrder) {
      //   fetchSellerInfo();
      // }
    }
  }, [product]);

  const getPrice = () => {
    const price = product?.price ?? product?.bidPrice;
    if (price) {
      return (
        <>
          {`${(price / monaPerEth).toFixed(2)} $MONA`}
          <span>
            {` ($${price.toFixed(2)})
            `}
          </span>
        </>
      );
    }
    return (
      <>
        0.00 $MONA
        <span>($0.00)</span>
      </>
    );
  };

  const generateLink = () => {
    return `https://fashion.digitalax.xyz/secondary-product/${
      product?.contract.split(":")[1]
    }:${product?.tokenId}`;
  };

  return (
    <div className={styles.productInfoCardwrapper}>
      <div className={styles.imageWrapper}>
        <ImageCard
          data={nftData}
          showDesigner
          offerCount={bidOrders.length}
          showCollectionName={showCollectionName}
          showRarity={showRarity}
          showButton={false}
          imgLink={generateLink()}
          withLink
        />
      </div>
      <div className={styles.infoCardWrapper}>
        <InfoCard bodyClass={styles.noHorizontalPadding}>
          <div className={styles.infoWrapper}>
            <PriceCard
              mainText={getPrice()}
              subText={product?.price ? "LIST PRICE" : "HIGHEST BID"}
            />
            <div className={styles.linkWrapper}>
              <Link href={generateLink()}>
                <a>
                  <NewButton
                    text={product?.bestSellOrder ? "Buy Now" : "Make Offer"}
                  />
                </a>
              </Link>
            </div>
            {!!user && (
              <div className={styles.sellerInfo}>
                <div className={styles.description}>seller</div>
                <div className={styles.seller}>
                  <Link href={`/user/${product.seller?.wallet}`}>
                    <a target="_blank">
                      <img
                        src={
                          product.seller && product.seller?.avatar
                            ? product.seller?.avatar
                            : "/images/image 450.png"
                        }
                      />
                    </a>
                  </Link>
                  <div className={styles.name}>{product.seller?.username}</div>
                </div>
              </div>
            )}
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default SecondaryInfoCard;
