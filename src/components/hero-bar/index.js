import React from "react";
import classnames from "classnames";
import styles from "./styles.module.scss";
import Filters from "@components/filters";

const HeroBar = ({
  className,
  filter,
  setFilter,
  setSortBy,
  secondFilter,
  secondFilterChange,
}) => {
  const classes = classnames(styles.wrapper, className);
  return (
    <div className={classes}>
      {setFilter || secondFilterChange ? (
        <div className={styles.filter}>
          <Filters
            filter={filter}
            filterChange={setFilter}
            sortByChange={setSortBy}
          />
        </div>
      ) : null}
      {setFilter || secondFilterChange ? (
        <div className={styles.border}>
        </div>
      ) : null}
    </div>
  );
};

export default HeroBar;
