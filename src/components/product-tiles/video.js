import { resolveHref } from "next/dist/next-server/lib/router/router";
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
          const canvas = document.createElement("canvas");
          canvas.width = 50;
          canvas.height = 50;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(ref.current, 0, 0, canvas.width, canvas.height);
          const video = ref.current;
          const thumbnail = canvas.toDataURL("image/png");
          console.log({ thumbnail });
          // ctx.canvas.toBlob(
          //   (blob) => {
          //     console.log({ blob });
          //   },
          //   "image/jpeg",
          //   0.75
          // );
          // video.pause();
        }}
      >
        <source src={product.garment.animation} type="video/mp4" />
      </video>
    </LazyLoad>
  );
};

export default Video;
