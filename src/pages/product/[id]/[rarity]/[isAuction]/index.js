import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import cn from "classnames";
import Head from "next/head";
import styles from "./styles.module.scss";

import ImageCard from "@components/image-card";
import InfoCard from "@components/info-card";
import Container from "@components/container";
import UserList from "@components/user-list";
import BannerBar from "@components/banner-bar";
import PriceCard from "@components/price-card";
import ProductPageLoader from "@components/product-page-loader";

import {
  getDigitalaxMarketplaceV3Offer,
  getGarmentV2ByCollectionId,
  getDigitalaxNFTStakersByGarments,
  getGuildWhitelistedNFTStakersByGarments,
} from "@services/api/apiService";

import digitalaxApi from "@services/api/espa/api.service";

import {
  getChainId,
  getExchangeRateETH,
  getMonaPerEth,
} from "@selectors/global.selectors";
import { getAccount } from "@selectors/user.selectors";
import { getUser } from "@helpers/user.helpers";
import { reviseUrl } from "@utils/helpers";
import config from "@utils/config";
import {
  openBespokeModal,
  openBidHistoryModal,
  openPurchaseHistoryModal,
  openCurrentWearersModal,
} from "@actions/modals.actions";

import globalActions from "@actions/global.actions";

import secondDesignerData from "src/data/second-designers.json";
import secondModelData from "src/data/second-models.json";

const POLYGON_CHAINID = 0x89;

const getAllResultsFromQuery = async (query, resultKey, chainId, owner) => {
  let lastID = "";
  let isContinue = true;
  const fetchCountPerOnce = 1000;

  const resultArray = [];
  while (isContinue) {
    const result = await query(chainId, owner, fetchCountPerOnce, lastID);
    if (!result[resultKey] || result[resultKey].length <= 0) isContinue = false;
    else {
      resultArray.push(...result[resultKey]);
      if (result[resultKey].length < fetchCountPerOnce) {
        isContinue = false;
      } else {
        lastID = result[resultKey][fetchCountPerOnce - 1]["id"];
      }
    }
  }

  return resultArray;
};

const fetchTokenUri = async (tokenUri) => {
  return fetch(tokenUri)
    .then((res) => res.json())
    .then((res) => {
      return res;
    });
};

