import React, { Component } from 'react';
import arrowLeft from './../assets/arrow-left.png';
import loadingGif from './../assets/loading.gif';
import { requestGetFiles, requestGetImages } from '../services/request';
import { mapFileIcon } from '../utils/Message';
import { FilePageSize, ScrollEvent } from '../utils/Constants';
import searchIcon from './../assets/icon-search.png';
import _debounce from 'lodash/debounce';

class ListFile extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      list: [],
      searchText: '',
      isLoadMore: false,
      canLoadMore: true,
      page: 1,
    };
  }

  componentDidMount = () => {
    this.getListFile();
    document.addEventListener(
      ScrollEvent.BOTTOM,
      () => this.handleLoadMore(),
      false
    );
  };

  getListFile = async (searchText = '') => {
    const { screen } = this.props;
    const response =
      screen === 'file' ? await requestGetFiles(searchText, 1) : await requestGetImages(searchText, 1);
    this.setState({
      list: response,
      isLoading: false,
      canLoadMore:
        response.length >=
        (screen === 'file' ? FilePageSize.FILES : FilePageSize.IMAGE),
    });
  }

  handleLoadMore = () => {
    const { isLoadMore, canLoadMore, page, searchText } = this.state;
    if (!isLoadMore && canLoadMore) {
      this.setState({ isLoadMore: true }, async () => {
        const response =
          screen === 'file'
            ? await requestGetFiles(searchText, page + 1)
            : await requestGetImages(searchText, page + 1);
        this.setState({
          isLoadMore: false,
          canLoadMore:
            response.length >=
            (screen === 'file' ? FilePageSize.FILES : FilePageSize.IMAGE),
          page: page + 1,
        });
      });
    }
  };

  renderListFile = () => {
    const { list } = this.state;
    return (
      <div style={{ paddingTop: 5 }} className="menu-tab--listImageWrap">
        {list.map((e) => (
          <div
            onClick={() => {
              window.open(e.file_path, '_blank', 'noreferrer');
            }}
            className="menu-tab--listFileItem"
            key={e.file_path}
          >
            <img
              style={{ marginBottom: -3 }}
              alt="fileIcon"
              src={mapFileIcon(e.file_name)}
              height={20}
              width={20}
            />
            <span>{e.file_name}</span>
          </div>
        ))}
      </div>
    );
  };

  renderListImage = () => {
    const { list } = this.state;
    return (
      <div style={{ paddingTop: 5 }} className="menu-tab--listImageWrap">
        {list.map((e) => (
          <img
            key={e.file_path}
            onClick={() => {
              window.open(e.file_path, '_blank', 'noreferrer');
            }}
            className="menu-tab--image"
            src={e.file_path}
          />
        ))}
      </div>
    );
  };

  renderLoading = () => {
    return (
      <div style={{ paddingTop: 20 }} className="sc-message-loading-list-wrap">
        <img
          className="sc-message-loading-list"
          alt="loading"
          src={loadingGif}
        />
      </div>
    );
  };

  onHandleChangeSearch = (e) => {
    const text = e.target.value;
    this.setState({ isLoading: true, page: 1 });
    this.functionDebounce(text);
    this.setState({ searchText: text });
  };

  functionDebounce = _debounce((e) => {
    this.getListFile(e);
  }, 1000);

  render() {
    const { screen, onClickBack } = this.props;
    const { isLoadMore, isLoading } = this.state;
    const title = screen === 'file' ? 'Files' : 'Ảnh/Video';
    return (
      <div>
        <div className="menu-tab--header">
          <img
            onClick={() => onClickBack()}
            src={arrowLeft}
            className="menu-tab--backIcon"
          />
          <span className="menu-tab--title">{title}</span>
        </div>
        <div className="menu-tab--input-container">
          <img
            style={{ height: 20, width: 20 }}
            alt="search"
            src={searchIcon}
          />
          <input
            className="list-chat-input"
            value={this.state.searchText}
            onChange={this.onHandleChangeSearch}
            placeholder={`Tìm kiếm ${title.toLowerCase()}`}
          />
        </div>
        <div>
          {isLoading
            ? this.renderLoading()
            : screen === 'file'
              ? this.renderListFile()
              : this.renderListImage()}

          {isLoadMore ? this.renderLoading() : <div />}
        </div>
      </div>
    );
  }
}

export default ListFile;
