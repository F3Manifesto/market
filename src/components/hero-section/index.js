import HeroBar from '@components/hero-bar';
import React from 'react';
import styles from './styles.module.scss';

const HeroSection = ({
  children,
  logo,
  width = '80%',
  filter,
  setFilter,
  setSortBy,
  title,
  subTitle,
  secondFilter = null,
  secondFilterChange = null,
  showHeroBar = true,
  isHorizon = false,
}) => {

  return (
    <>
      <div className={styles.wrapper}>
        <section className={styles.heroSection}>
          {logo && <img src={logo} className={styles.logo} style={{ width: width }} />}
          {!logo && (
            <div className={isHorizon ? styles.titleHorizonWrapper : styles.titleWrapper}>
              <h1>
                {
                  title
                }
                {
                  !title &&
                    <>F<sub>3</sub>Manifesto</>
                }
              </h1>
              <h2>{subTitle}</h2>
            </div>
          )}
          {children}
        </section>
        {showHeroBar && (
          <HeroBar
            secondFilter={secondFilter}
            secondFilterChange={secondFilterChange}
            filter={filter}
            setFilter={setFilter}
            setSortBy={setSortBy}
          />
        )}
      </div>
    </>
  );
};

export default HeroSection;