const Product = ({ pageTitle }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { id, rarity, isAuction } = router.query;
  const chainId = useSelector(getChainId);
  const [product, setProduct] = useState({});
  const [offer, setOffer] = useState({});
  const [tokenIds, setTokenIds] = useState([]);
  const [days, setDays] = useState("00");
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [secondDesigners, setSecondDesigners] = useState([]);
  const [secondModels, setSecondModels] = useState([]);
  const monaPerEth = useSelector(getMonaPerEth);
  const exchangeRate = useSelector(getExchangeRateETH);
  const [owners, setOwners] = useState([]);
  const [sourceType, setSourceType] = useState([]);
  const [mainImage, setMainImage] = useState("");
  const [mainImageType, setMainImageType] = useState(0);

  const [isFetchedProduct, setIsFetchedProduct] = useState(false);
  const [isFetchedSecondDesigners, setIsFetchedSecondDesigners] =
    useState(false);
  const [isFetchedSecondModels, setIsFetchedSecondModels] = useState(false);

  const sourceTypeDescription = {
    AR: "You can wear and view this fashion in AR",
    "DIGITAL DRESSING": "Get digitally dressed in this fashion",
    "IN-GAME": "You can take this fashion in-game",
    "PHYSICAL COUNTERPART": "This fashion includes the physical counterpart",
    "FBX SOURCE FILE": "type of source file included",
  };

  const account = useSelector(getAccount);
  const user = getUser();
  const secretKey = user ? user.randomString : null;

  const getOwners = async (garments, itemSold, users) => {
    if (!garments) return [];
    const soldGarments = garments
      .slice(0, itemSold)
      .map((garment) => garment.id);
    // get digitalax NFTs on Mainnet
    const digitalaxAllNFTStakersByGarments = await getAllResultsFromQuery(
      getDigitalaxNFTStakersByGarments,
      "digitalaxNFTStakers",
      POLYGON_CHAINID,
      soldGarments
    );

    const guildAllNFTStakersByGarments = await getAllResultsFromQuery(
      getGuildWhitelistedNFTStakersByGarments,
      "guildWhitelistedNFTStakers",
      POLYGON_CHAINID,
      soldGarments.map(
        (item) => config.DTX_ADDRESSES["matic"].toLowerCase() + "-" + item
      )
    );

    const digitalaxStakedGarments = {};
    digitalaxAllNFTStakersByGarments
      .filter((item) => item.garments && item.garments.length > 0)
      .map((staker) => {
        staker.garments.forEach((garment) => {
          digitalaxStakedGarments[garment.id] = staker.id;
        });
      });

    guildAllNFTStakersByGarments
      .filter((item) => item.garments && item.garments.length > 0)
      .map((staker) => {
        staker.garments.forEach((garment) => {
          digitalaxStakedGarments[garment.id.split("-")[1]] = staker.id;
        });
      });

    const owners = garments.slice(0, itemSold).map((garment) => {
      const owner = garment.owner.toLowerCase();
      return digitalaxStakedGarments && digitalaxStakedGarments[garment.id]
        ? digitalaxStakedGarments[garment.id]
        : owner;
    });
    const arranged = owners.filter((item, pos) => {
      return owners.indexOf(item) == pos;
    });
    return arranged.map((garment) => {
      const user =
        users.find(
          (item) => item.wallet && item.wallet.toLowerCase() == garment
        ) || {};
      return {
        ...user,
      };
    });
  };

  useEffect(() => {
    const fetchGarmentV2ByID = async () => {
      const users = await digitalaxApi.getAllUsersName();

      dispatch(globalActions.setAllUsers(users));

      if (!parseInt(isAuction)) {
        const children = [];

        const { digitalaxF3MNFTCollection } = await getGarmentV2ByCollectionId(
          chainId,
          id,
          0
        );
        if (digitalaxF3MNFTCollection.id) {
          const { digitalaxF3MMarketplaceOffers } =
            await getDigitalaxMarketplaceV3Offer(
              chainId,
              digitalaxF3MNFTCollection.id,
              0
            );

          if (digitalaxF3MNFTCollection.garments[0].children.length) {
            digitalaxF3MNFTCollection.garments[0].children.forEach(
              async (child) => {
                const info = await fetchTokenUri(child.tokenUri);
                children.push({
                  ...info,
                  id: child.id.split("-")[1],
                });
              }
            );
          }

          setOwners(
            await getOwners(
              digitalaxF3MMarketplaceOffers[0].garmentCollection?.garments,
              digitalaxF3MMarketplaceOffers[0].amountSold,
              users
            )
          );
          setTokenIds(
            digitalaxF3MMarketplaceOffers[0].garmentCollection?.garments?.map(
              (garment) => garment.id
            )
          );
          setOffer({
            id: digitalaxF3MMarketplaceOffers[0].id,
            primarySalePrice: digitalaxF3MMarketplaceOffers[0].primarySalePrice,
            startTime: digitalaxF3MMarketplaceOffers[0].startTime,
            endTime: digitalaxF3MMarketplaceOffers[0].endTime,
            amountSold: digitalaxF3MMarketplaceOffers[0].amountSold,
            totalAmount:
              digitalaxF3MMarketplaceOffers[0].garmentCollection?.garments
                ?.length,
          });

          setProduct({
            id: digitalaxF3MNFTCollection.id,
            garment: digitalaxF3MNFTCollection.garments[0],
            children,
            additionalSources:
              digitalaxF3MNFTCollection.garments[0]?.additionalSources,
            designer: digitalaxF3MNFTCollection.designer,
          });
        }
      } else {
      }

      setIsFetchedProduct(true);
    };
    // };
    fetchGarmentV2ByID();

    const secondModel = secondModelData.find((item) => {
      return (
        item.id == id && item.rarity == rarity && item.isAuction == isAuction
      );
    });

    if (secondModel && secondModel.model && secondModel.model.length > 0) {
      const secondModelsRes = [];
      secondModel.model.map((modelItem) => {
        fetch(modelItem)
          .then((response) => response.json())
          .then((modelData) => {
            console.log("modelData: ", modelData);
            secondModelsRes.push({
              name: modelData["Model ID"],
              description: modelData["description"],
              image: modelData["image_url"],
            });
            setSecondModels(secondModelsRes);
            setIsFetchedSecondModels(true);
            console.log("secondModelsRes: ", secondModelsRes);
          });
      });
    } else {
      setSecondModels([]);
      setIsFetchedSecondModels(true);
    }

    const secondDesigner = secondDesignerData.find((item) => {
      return (
        item.id == id && item.rarity == rarity && item.isAuction == isAuction
      );
    });

    if (
      secondDesigner &&
      secondDesigner.designer &&
      secondDesigner.designer.length > 0
    ) {
      const secondDesignersRes = [];
      secondDesigner.designer.map((designerItem) => {
        fetch(designerItem)
          .then((response) => response.json())
          .then((designerData) => {
            secondDesignersRes.push({
              name: designerData["Designer ID"],
              description: designerData["description"],
              image: designerData["image_url"],
            });
            setSecondDesigners(secondDesignersRes);
            setIsFetchedSecondDesigners(true);
          });
      });
    } else {
      setSecondDesigners([]);
      setIsFetchedSecondDesigners(true);
    }
  }, []);

  useEffect(() => {
    if (product?.endTime) {
      getTimeFormat();
      setInterval(() => {
        getTimeFormat();
      }, 60000);
    }
    if (product?.garment?.name) {
      const fetchSourceType = async () => {
        const data = await digitalaxApi.getSourceType(product.garment.name);
        if (data?.sourceType) setSourceType(data.sourceType);
      };

      fetchSourceType();
    }
  }, [product]);

  const getPrice = () => {
    if (parseInt(isAuction) !== 1) return offer?.primarySalePrice;
    else
      return product.topBid && parseInt(product.topBid) !== 0
        ? product.topBid
        : product.reservePrice;
  };

  const onHistory = () => {
    if (parseInt(isAuction) === 1) {
      dispatch(
        openBidHistoryModal({
          tokenIds,
        })
      );
    } else {
      dispatch(
        openPurchaseHistoryModal({
          tokenIds,
          v1: id.includes("v1"),
        })
      );
    }
  };

  const onBespokeBtn = () => {
    dispatch(openBespokeModal());
  };

  const getTimeFormat = () => {
    const timeStamp = Date.now();
    if (timeStamp > product.endTime * 1000) {
      return "00:00:00";
    } else {
      const offset = product.endTime * 1000 - timeStamp;
      const days = parseInt(offset / 86400000);
      const hours = parseInt((offset % 86400000) / 3600000);
      const minutes = parseInt((offset % 3600000) / 60000);
      setDays(`00${days}`.slice(-2));
      setHours(`00${hours}`.slice(-2));
      setMinutes(`00${minutes}`.slice(-2));
    }
  };

  const onClickSeeAllWearers = () => {
    dispatch(
      openCurrentWearersModal({
        tokenIds,
        v1: id.includes("v1"),
        type: parseInt(isAuction),
      })
    );
  };

  const getPriceElement = () => {
    return (
      <>
        {(getPrice() / 10 ** 18).toFixed(2)}
        {` MONA `}
        <span>
          ($
          {(
            (getPrice() / 10 ** 18) *
            parseFloat(monaPerEth) *
            exchangeRate
          ).toFixed(2)}
          )
        </span>
      </>
    );
  };

  useEffect(() => {
    setMainImage(
      product?.garment?.animation ||
        product?.animation ||
        product?.garment?.image ||
        product?.image
    );
    if (product?.garment?.animation || product?.animation) setMainImageType(1);
    else if (product?.garment?.image || product?.image) setMainImageType(2);
  }, [product]);

  if (
    !isFetchedProduct ||
    !isFetchedSecondDesigners ||
    !isFetchedSecondModels
  ) {
    return <ProductPageLoader />;
  }

  const getOriginalImage = () => {
    if (product.garment?.animation || product?.animation) {
      return {
        id: product.garment?.id || product?.id,
        type: "animation",
        url: product?.garment?.animation || product?.animation,
      };
    } else if (product.garment?.image || product?.image) {
      return {
        id: product.garment?.id || product?.id,
        type: "image",
        url: product?.garment?.image || product?.image,
      };
    }
  };

  return (
    <>
      <Head></Head>

      <div className={styles.wrapper}>
        <section className={styles.mainSection}>
          <Container>
            <div className={styles.body}>
              <div
                className={cn(
                  styles.mainBody,
                  !sourceType.length ? styles.mainBodySameWidth : ""
                )}
              >
                <div className={styles.productName}>
                  {" "}
                  i Coined Web3 Fashion{" "}
                </div>{" "}
                <div />
                <div className={styles.imageCardWrapper}>
                  <ImageCard
                    data={product}
                    price={(getPrice() / 10 ** 18).toFixed(2)}
                    isAuction={!!parseInt(isAuction)}
                    disable={
                      (parseInt(isAuction) === 1 &&
                        Date.now() > product.endTime * 1000) ||
                      offer?.amountSold >= offer?.totalAmount
                    }
                    mainImageType={mainImageType}
                    mainImage={mainImage}
                    keepRatio={true}
                    showMute={true}
                    showZoom={true}
                    borderType={"none"}
                  />

                  <div className={styles.actionsWrapper}>
                    <div className={styles.buttonWrapper}>
                      <PriceCard
                        bgColor={"#4E4AFF"}
                        mode={0}
                        mainText={getPriceElement()}
                      />
                    </div>
                    <button
                      type="button"
                      className={styles.viewBidHistory}
                      onClick={onHistory}
                    >
                      view {parseInt(isAuction) === 1 ? "bid" : "purchase"}{" "}
                      history
                    </button>
                  </div>

                  {!!sourceType.length && (
                    <div className={styles.rightSection}>
                      {sourceType.map((st) => (
                        <div className={styles.item}>
                          <label className={styles.checkContainer}>
                            <input
                              type="checkbox"
                              className={styles.check}
                              checked
                            />
                            <span className={styles.checkmark} />
                          </label>
                          <div className={styles.label}> {st} </div>
                          <span className={styles.tooltip}>
                            {" "}
                            {sourceTypeDescription[st]}{" "}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!!sourceType.length && (
                    <div className={styles.mobileRightSection}>
                      {sourceType.map((st) => (
                        <div className={styles.item}>
                          <label className={styles.checkContainer}>
                            <input
                              type="checkbox"
                              className={styles.check}
                              checked
                            />
                            <span className={styles.checkmark} />
                          </label>
                          <div className={styles.label}> {st} </div>
                          <span className={styles.tooltip}>
                            {" "}
                            {sourceTypeDescription[st]}{" "}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.infoWrapper}>
              <div className={styles.leftSection}>
                <div className={styles.amount}>
                  {parseInt(isAuction) !== 1 ? (
                    <>1 of 60</>
                  ) : (
                    <>{`${days}:${hours}:${minutes}`}</>
                  )}
                  <div className={styles.helper}>
                    <span className={styles.questionMark}>?</span>
                    <span className={styles.description}>
                      You can also stake this NFT for yield + get the original
                      source file.
                    </span>
                  </div>
                </div>

                <InfoCard
                  borderColor="transparent"
                  boxShadow2=""
                  mainColor="transparent"
                >
                  <div className={styles.infoCard}>
                    <div className={styles.skinName}>
                      <div className={styles.text}> D.O.E. COMMON </div>
                    </div>
                    <div className={styles.description}>
                      If the coined fashion is not good enough then did it even
                      exist. If the coined fashion is not good enough then did
                      it even exist. If the coined fashion is not good enough
                      then did it even exist. If the coined fashion is not good
                      enough then did it even exist.
                      <br />
                      <br />
                      If the coined fashion is not good enough then did it even
                      exist. If the coined fashion is not good enough then did
                      it even exist. If the coined fashion is not good enough
                      then did it even exist. If the coined fashion is not good
                      enough then did it even exist.
                    </div>
                  </div>
                </InfoCard>

                {!!product?.additionalSources?.length && (
                  <div className={styles.additionalImages}>
                    {[getOriginalImage(), ...product?.additionalSources].map(
                      (item) => {
                        if (item.type === "image") {
                          return (
                            <img
                              src={reviseUrl(item.url)}
                              key={item.id}
                              onClick={() => {
                                setMainImage(item.url);
                                setMainImageType(2);
                              }}
                            />
                          );
                        } else if (item.type === "animation") {
                          return (
                            <video
                              muted
                              autoPlay
                              loop
                              key={item.id}
                              onClick={() => {
                                setMainImage(item.url);
                                setMainImageType(1);
                              }}
                            >
                              <source src={reviseUrl(item.url)} />
                            </video>
                          );
                        }
                      }
                    )}
                  </div>
                )}
                {!!product?.children?.length && (
                  <>
                    <div className={styles.childrenDescription}>
                      <a
                        href="https://designers.digitalax.xyz/fractional/"
                        target="_blank"
                      >
                        Fractional Garment Ownership
                      </a>
                    </div>
                    <div className={styles.childrenWrapper}>
                      {product.children.map((child) => {
                        return (
                          <a
                            href={`https://opensea.io/assets/matic/0x567c7b3364ba2903a80ecbad6c54ba8c0e1a069e/${child.id}`}
                            target="_blank"
                          >
                            {child.image_url ? (
                              <img src={reviseUrl(child.image_url)} />
                            ) : child.animation_url ? (
                              <video muted autoPlay loop>
                                <source src={reviseUrl(child.animation_url)} />
                              </video>
                            ) : null}
                          </a>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </Container>
        </section>
        <BannerBar className={styles.homeHeroBar} type={2} />
        {product?.model ? (
          <>
            <section className={styles.designerSection}>
              <div className={styles.leftBar} />
              <Container>
                <div className={styles.designerBody}>
                  <div className={styles.data}>
                    <a
                      href={`https://models.digitalax.xyz/models/${product?.model?.name}`}
                      target="_blank"
                    >
                      <ImageCard
                        showButton={false}
                        imgUrl={product?.model?.image}
                        borderType="black"
                      />
                    </a>
                    <div className={styles.infoWrapper}>
                      {owners.length ? (
                        <div className={styles.wearersLabel}>
                          current wearer/S
                        </div>
                      ) : (
                        <></>
                      )}
                      {owners.length ? (
                        <UserList
                          className={styles.userList}
                          userLimit={7}
                          users={owners}
                          onClickSeeAll={onClickSeeAllWearers}
                        />
                      ) : (
                        <></>
                      )}
                      <InfoCard boxShadow2="" mainColor="#4E4AFF">
                        <a
                          href={`https://models.digitalax.xyz/models/${product?.model?.name}`}
                          target="_blank"
                        >
                          <div className={styles.name}>
                            {" "}
                            {product?.model?.name}{" "}
                          </div>
                        </a>
                        <div className={styles.description}>
                          {product?.model?.description}
                        </div>
                      </InfoCard>
                    </div>
                  </div>
                </div>
              </Container>
            </section>

            {secondModels &&
              secondModels.length > 0 &&
              secondModels.map((item) => {
                return (
                  <section
                    className={[styles.designerSection, styles.margin50].join(
                      " "
                    )}
                    key={item.name}
                  >
                    <div className={styles.leftBar} />
                    <Container>
                      <div className={styles.designerBody}>
                        <div className={styles.data}>
                          <a
                            href={`https://models.digitalax.xyz/models/${item.name}`}
                            target="_blank"
                          >
                            <ImageCard
                              showButton={false}
                              imgUrl={item.image}
                              borderType="black"
                            />
                          </a>
                          <div className={styles.infoWrapper}>
                            <InfoCard boxShadow2="" mainColor="#4E4AFF">
                              <a
                                href={`https://models.digitalax.xyz/models/${item.name}`}
                                target="_blank"
                              >
                                <div className={styles.name}> {item.name} </div>
                              </a>
                              <div className={styles.description}>
                                {item.description}
                              </div>
                            </InfoCard>
                          </div>
                        </div>
                      </div>
                    </Container>
                  </section>
                );
              })}
          </>
        ) : null}
        {product?.designer ? (
          <>
            <section className={styles.designerSection}>
              <Container>
                <div className={styles.designerBody}>
                  <div className={styles.data}>
                    <a
                      href={`https://designers.digitalax.xyz/designers/${product?.designer?.name}`}
                      target="_blank"
                    >
                      <ImageCard
                        showButton={false}
                        imgUrl={product?.designer?.image}
                        borderType="black"
                      />
                    </a>
                    <div className={styles.infoWrapper}>
                      {owners.length ? (
                        <div className={styles.wearersLabel}>
                          current wearer/S
                        </div>
                      ) : (
                        <></>
                      )}
                      {owners.length ? (
                        <UserList
                          className={styles.userList}
                          userLimit={7}
                          users={owners}
                          onClickSeeAll={onClickSeeAllWearers}
                        />
                      ) : (
                        <></>
                      )}
                      <InfoCard boxShadow2="" mainColor="#4E4AFF">
                        <a
                          href={`https://designers.digitalax.xyz/designers/${product?.designer?.name}`}
                          target="_blank"
                        >
                          <div className={styles.name}>
                            {" "}
                            {product?.designer?.name}{" "}
                          </div>
                        </a>
                        <div className={styles.description}>
                          {product?.designer?.description}
                        </div>
                      </InfoCard>
                      <a
                        href="https://designers.digitalax.xyz/getdressed"
                        target="_blank"
                      >
                        <button
                          type="button"
                          className={styles.getDressedButton}
                        >
                          GET BESPOKE DRESSED BY THIS DESIGNER!
                        </button>
                      </a>
                    </div>
                  </div>
                </div>
              </Container>
            </section>

            {secondDesigners &&
              secondDesigners.length > 0 &&
              secondDesigners.map((item) => {
                return (
                  <section
                    className={[styles.designerSection, styles.margin50].join(
                      " "
                    )}
                    key={item.name}
                  >
                    <Container>
                      <div className={styles.designerBody}>
                        <div className={styles.data}>
                          <a
                            href={`https://designers.digitalax.xyz/designers/${item.name}`}
                            target="_blank"
                          >
                            <ImageCard
                              showButton={false}
                              imgUrl={item.image}
                              borderType="black"
                            />
                          </a>
                          <div className={styles.infoWrapper}>
                            {owners.length ? (
                              <div className={styles.wearersLabel}>
                                current wearer/S
                              </div>
                            ) : (
                              <></>
                            )}
                            {owners.length ? (
                              <UserList
                                className={styles.userList}
                                users={owners}
                                userLimit={7}
                                onClickSeeAll={onClickSeeAllWearers}
                              />
                            ) : (
                              <></>
                            )}
                            <InfoCard boxShadow2="" mainColor="#4E4AFF">
                              <a
                                href={`https://designers.digitalax.xyz/designers/${item.name}`}
                                target="_blank"
                              >
                                <div className={styles.name}> {item.name} </div>
                              </a>
                              <div className={styles.description}>
                                {item.description}
                              </div>
                            </InfoCard>
                            <a
                              href="https://designers.digitalax.xyz/getdressed"
                              target="_blank"
                            >
                              <button
                                type="button"
                                className={styles.getDressedButton}
                              >
                                GET BESPOKE DRESSED BY THIS DESIGNER!
                              </button>
                            </a>
                          </div>
                        </div>
                      </div>
                    </Container>
                  </section>
                );
              })}
          </>
        ) : null}
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  return {
    props: {
      pageTitle: "Hello",
    }, // will be passed to the page component as props
  };
}

export default Product;
