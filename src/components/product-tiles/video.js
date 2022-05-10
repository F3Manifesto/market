import React, { useRef } from "react";
import LazyLoad from "react-lazyload";
import styles from "./ProductTiles.module.scss";

const Video = ({ product }) => {
  const ref = useRef();
  return (
    <LazyLoad className={styles.lazyVideo} key={product.id}>
      <video
        ref={ref}
        autoPlay
        loop
        muted
        preload={"auto"}
        // controls={document.body.clientWidth <= 576}
        className={styles.tileVideo}
        // key={product.id}
        playsInline
        onLoadedData={() => {
          const video = ref.current;
          video.pause();
        }}
      >
        <source src={product.garment.animation} type="video/mp4" />
      </video>
    </LazyLoad>
  );
};

export default Video;
