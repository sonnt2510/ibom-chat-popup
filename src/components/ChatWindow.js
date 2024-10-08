import PropTypes from 'prop-types';
import React, { Component } from 'react';
import MessageList from './MessageList';
import UserInput from './UserInput';
import Header from './Header';

class ChatWindow extends Component {
  constructor(props) {
    super(props);
  }

  onUserInputSubmit(message) {
    this.props.onMessageWasSent(message);
  }

  onFilesSelected(filesList) {
    this.props.onFilesSelected(filesList);
  }

  render() {
    let messageList = this.props.messageList || [];
    let classList = [
      'sc-chat-window',
      (this.props.isOpen ? 'opened' : 'closed')
    ];
    return (
      <div className={classList.join(' ')}>
        <Header
          teamName={this.props.profile.roomName}
          url={this.props.profile.url}
          onClose={this.props.onClose}
          isDetail={this.props.profile.isDetail}
        />
        <MessageList
          isLoadMore={this.props.isLoadMore}
          onLoadMore={this.props.onLoadMore}
          optionClick={this.props.optionClick}
          loading={this.props.loading}
          messages={messageList}
        />
        <UserInput
          isAllowAddNew={this.props.isAllowAddNew}
          isAllowAttach={this.props.isAllowAttach}
          loading={this.props.loading}
          onSubmit={this.onUserInputSubmit.bind(this)}
          onFilesSelected={this.onFilesSelected.bind(this)}
          showEmoji={this.props.showEmoji}
        />
      </div>
    );
  }
}

ChatWindow.propTypes = {
  agentProfile: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onFilesSelected: PropTypes.func,
  onUserInputSubmit: PropTypes.func.isRequired,
  showEmoji: PropTypes.bool,
  loading: PropTypes.bool
};

export default ChatWindow;
