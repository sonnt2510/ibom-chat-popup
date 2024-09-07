import React, { Component } from 'react';
import closeIcon from './../assets/close-icon.png';
import detailIcon from './../assets/icon-detail.png';

class Header extends Component {
  onClickDetail = () => {
    window.open(this.props.url, '_blank');
    this.props.onClose;
  };
  render() {
    return (
      <div className="sc-header">
        <div className="sc-header--team-name">{this.props.teamName}</div>
        {this.props.isDetail == 1 ? null : (
          <div className="sc-header--close-button" onClick={() => this.onClickDetail()}>
            <img className="sc-header--image" style={{ padding: 8 }} src={detailIcon} alt="" />
          </div>
        )}
        <div className="sc-header--close-button" onClick={this.props.onClose}>
          <img className="sc-header--image" src={closeIcon} alt="" />
        </div>
      </div>
    );
  }
}

export default Header;
