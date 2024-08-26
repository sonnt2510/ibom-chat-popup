import React, { Component } from 'react';
import './styles';
import './styles/base.css';
import {
  requestGetListGroupChat,
  requestSendIsReadComment,
  requestGetListFilterOptions,
} from './services/request';
import { ChatHubHelper } from './services/signalR';
import searchIcon from './assets/icon-search.png';
import loadingGif from './assets/loading.gif';
import filterIcon from './assets/filter.png';
import _debounce from 'lodash/debounce';
import Popup from 'reactjs-popup';
import FilterOptions from './FilterOptions';

class ListChat extends Component {
  constructor() {
    super();
    this.state = {
      messageList: [],
      isOpen: true,
      loading: true,
      roomName: '',
      isLoadMore: false,
      defaultMessageList: [],
      searchValue: '',
      displayFilterOption: false,
      displayFilterList: false,
    };
  }

  setupData() {
    this._getListMessage('');
    ChatHubHelper.startConnection(this.props.userId);
    document.addEventListener(
      'new-messages',
      (e) => this.handleNewMessageListener(e),
      false
    );
  }


  componentDidMount() {
    setTimeout(() => {
      this.setupData();
    }, 100);
  }

  handleNewMessageListener(e) {
    const newMessage = e.newMessage;
    const list = this.state.messageList;
    const index = list.findIndex(
      (e) =>
        e.object_id == newMessage.object_id &&
        e.object_instance_id == newMessage.object_instance_id
    );
    if (index >= 0) {
      list.splice(index, 1);
    }
    list.unshift({ ...newMessage, is_read: 0 });
    this.setState({ messageList: list });
  }

  async _getListMessage(keySearch) {
    const response = await requestGetListGroupChat(keySearch);
    if (keySearch) {
      this.setState({
        messageList: response ?? [],
        loading: false,
      });
    } else {
      this.setState({
        messageList: response ?? [],
        defaultMessageList: response ?? [],
        loading: false,
      });
    }
  }

  onClickItem = (e) => {
    window.parent.postMessage(e, '*');
    if (e.is_read == 0) {
      requestSendIsReadComment(e.object_id, e.object_instance_id);
      const list = this.state.messageList;
      const index = list.findIndex(
        (v) =>
          v.object_id == e.object_id &&
          v.object_instance_id == e.object_instance_id
      );
      if (index >= 0) {
        list[index].is_read = 1;
        this.setState({ messageList: list });
      }
    }
  };

  renderItem = (e, i) => {
    const title = e.OBJECT_INSTANCE_NAME ?? '(trống)';
    const content = `${e.user_created_name}: ${e.comment_content ?? ''}`;

    return (
      <div
        onClick={() => this.onClickItem(e)}
        className="list-chat-item-container"
        key={i}
      >
        <span className="list-chat-item-title">{title}</span>
        <div className="list-chat-item-content">
          <div style={{ width: 40 }}>
            <img
              src={
                e.avatar ? e.avatar : 'https://pro.ibom.vn/images/nophoto.jpg'
              }
              className="list-chat-item-avatar"
            />
          </div>
          <span
            style={{
              fontWeight: e.is_read == 0 ? '600' : '500',
              color: e.is_read == 0 ? 'black' : '#636363',
            }}
            className="list-chat-item-description"
          >
            {content}
          </span>
        </div>
        <span className="list-chat-item-date">{e.created_date_view}</span>
      </div>
    );
  };

  onHandleChangeSearch = (e) => {
    const text = e.target.value;
    if (text == '') {
      this.setState({
        messageList: this.state.defaultMessageList,
        searchValue: '',
      });
    } else if (text.length >= 2) {
      this.setState({ loading: true });
      this.functionDebounce(text);
    }
    this.setState({ searchValue: text });
  };

  functionDebounce = _debounce((e) => {
    this._getListMessage(e);
  }, 1000);

  render() {
    const { messageList, loading, displayFilterOption } = this.state;
    if (displayFilterOption)
      return (
        <FilterOptions
          onCloseFilter={() => this.setState({ displayFilterOption: false })}
        />
      );
    return (
      <div className="list-chat-container">
        <div className="list-chat-header">
          <div className="list-chat-input-container">
            <img alt="search" src={searchIcon} />
            <input
              value={this.state.searchValue}
              onChange={this.onHandleChangeSearch}
              placeholder="Tìm kiếm trao đổi"
            />
          </div>
          <div
            onClick={() => this.setState({ displayFilterOption: true })}
            className="list-chat-filter-button"
          >
            <img alt="search" src={filterIcon} />
            <span>Lọc</span>
          </div>
        </div>
        {loading ? (
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
        ) : messageList && messageList.length > 0 ? (
          <div style={{ paddingTop: 54 }}>
            {messageList.map((e, i) => {
              return this.renderItem(e, i);
            })}
          </div>
        ) : (
          <div
            style={{ paddingTop: 100 }}
            className="sc-message-loading-list-wrap"
          >
            <span style={{ textAlign: 'center' }}>Không có dữ liệu</span>
          </div>
        )}
      </div>
    );
  }
}

export default ListChat;
