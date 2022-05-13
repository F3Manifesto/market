import React from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Modal from '@components/modal';
import { closePreviewImage } from '@actions/modals.actions';
import { getModalParams } from '@selectors/modal.selectors';
import styles from './styles.module.scss';

const PreviewImage = ({
  className,
}) => {

  const dispatch = useDispatch();

  const { tokenImage, isVideo } = useSelector(getModalParams);

  const handleClose = () => {
    dispatch(closePreviewImage());
  };


  return (
    <>
      {createPortal(
        <Modal
          withCloseIcon={false}
          onClose={handleClose}
          className={styles.modalWrapper}
        >
          <div className={styles.contentWrapper}>
            {isVideo ? 
              <video autoPlay muted loop playsInline className={styles.itemLargeImg} >
                <source src={tokenImage} type="video/mp4" />
              </video>
            : <img
                className={styles.itemLargeImg}
                src={tokenImage}
              />
            }
          </div>
        </Modal>
        ,
        document.body
      )}
    </>
  );
};

PreviewImage.propTypes = {
  className: PropTypes.string,
};

PreviewImage.defaultProps = {
  className: '',
};

export default PreviewImage;
