import React from "react";
import ContentLoader from "react-content-loader";

import styles from "./styles.module.scss";

const ProductPageLoader = (props) => {
  return (
    <div className={styles.wrapper}>
      <ContentLoader
        speed={2}
        width={1920}
        height={2200}
        viewBox="0 0 480 550"
        backgroundColor="black"
        foregroundColor="#E6BF00"
        style={{ width: "100%", height: "100%" }}
        {...props}
      >
        <rect x="35" y="56" rx="12" ry="12" width="147" height="147" />
        <rect x="49" y="36" rx="0" ry="0" width="117" height="14" />
        <rect x="199" y="58" rx="0" ry="0" width="64" height="12" />
        <rect x="199" y="77" rx="0" ry="0" width="133" height="12" />
        <rect x="198" y="96" rx="6" ry="6" width="227" height="93" />
        <rect x="70" y="221" rx="0" ry="0" width="76" height="22" />
        <rect x="35" y="254" rx="0" ry="0" width="147" height="20" />
        <rect x="35" y="280" rx="0" ry="0" width="147" height="20" />
        <rect x="35" y="305" rx="0" ry="0" width="147" height="20" />
        <rect x="198" y="210" rx="0" ry="0" width="227" height="20" />
        <rect x="198" y="245" rx="0" ry="0" width="227" height="20" />
        <rect x="0" y="362" rx="0" ry="0" width="480" height="179" />
      </ContentLoader>
    </div>
  );
};

export default ProductPageLoader;
