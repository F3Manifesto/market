import React, { useState } from "react";
import LazyLoad from "react-lazyload";
import axios from "axios";
import NewButton from "../../buttons/newbutton";
import styles from "./styles.module.scss";

import {
  DIGITAL_CHANGING_ROOM,
  DIGIFIZZY_BUNDLES,
  DRIP_IDL,
  GENESIS_MONA_NFT,
  LOOK_FASHION_LOOT,
  PODE,
  GDN_MEMBERSHIP_NFT,
  DIGITALAX_F3M_NFT,
} from "@constants/nft_categories";

const FashionItem = (props) => {
  const {
    className,
    animation,
    image,
    tokenURI,
    onClickViewFashion,
    category,
  } = props;
  const [imageUrl, setImageUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);

  if (
    (!image || image == "") &&
    (!animation || animation == "") &&
    tokenURI &&
    tokenURI != ""
  ) {
    axios.get(tokenURI).then((tokenData) => {
      const { data } = tokenData;
      setImageUrl(data.image_url);

      var tester = new Image();
      tester.onerror = () => setIsVideo(true);
      tester.src = data.image_url;
    });
  }
  return (
    <div className={[styles.wrapper, className].join(" ")}>
      {animation && animation != "" ? (
        // <LazyLoad
        //   style={{
        //     width: "100%",
        //     height: "100%",
        //     marginBottom: "1rem",
        //   }}
        // >
        <video autoPlay muted loop playsInline className={styles.videoItem}>
          <source src={animation} type="video/mp4" />
        </video>
      ) : // </LazyLoad>
      image && image != "" ? (
        <LazyLoad
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <img src={image} className={styles.photoItem} />
        </LazyLoad>
      ) : (
        <div></div>
      )}
      {imageUrl &&
        (isVideo ? (
          <video autoPlay muted loop playsInline className={styles.videoItem}>
            <source src={imageUrl} type="video/mp4" />
          </video>
        ) : (
          <img src={imageUrl} className={styles.photoItem} />
        ))}
      {(category == DIGITAL_CHANGING_ROOM ||
        category == DRIP_IDL ||
        category === DIGITALAX_F3M_NFT) && (
        <NewButton
          className={[styles.viewFashion].join(" ")}
          onClick={onClickViewFashion}
          text="VIEW FASHION"
        >
          {/* <div>VIEW FASHION</div> */}
        </NewButton>
      )}
    </div>
  );
};

export default FashionItem;
