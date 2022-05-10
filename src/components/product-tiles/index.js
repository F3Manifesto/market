import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import LazyLoad from "react-lazyload";
import { getRarityId } from "@utils/helpers";
import styles from "./ProductTiles.module.scss";
import Video from "./video";

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      const { innerWidth: width, innerHeight: height } = window;

      setWindowDimensions({
        width,
        height,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

const ProductTiles = ({ products }) => {
  const screenWidth = useWindowDimensions().width;
  const isMobile = screenWidth <= 707;
  const refArray = useRef(new Array());
  const [shuffledArray, setShuffledArray] = useState([]);
  const placeholderImg = "/product-img-placeholder.svg";

  useEffect(() => {
    const shuffled = shuffleArray(products || []);
    setShuffledArray(shuffled);
    // if (refArray.current) {
    //   console.log({ refArray });
    //   refArray.current.map((item) => {
    //     item?.load();
    //     item?.addEventListener("load", () => {
    //       console.log("this is before pause");
    //       item?.pause();
    //     });
    //   });
    // }
  }, []);

  useEffect(() => {
    // if (refArray.current) {
    //   refArray.current.map((item) => {
    //     item?.load();
    //     item?.addEventListener("load", () => {
    //       console.log("this is before pausing");
    //       item?.pause();
    //     });
    //   });
    // }
  }, [screenWidth]);

  return (
    <div className={styles.wrapper}>
      {shuffledArray.slice(0, isMobile ? 60 : 80).map((product, index) => {
        return (
          // <Link key={index} href={`product${product?.path}`}>
          <a
            key={index}
            href={`/product/${product?.id}/${getRarityId(product?.rarity)}/${
              product?.auction ? 1 : 0
            }`}
            className={styles.tileWrapper}
          >
            {product?.garment && (
              <div className={styles.mediaWrapper}>
                {product?.garment?.image ? (
                  <Image
                    alt={product.name || "Product Image"}
                    className={styles.tileImage}
                    src={product.garment.image || placeholderImg}
                    layout="fill"
                    unsized
                  />
                ) : (
                  <Video product={product} />
                )}
              </div>
            )}
          </a>
          // </Link>
        );
      })}
    </div>
  );
};

export default ProductTiles;
