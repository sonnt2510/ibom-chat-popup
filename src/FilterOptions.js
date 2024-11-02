import React, { Component } from 'react';
import './styles';
import './styles/base.css';
import {
  requestGetListFilterOptions,
  requestGetListFilterResult,
} from './services/request';
import iconDown from './assets/icon-down.png';
import loadingGif from './assets/loading.gif';
import closeIcon from './assets/close-icon.png';
import arrowLeftIcon from './assets/arrow-left.png';
import Popup from 'reactjs-popup';

class FilterOptions extends Component {
  constructor() {
    super();
    this.state = {
      filterOption: [],
      isLoading: true,
      isShowOptions: false,
      isShowInput: false,
      inputLabel: '',
      optionLabel: '',
      selectedOptionLabel: '',
      selectedOptionId: '',
      searchValue: '',
      isValidToSearch: false,
      submitFormUrl: '',
      showFilterList: false,
      filterResultList: [],
      totalItem: 0,
      page: 1,
      isLoadingMore: false,
    };
  }

  async componentDidMount() {
    const response = await requestGetListFilterOptions();
    const { filterOption, filterInput, submitFormUrl } = response;
    this.setState({
      isLoading: false,
      isShowOptions: filterOption.isShow,
      isShowInput: filterInput.isShow,
      inputLabel: filterInput.label,
      optionLabel: filterOption.label,
      filterOption: filterOption.options,
      isValidToSearch: !filterOption.isShow,
      submitFormUrl,
      showFilterList: false,
      filterResultList: [],
    });
  }

  closeFilter = () => {
    if (this.state.showFilterList) {
      this.setState({ showFilterList: false });
    } else {
      this.props.onCloseFilter();
    }
  };

  selectOption = (e) => {
    this.popup.closePopup();
    this.setState({
      selectedOptionId: e.id,
      selectedOptionLabel: e.text,
      isValidToSearch: true,
    });
  };

  showOptions = () => {
    const { filterOption, optionLabel, selectedOptionLabel } = this.state;
    return (
      <div>
        <p className="filter-option-label">
          {optionLabel} <span style={{ color: 'red' }}>*</span>
        </p>
        <Popup
          className="filter-option-popup"
          ref={(e) => {
            this.popup = e;
          }}
          trigger={
            <div className="filter-option-select-input">
              <span className="filter-option-select-item">{selectedOptionLabel ? selectedOptionLabel : 'Chọn'}</span>
              <img
                className="filter-option-select-input-icon"
                alt="chevron"
                src={iconDown}
              />
            </div>
          }
        >
          {filterOption.map((e, i) => (
            <div
              onClick={() => this.selectOption(e)}
              className="filter-option-item"
              key={i}
            >
              <span className="filter-option-item-text">{e.text}</span>
            </div>
          ))}
        </Popup>
      </div>
    );
  };

  onHandleKeyDown = (e) => {
    if (e.key === 'Enter') {
      this.submitFilter();
    }
  };

  showInput = () => {
    const { inputLabel } = this.state;
    return (
      <div className="filter-input-container">
        <p className="filter-option-label">{inputLabel}</p>
        <input
          className="filter-input"
          onKeyDown={this.onHandleKeyDown}
          value={this.state.searchValue}
          onChange={this.onHandleChangeSearch}
        />
      </div>
    );
  };

  onHandleChangeSearch = (e) => {
    const text = e.target.value;
    this.setState({ searchValue: text });
  };

  submitFilter = async () => {
    this.setState({ isLoading: true });
    const { searchValue, selectedOptionId, submitFormUrl, page } = this.state;
    const response = await requestGetListFilterResult(
      searchValue,
      selectedOptionId,
      submitFormUrl,
      page
    );
    this.setState({
      isLoading: false,
      showFilterList: true,
      filterResultList: response.items,
      totalItem: response.totalItem,
    });
  };

  onLoadMore = () => {
    this.setState(
      { isLoadingMore: true, page: this.state.page + 1 },
      async () => {
        const {
          searchValue,
          selectedOptionId,
          submitFormUrl,
          page,
          filterResultList,
        } = this.state;
        const response = await requestGetListFilterResult(
          searchValue,
          selectedOptionId,
          submitFormUrl,
          page
        );
        this.setState({
          isLoadingMore: false,
          filterResultList: [...filterResultList, ...response.items],
        });
      }
    );
  };

  renderLoadMoreSection = () => {
    const { filterResultList, totalItem, isLoadingMore } = this.state;
    const currentLength = filterResultList.length;
    if (currentLength == totalItem) return null;
    if (isLoadingMore)
      return (
        <div
          style={{ paddingTop: 30, paddingBottom: 50 }}
          className="sc-message-loading-list-wrap"
        >
          <img
            className="sc-message-loading-list"
            alt="loading"
            src={loadingGif}
          />
        </div>
      );
    return (
      <div
        onClick={() => this.onLoadMore()}
        className="filter-list-button-load-more"
      >
        Tải thêm
      </div>
    );
  };

  render() {
    const {
      isLoading,
      isShowOptions,
      isShowInput,
      isValidToSearch,
      showFilterList,
      filterResultList,
      totalItem,
    } = this.state;
    return (
      <div className="list-chat-container">
        <div className="filter-screen-header">
          <span className="filter-screen-title">
            {showFilterList ? 'Công việc' : 'Tìm kiếm đối tượng'}
          </span>
          <div
            onClick={() => this.closeFilter()}
            className="filter-screen-back"
          >
            <img
              className="filter-screen-back-icon"
              alt="back"
              src={showFilterList ? arrowLeftIcon : closeIcon}
            />
          </div>
        </div>
        {showFilterList ? (
          <div className="filter-screen-sub-header">
            <span style={{ marginLeft: 15 }}>Danh sách đối tượng</span>
            <span style={{ marginRight: 15 }}>
              {filterResultList.length}/{totalItem}
            </span>
          </div>
        ) : null}
        {isLoading ? (
          <div
            style={{ paddingTop: 100 }}
            className="sc-message-loading-list-wrap"
          >
            <img
              className="sc-message-loading-list"
              alt="loading"
              src={loadingGif}
            />
          </div>
        ) : (
          <div style={{ margin: 0 }}>
            <div
              style={{ display: showFilterList ? 'none' : 'block' }}
              className="filter-screen-body"
            >
              <div>{isShowOptions ? this.showOptions() : null}</div>
              <div>{isShowInput ? this.showInput() : null}</div>
              <div
                onClick={() => this.submitFilter()}
                style={{
                  marginTop: 50,
                  backgroundColor: isValidToSearch ? '#4f72c2' : '#cecece',
                }}
                className="filter-option-button"
              >
                Tìm kiếm
              </div>
              <div
                onClick={() => this.closeFilter()}
                className="filter-option-button"
              >
                Huỷ
              </div>
            </div>
            <div
              style={{ display: showFilterList ? 'block' : 'none' }}
              className="filter-list-body"
            >
              {filterResultList.length ? (
                filterResultList.map((e, i) => (
                  <div
                    onClick={() => {
                      this.props.onCloseFilter();
                      window.parent.postMessage(e, '*');
                    }}
                    className="filter-list-item"
                    dangerouslySetInnerHTML={{
                      __html: e.info,
                    }}
                    key={i}
                  />
                ))
              ) : (
                <div
                  style={{ paddingTop: 100 }}
                  className="sc-message-loading-list-wrap"
                >
                  <p>Không có dữ liệu</p>
                </div>
              )}
              {this.renderLoadMoreSection()}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default FilterOptions;
