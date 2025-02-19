import React, { Component } from 'react';
import './styles';
import './styles/base.css';
import closeIcon from './assets/close-icon.png';
import searchIcon from './assets/search_icon.png';
import uncheckedIcon from './assets/unchecked_icon.png';
import checkedIcon from './assets/checked_icon.png';
import { MessageEvent } from './utils/Constants';
import {
  getCurrentUserId,
  getObjId,
  getObjInstanceId,
  requestFowardMessage,
  requestGetListGroupChat,
} from './services/request';
import loadingGif from './assets/loading.gif';
import _debounce from 'lodash/debounce';
import { mapFileIcon } from './utils/Message';
import { ChatHelper } from './helper/chatHelper';
import { MessageHelper } from './helper/messageHelper';

class ListFowardSection extends Component {
  prevPosition;
  constructor(props) {
    super(props);
    this.state = {
      fowardObject: null,
      messageList: [],
      loading: false,
      page: 1,
      searchValue: '',
      canLoadMore: true,
      listIds: [],
      isLoadMore: false,
      defaultMessageList: [],
    };
  }

  componentDidUpdate(_prevProps) {}

  componentDidMount() {
    document.addEventListener(
      MessageEvent.FOWARD_MESSAGE,
      (e) => {
        this._getListMessage('');
        this.setState({ fowardObject: e.message });
      },
      false
    );
  }

  _getListMessage = async (keySearch) => {
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
  };

  onShare = async () => {
    const newMessageEvent = new CustomEvent(MessageEvent.NEW_MESSAGES);
    const currentUserId = getCurrentUserId();
    const currentObjId = getObjId();
    const currentObjInstanceId = getObjInstanceId();
    const { listIds, fowardObject } = this.state;
    if (listIds.length && listIds.length < 11) {
      for (const i in listIds) {
        const { object_id, object_instance_id } = listIds[i];
        const refObj = {
          commentId: fowardObject.id,
          objectId: object_id,
          objInstanceId: object_instance_id,
        };
        const response = await requestFowardMessage(refObj);
        ChatHelper.sendNewMessageEvent(response);

        if (
          object_id == currentObjId &&
          object_instance_id == currentObjInstanceId
        ) {
          const messages = MessageHelper.convertMessageResponseToChatMessage(
            response,
            currentUserId
          );
          newMessageEvent.rawMessage = response;
          newMessageEvent.newMessage = messages;
          document.dispatchEvent(newMessageEvent);
        }
      }
      this.cancel();
    }
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

  renderItem = (e, i) => {
    const title = e.OBJECT_INSTANCE_NAME ?? '(trống)';
    let userAvatar = e.avatar;
    let date = e.created_date_view;
    const isSelected = this.state.listIds.filter(
      (v) => v.comment_id === e.comment_id
    ).length;
    return (
      <div
        onClick={() => {
          const { listIds } = this.state;
          const findIndex = listIds.findIndex(
            (v) => e.comment_id === v.comment_id
          );
          if (findIndex >= 0) {
            listIds.splice(findIndex, 1);
          } else {
            listIds.push(e);
          }
          this.setState({ listIds });
        }}
        className="list-chat-item-container"
        key={i}
      >
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
          <div
            style={{ marginLeft: 15, display: 'flex', width: '100%' }}
            className="list-chat-item-description-wrap"
          >
            <span
              style={{ width: '100%', paddingRight: 10 }}
              className="list-chat-item-title"
            >
              {title}
            </span>
            <img
              style={{
                height: 30,
                width: 30,
              }}
              src={isSelected ? checkedIcon : uncheckedIcon}
            />
          </div>
        </div>
        <span className="list-chat-item-date">{date}</span>
      </div>
    );
  };

  cancel = () => {
    this.setState({
      fowardObject: null,
      listIds: [],
      messageList: this.state.defaultMessageList,
    });
  };

  renderShareMessage = () => {
    const { fowardObject } = this.state;
    const type = fowardObject.type;
    const text = fowardObject.data.text;
    const url = fowardObject.data.url;
    const fileType = fowardObject.data.type;
    const fileName = fowardObject.data.fileName;
    return (
      <div className="foward-message-section">
        {type == 'text' ? (
          <span className="foward-message">Chia sẻ tin nhắn</span>
        ) : (
          <span className="foward-message">Chia sẻ ảnh/file</span>
        )}
        {type == 'text' ? (
          <span
            style={{ fontWeight: 'normal', fontSize: 15, marginTop: 10 }}
            className="foward-message"
          >
            {text}
          </span>
        ) : fileType == 'image' ? (
          <img src={url} className="foward-image" />
        ) : (
          <div style={{ marginTop: 10 }}>
            <span
              className="sc-input--replyName"
              style={{
                display: 'flex',
              }}
            >
              <img
                style={{ marginRight: 10 }}
                alt="fileIcon"
                src={mapFileIcon(fileName)}
                height={20}
                width={20}
              />
              {fileName}
            </span>
          </div>
        )}
      </div>
    );
  };

  render() {
    const { fowardObject, loading, messageList, listIds } = this.state;
    if (fowardObject == null) return <div />;
    return (
      <div className="foward-container">
        <div className="foward-wrap">
          <div className="foward-header">
            <span className="foward-title">Chia sẻ</span>
            <div
              onClick={() => this.cancel()}
              style={{ padding: 10, cursor: 'pointer' }}
            >
              <img src={closeIcon} className="foward-search-icon" />
            </div>
          </div>
          <div className="foward-body">
            <div className="foward-search-wrap">
              <img src={searchIcon} className="foward-search-icon" />
              <input
                value={this.state.searchValue}
                onChange={this.onHandleChangeSearch}
                className="foward-search-input"
                placeholder="Tìm kiếm hội thoại"
              />
            </div>
            <div onScroll={this.handleScroll} className="foward-list-body">
              {loading ? (
                <div className="sc-message-loading-list-wrap">
                  <img
                    className="sc-message-loading-list"
                    alt="loading"
                    src={loadingGif}
                  />
                </div>
              ) : messageList && messageList.length > 0 ? (
                messageList.map((e, i) => {
                  return this.renderItem(e, i);
                })
              ) : (
                <div
                  style={{ paddingTop: 50 }}
                  className="sc-message-loading-list-wrap"
                >
                  <span style={{ textAlign: 'center' }}>Không có dữ liệu</span>
                </div>
              )}
            </div>
            {this.renderShareMessage()}
            {listIds.length > 10 ? (
              <span className="foward-error">Tối đa 10 nhóm chat</span>
            ) : null}
            <div className="foward-bottom">
              <div
                onClick={() => this.cancel()}
                className="foward-button-cancel"
              >
                Huỷ
              </div>
              <div
                onClick={() => this.onShare()}
                style={{
                  opacity: listIds.length && listIds.length < 11 ? 1 : 0.4,
                  cursor:
                    listIds.length && listIds.length < 11 ? 'pointer' : 'self',
                }}
                className="foward-button-share"
              >
                Chia sẻ
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ListFowardSection;
