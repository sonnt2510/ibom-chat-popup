import React, { Component } from 'react';
import './styles';
import './styles/base.css';
import {
  getCurrentUserId,
  requestGetListGroupChat,
  requestSendIsReadComment,
} from './services/request';
import { ChatHubHelper } from './services/signalR';
import searchIcon from './assets/icon-search.png';
import loadingGif from './assets/loading.gif';
import filterIcon from './assets/filter.png';
import _debounce from 'lodash/debounce';
import FilterOptions from './FilterOptions';
import EmojiConvertor from 'emoji-js';
import { MessageEvent } from './utils/Constants';

class ListChat extends Component {
  emoji = new EmojiConvertor();
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
      canLoadMore: true,
      page: 1,
    };
  }

  setupData() {
    this._getListMessage('');
    ChatHubHelper.startConnection(this.props.userId);
    document.addEventListener(
      MessageEvent.NEW_MESSAGES,
      (e) => this.handleMessageListener(e, 'add'),
      false
    );
    document.addEventListener(
      MessageEvent.EDIT_MESSAGE,
      (e) => this.handleMessageListener(e, 'edit'),
      false
    );
    document.addEventListener(
      MessageEvent.DELETE_MESSAGE,
      (e) => this.handleMessageListener(e, 'delete'),
      false
    );
  }

  componentDidMount() {
    setTimeout(() => {
      this.setupData();
    }, 100);
  }

  handleMessageListener(e, type) {
    // const currentUserId = getCurrentUserId();
    // const rawMessage = e.rawMessage;
    // if (currentUserId != rawMessage.created_by) {
    //   window.parent.postMessage(rawMessage, '*');
    // }
    window.parent.postMessage('NEW_MESSAGE', '*');
    let spliceItem = {};
    let listMessage = [];
    const newMessage = e.newMessage;
    const list = this.state.messageList;
    const index = list.findIndex(
      (e) =>
        e.object_id == (newMessage.object_id || newMessage.objectId) &&
        e.object_instance_id ==
          (newMessage.object_instance_id || newMessage.objectInstanceId)
    );
    if (index >= 0) {
      if (type === 'add') {
        spliceItem = list.splice(index, 1)[0];
        listMessage = spliceItem.listMessage;
        newMessage.is_read = 0;
        if (listMessage && listMessage.length) {
          listMessage.push(newMessage);
        } else {
          listMessage = [newMessage];
        }
        spliceItem.listMessage = listMessage;
        list.unshift({ ...spliceItem });
      } else if (type === 'edit' || type === 'delete') {
        listMessage = list[index].listMessage;
        if (listMessage && listMessage.length) {
          const findListMessageEditIndex = listMessage.findIndex(
            (e) =>
              e.comment_id == (newMessage.comment_id || newMessage.messageId)
          );
          if (findListMessageEditIndex >= 0) {
            if (type === 'edit') {
              listMessage[findListMessageEditIndex].comment_content =
                newMessage.content;
            } else if (type === 'delete') {
              listMessage.splice(findListMessageEditIndex, 1);
            }
          }
          list[index].listMessage = listMessage;
        } else {
          list[index].comment_content = newMessage.content;
        }
      }
      this.setState({ messageList: list, defaultMessageList: list });
    } else {
      if (type === 'add') {
        spliceItem = newMessage;
        list.unshift({ ...spliceItem, is_read: 0 });
        this.setState({ messageList: list, defaultMessageList: list });
      }
    }
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

  onClickItem = (e, isRead, commentId) => {
    window.parent.postMessage(e, '*');
    if (isRead == 0) {
      requestSendIsReadComment(e.object_id, e.object_instance_id, commentId);
      const list = this.state.messageList;
      const index = list.findIndex(
        (v) =>
          v.object_id == e.object_id &&
          v.object_instance_id == e.object_instance_id
      );
      if (index >= 0) {
        list[index].is_read = 1;
        if (list[index].listMessage) {
          list[index].listMessage.map((e) => {
            return (e.is_read = 1);
          });
        }
        this.setState({ messageList: list });
      }
    }
  };

  renderItem = (e, i) => {
    const currentUserId = getCurrentUserId();
    const title = e.OBJECT_INSTANCE_NAME ?? '(trống)';
    let comment = e.comment_content ?? '';
    let userName = e.user_created_name ?? '';
    let isRead = e.is_read;
    let userAvatar = e.avatar;
    let commentId = e.comment_id;
    let userId = e.created_by;
    let date = e.created_date_view;
    if (e.listMessage && e.listMessage.length) {
      const lastMessage = e.listMessage[e.listMessage.length - 1];
      comment = lastMessage.comment_content;
      userName = lastMessage.user_created_name;
      isRead = lastMessage.is_read;
      userAvatar = lastMessage.avatar;
      commentId = lastMessage.comment_id;
      userId = lastMessage.created_by;
      date = lastMessage.created_date_view;
    }

    if (userId == currentUserId) {
      isRead = 1;
    }

    // const content = `${userName}: ${this.emoji.replace_emoticons(comment)}`;
    const content = `${userName}: ${comment}`;

    return (
      <div
        onClick={() => this.onClickItem(e, isRead, commentId)}
        className="list-chat-item-container"
        key={i}
      >
        <span className="list-chat-item-title">{title}</span>
        <div className="list-chat-item-content">
          <div style={{ width: 40 }}>
            <img
              src={
                userAvatar
                  ? userAvatar
                  : 'https://pro.ibom.vn/images/nophoto.jpg'
              }
              className="list-chat-item-avatar"
            />
          </div>
          <div className="list-chat-item-description-wrap">
            <span
              style={{
                fontWeight: isRead == 0 ? '600' : '500',
                color: isRead == 0 ? 'black' : '#636363',
              }}
              className="list-chat-item-description"
            >
              {content}
            </span>
          </div>
        </div>
        <span className="list-chat-item-date">{date}</span>
      </div>
    );
  };

  onHandleChangeSearch = (e) => {
    const text = e.target.value;
    this.setState({ loading: true, page: 1 });
    this.functionDebounce(text);
    this.setState({ searchValue: text });
  };

  functionDebounce = _debounce((e) => {
    this._getListMessage(e);
  }, 1000);

  onLoadMore = async () => {
    const { messageList, searchValue, page, canLoadMore } = this.state;
    if (!canLoadMore) return;
    this.setState({ isLoadMore: true });
    const response = await requestGetListGroupChat(searchValue, page + 1);
    const responseList = response ?? [];
    if (responseList && responseList.length > 0) {
      const newList = [...messageList, ...responseList];
      for (const i in newList) {
        newList[i].index = Number(i) + 1;
      }
      this.setState({
        isLoadMore: false,
        messageList: newList,
        canLoadMore: true,
        page: page + 1,
      });
    } else {
      this.setState({ isLoadMore: false, canLoadMore: false });
    }
  };

  handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && !this.state.loading && !this.state.isLoadMore) {
      this.onLoadMore();
    }
  };

  render() {
    const { messageList, loading, displayFilterOption, isLoadMore } =
      this.state;
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
            <img
              style={{ height: 20, width: 20 }}
              alt="search"
              src={searchIcon}
            />
            <input
              className="list-chat-input"
              value={this.state.searchValue}
              onChange={this.onHandleChangeSearch}
              placeholder="Tìm kiếm trao đổi"
            />
          </div>
          <div
            onClick={() => this.setState({ displayFilterOption: true })}
            className="list-chat-filter-button"
          >
            <img
              className="list-chat-filter-icon"
              alt="search"
              src={filterIcon}
            />
            <span className="list-chat-filter-title">Lọc</span>
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
          <div onScroll={this.handleScroll} className="sc-message-list-wrap">
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
        {isLoadMore ? (
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <img
              className="sc-message-loading-list"
              alt="loading"
              src={loadingGif}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default ListChat;
