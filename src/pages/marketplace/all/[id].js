import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./index.module.scss";
import PixelLoader from "@components/pixel-loader";
import Container from "@components/container";
import {
  getCollectionGroupById,
  getDigitalaxMarketplaceV2Offers,
} from "@services/api/apiService";
import { useSelector } from "react-redux";
import { getChainId } from "@selectors/global.selectors";
import HeroSection from "@components/hero-section";
import ProductInfoCard from "@components/product-info-card";
import { filterProducts } from "@utils/helpers";

const Auctions = () => {
  const route = useRouter();
  const chainId = useSelector(getChainId);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const { id } = route.query;

  useEffect(() => {
    const fetchCollectionGroup = async () => {
      setLoading(true);
      let colls = [];
      const { digitalaxModelCollectionGroup } = await getCollectionGroupById(
        chainId,
        id
      );

      const { digitalaxModelMarketplaceOffers } =
        await getDigitalaxMarketplaceV2Offers(chainId);
      if (
        !(
          digitalaxModelCollectionGroup.collections.length === 1 &&
          digitalaxModelCollectionGroup.collections[0].id === "0"
        )
      ) {
        digitalaxModelCollectionGroup.collections.forEach((collection) => {
          const foundOfferItem = digitalaxModelMarketplaceOffers.find(
            (offer) => offer.id === collection.id
          );
          if (!foundOfferItem) return;
          colls.push({
            designer: collection.designer,
            model: collection.model,
            developer: collection.developer,
            auction: false,
            startTime: foundOfferItem.startTime,
            sold:
              collection.garments.length ===
              parseInt(foundOfferItem.amountSold),
            garment: {
              ...collection.garments[0],
            },
            primarySalePrice: foundOfferItem
              ? foundOfferItem.primarySalePrice
              : 0,
            id: collection.id,
            rarity: collection.rarity,
          });
        });
      }

      setCollections(colls);
      setLoading(false);
    };

    fetchCollectionGroup();
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loadingWrapper}>
          <PixelLoader title={"loading..."} />
        </div>
      </div>
    );
  }

  const filteredProducts =
    filterProducts([...collections], filter, sortBy) || [];

  return (
    <div className={styles.wrapper}>
      <HeroSection
        filter={filter}
        setFilter={(v) => setFilter(v)}
        setSortBy={(v) => setSortBy(v)}
      />

      <section className={styles.productsSection}>
        <Container>
          <div className={styles.body}>
            {filteredProducts
              .sort((a, b) => {
                if (a.sold && !b.sold) return 1;
                if (!a.sold && b.sold) return -1;
                return 0;
              })
              .sort((a, b) => {
                if (parseInt(a.startTime) > parseInt(b.startTime)) return -1;
                if (parseInt(a.startTime) < parseInt(b.startTime)) return 1;
                return 0;
              })
              .map((prod, index) => {
                return (
                  <ProductInfoCard
                    key={prod.id}
                    isLook={id === "15"}
                    product={filteredProducts[index]}
                    price={
                      filteredProducts[index].auction
                        ? filteredProducts[index].topBid
                        : filteredProducts[index].primarySalePrice
                    }
                    showRarity
                    showCollectionName
                    sold={prod.sold}
                    isAuction={prod.auction}
                  />
                );
              })}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Auctions;
