import React, { Component } from "react";
import "./styles";
import "./styles/base.css";
import { requestGetListGroupChat } from "./services/request";
import { ChatHubHelper } from "./services/signalR";
import searchIcon from "./assets/icon-search.png";
import loadingGif from "./assets/loading.gif";
import _debounce from "lodash/debounce";

class ListChat extends Component {
  constructor() {
    super();
    this.state = {
      messageList: [],
      isOpen: true,
      loading: true,
      roomName: "",
      isLoadMore: false,
      defaultMessageList: [],
      searchValue: "",
    };
  }

  setupData() {
    this._getListMessage("");
    document.addEventListener(
      "new-messages",
      (e) => this.handleNewMessageListener(e),
      false
    );
    ChatHubHelper.startConnection(this.props.userId);
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
    list.unshift({ ...newMessage, isNew: true });
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

  renderItem = (e, i) => {
    const title = e.OBJECT_INSTANCE_NAME ?? "(trống)";
    const content = `${e.user_created_name}: ${e.comment_content}`;
    return (
      <div className="list-chat-item-container" key={i}>
        <div style={{ width: 40 }}>
          <img
            src={e.avatar ? e.avatar : "https://pro.ibom.vn/images/nophoto.jpg"}
            className="list-chat-item-avatar"
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div className="list-chat-item-content">
            <span className="list-chat-item-title">{title}</span>
            <span className="list-chat-item-date">{e.created_date_view}</span>
          </div>
          <span className="list-chat-item-description">{content}</span>
        </div>
      </div>
    );
  };

  onHandleChangeSearch = (e) => {
    const text = e.target.value;
    if (text == "") {
      this.setState({
        messageList: this.state.defaultMessageList,
        searchValue: "",
      });
    } else {
      this.setState({ searchValue: text, loading: true });
      this.functionDebounce(text);
    }
  };

  functionDebounce = _debounce((e) => {
    this._getListMessage(e);
  }, 1000);

  render() {
    const { messageList, loading } = this.state;
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
          messageList.map((e, i) => {
            return this.renderItem(e, i);
          })
        ) : (
          <div
            style={{ paddingTop: 100 }}
            className="sc-message-loading-list-wrap"
          >
            <span style={{ textAlign: "center" }}>Không có dữ liệu</span>
          </div>
        )}
      </div>
    );
  }
}

export default ListChat;
