import React, { Component } from 'react';
import Message from './Messages';
import loadingGif from './../assets/loading.gif';
import isTypingGif from './../assets/isTyping.gif';
import { getTypeOfAction } from '../services/request';

class MessageList extends Component {
  oldScrollHeight;
  constructor() {
    super();
    this.state = {
      isTyping: false,
      userTyping: '',
      listMessage: [],
    };
  }
  componentDidMount() {
    document.addEventListener('typing', (e) => this.handleTyping(e));
  }

  handleTyping(e) {
    const detail = e.typingDetail;
    this.setState({
      isTyping: detail.typingState === 'typing',
      userTyping: detail.userName,
    });
  }

  componentDidUpdate(_prevProps, _prevState) {
    const typeOfAction = getTypeOfAction();
    if (_prevProps.messages !== this.props.messages) {
      this.setState({ listMessage: this.props.messages }, () => {
        if (typeOfAction === 'get' || typeOfAction === 'add') {
          this.scrollList.scrollTop = this.scrollList.scrollHeight;
          this.oldScrollHeight = this.scrollList.scrollHeight;
        } else if (typeOfAction === 'loadMore') {
          this.scrollList.scrollTop =
            this.scrollList.scrollHeight - this.oldScrollHeight;
          this.oldScrollHeight = this.scrollList.scrollHeight;
        }
      });
    }
  }

  onOpenOption = (messageId) => {
    const { listMessage } = this.state;
    const index = listMessage.findIndex((e) => e.id === messageId);
    for (const i in listMessage) {
      listMessage[i].isOpenOption = i == index;
    }
    this.setState({ listMessage });
  };

  handleScroll = (e) => {
    if (e.currentTarget.scrollTop === 0) {
      this.props.onLoadMore();
    }
  };

  render() {
    const { loading, optionClick, isLoadMore } = this.props;
    const { isTyping, userTyping, listMessage } = this.state;
    const length = listMessage.length;

    return (
      <div
        onScroll={this.handleScroll}
        className="sc-message-list"
        ref={(el) => (this.scrollList = el)}
      >
        {isLoadMore ? (
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <img
              className="sc-message-loading-list"
              alt="loading"
              src={loadingGif}
            />
          </div>
        ) : null}
        {loading ? (
          <div className="sc-message-loading-list-wrap">
            <img
              className="sc-message-loading-list"
              alt="loading"
              src={loadingGif}
            />
          </div>
        ) : length > 0 ? (
          <div>
            {listMessage.map((message, i) => {
              return (
                <Message
                  isOpenOption={message.isOpenOption}
                  onOpenOption={(messageId) => this.onOpenOption(messageId)}
                  optionClick={optionClick}
                  message={message}
                  key={i}
                />
              );
            })}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'grey', fontSize: 14 }}>
            Không có dữ liệu
          </p>
        )}
        {isTyping ? (
          <p className={`sc-message-typing`}>
            {userTyping} đang gõ{' '}
            <img
              className="sc-message-typing-icon"
              alt="isTyping"
              src={isTypingGif}
            />
          </p>
        ) : null}
      </div>
    );
  }
}

export default MessageList;
