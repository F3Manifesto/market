import React, { memo, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import styles from "./styles.module.scss";
import cn from "classnames";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const imageArray = [
  "/images/panels/Group 21.png",
  "/images/panels/Group 34.png",
  "/images/panels/Group 46.png",
  "/images/panels/Group 58.png",
  "/images/panels/Group 69.png",
  "/images/panels/Group 80.png",
];

const SlidingPanels = ({ openPreview }) => {
  const onClickZoomOut = (imageFile) => {
    openPreview(imageFile);
  };

  return (
    <div className={styles.wrapper}>
      <Carousel
        showThumbs={false}
        showIndicators={false}
        showStatus={false}
        showArrows={false}
        stopOnHover={false}
        autoPlay={true}
        infiniteLoop={true}
        interval={2000}
      >
        {imageArray.map((item, index) => {
          return (
            <div
              className={styles.panelItem}
              key={index}
              onClick={() => onClickZoomOut(item)}
            >
              <img src={item} />
            </div>
          );
        })}
      </Carousel>
    </div>
  );
};

SlidingPanels.propTypes = {};

SlidingPanels.defaultProps = {};

export default memo(SlidingPanels);
