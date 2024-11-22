import React, { Component } from 'react';
import closeIcon from './../assets/close-icon.png';
import detailIcon from './../assets/icon-detail.png';
import menuIcon from './../assets/menu-icon.png';

class Header extends Component {
  onClickDetail = () => {
    window.open(this.props.url, '_blank');
    this.props.onClose;
  };
  render() {
    const {teamName, onOpenMenu, isDetail, onClose, isOpenMenu} = this.props;
    return (
      <div className="sc-header">
        <div className="sc-header--team-name">{teamName}</div>
        <div className="sc-header--close-button" onClick={onOpenMenu}>
          <img
            className={`sc-header--menuImage ${isOpenMenu ? 'active' : 'inactive'}`}
            src={menuIcon}
            alt="menu"
          />
        </div>
        {isDetail == 1 ? null : (
          <div
            className="sc-header--close-button"
            onClick={() => this.onClickDetail()}
          >
            <img
              className="sc-header--image"
              src={detailIcon}
              alt="detail"
            />
          </div>
        )}
        <div className="sc-header--close-button" onClick={onClose}>
          <img style={{height: 18, width: 18}} className="sc-header--image" src={closeIcon} alt="close" />
        </div>
      </div>
    );
  }
}

export default Header;
