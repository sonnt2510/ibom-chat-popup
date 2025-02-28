import React, { Component } from "react";
import closeIcon from "./../assets/close-icon.png";
import detailIcon from "./../assets/icon-detail.png";
import menuIcon from "./../assets/menu-icon.png";
import searchIcon from "./../assets/search_icon.png";
import arrow from "./../assets/down-arrow.png";
import _debounce from "lodash/debounce";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenSearch: false,
      searchValue: "",
    };
  }

  onClickDetail = () => {
    window.open(this.props.url, "_blank");
    this.props.onClose;
  };

  onHandleChangeSearch = (e) => {
    const text = e.target.value;
    this.setState({ loading: true, page: 1 });
    this.functionDebounce(text);
    this.setState({ searchValue: text });
  };

  functionDebounce = _debounce((e) => {
    this.props.getSearchComment(e);
  }, 1000);

  renderSearchSection = () => {
    const { isOpenSearch } = this.state;
    if (!isOpenSearch) return <div />;
    const isDisableUp = true;
    const isDisableDown = true;
    return (
      <div className="sc-header--search-container">
        <div className="sc-header--search-wrap">
          <img src={searchIcon} className="sc-header--search-icon" />
          <input
            onChange={this.onHandleChangeSearch}
            value={this.state.searchValue}
            className="sc-header--search-input"
            placeholder="Tìm kiếm tin nhắn"
          />
          <div className="sc-header--option-wrap">
            <span className="sc-header--option-number">0/0</span>
            <img
              style={{
                opacity: isDisableUp ? 0.2 : 1,
                cursor: isDisableUp ? "self" : "pointer",
              }}
              className="sc-header--option-arrow-up"
              src={arrow}
            />
            <img
              style={{
                opacity: isDisableDown ? 0.2 : 1,
                cursor: isDisableDown ? "self" : "pointer",
                transform: `rotate(180deg)`,
              }}
              className="sc-header--option-arrow-up"
              src={arrow}
            />
            <span
              onClick={() => {
                this.props.getSearchComment("");
                this.setState({ isOpenSearch: false });
              }}
              className="sc-header--option-cancel-button"
            >
              Cancel
            </span>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { isOpenSearch } = this.state;
    const { teamName, onOpenMenu, isDetail, onClose, isOpenMenu } = this.props;
    return (
      <div>
        <div className="sc-header">
          <div className="sc-header--team-name">{teamName}</div>
          <div
            className="sc-header--close-button"
            onClick={() => {
              this.setState({ isOpenSearch: !isOpenSearch });
            }}
          >
            <img
              className={`sc-header--menuImage`}
              src={searchIcon}
              alt="search"
            />
          </div>
          <div className="sc-header--close-button" onClick={onOpenMenu}>
            <img
              className={`sc-header--menuImage ${
                isOpenMenu ? "active" : "inactive"
              }`}
              src={menuIcon}
              alt="menu"
            />
          </div>
          {isDetail == 1 ? null : (
            <div
              className="sc-header--close-button"
              onClick={() => this.onClickDetail()}
            >
              <img className="sc-header--image" src={detailIcon} alt="detail" />
            </div>
          )}
          <div className="sc-header--close-button" onClick={onClose}>
            <img
              style={{ height: 18, width: 18 }}
              className="sc-header--image"
              src={closeIcon}
              alt="close"
            />
          </div>
        </div>
        {this.renderSearchSection()}
      </div>
    );
  }
}

export default Header;
