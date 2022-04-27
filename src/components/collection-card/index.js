import NewButton from "@components/buttons/newbutton";
import Link from "next/link";
import React from "react";
import CollectionInfoCard from "./collection-info-card";
import styles from "./styles.module.scss";

const CollectionCard = ({ collection }) => {
  const collectionNames = [
    "The Interstitials",
    "",
    "Web3 Fashion Originals",
    "The CC0 Arcade",
    "Dezinformatsiya",
    "Self Sovereign Essentials",
    "Hyperutility Packs for Practical Fashion Revolutionairies",
    "Zk Cypherpunk Zeitgeist",
    "Zero's Closet",
    "Edit's Closet",
    "Znarky's Poignant Guide to NFTs",
    "The Navigator Chronicles",
    "My Pocket Empire",
  ];

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.title}>
          {collectionNames[parseInt(collection?.id)]}
        </div>
        <div className={styles.imageWrapper}>
          {collection?.id !== "15" &&
          collection.endTime &&
          parseInt(collection.endTime) < Date.now() / 1000 ? (
            <NewButton
              className={styles.soldOut}
              text="Sold out"
              disable
              backgroundType={1}
            />
          ) : null}
          <Link href={`/marketplace/all/${collection.id}`}>
            <a className={styles.image}>
              {collection?.animation ? (
                <video autoPlay muted loop>
                  <source src={collection?.animation} type="video/mp4" />
                </video>
              ) : (
                <img src={collection?.image} className={styles.innerImage} />
              )}
            </a>
          </Link>
        </div>
        <CollectionInfoCard collection={collection} />
      </div>
    </>
  );
};

export default CollectionCard;