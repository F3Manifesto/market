import { useState, useEffect } from "react";
import Image from "next/image";
import LazyLoad from "react-lazyload";
import { getRarityId } from "@utils/helpers";
import styles from "./ProductTiles.module.scss";

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
  const [isMobile, setIsMobile] = useState(false);
  const [shuffledArray, setShuffledArray] = useState([]);
  // let shuffledArray = []
  const placeholderImg = "/product-img-placeholder.svg";

  useEffect(() => {
    const shuffled = shuffleArray(products || []);
    setShuffledArray(shuffled);
  }, []);

  useEffect(() => {
    screenWidth > 707 ? setIsMobile(false) : setIsMobile(true);
  }, [screenWidth]);

  // console.log("products: ", products);
  // console.log("isMobile: ", isMobile);

  console.log(shuffledArray);

  // const width =

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
                    width={
                      document.body.clientWidth > 576
                        ? document.body.clientWidth / 20
                        : document.body.clientWidth / 10
                    }
                    height={
                      document.body.clientWidth > 576
                        ? document.body.clientWidth / 20
                        : document.body.clientWidth / 10
                    }
                  />
                ) : (
                  <LazyLoad className={styles.lazyVideo}>
                    <video muted className={styles.tileVideo}>
                      <source src={product.garment.animation} />
                    </video>
                  </LazyLoad>
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
