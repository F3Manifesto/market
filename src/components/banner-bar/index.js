import React from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

const BannerBar = ({ className }) => {
  const classes = classnames(styles.wrapper, className);
  return (
    <div className={classes}>
      <div className={styles.node}>
        <a href='/' target='_blank'>
          VIEW ALL CC0 SOURCE MATERIAL
        </a>
      </div>
    </div>
  );
};

export default BannerBar;
