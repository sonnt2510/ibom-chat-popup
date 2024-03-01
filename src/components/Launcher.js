import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ChatWindow from './ChatWindow';


class Launcher extends Component {
  render() {
    return (
      <div id="sc-launcher">
        <ChatWindow
          isLoadMore={this.props.isLoadMore}
          onLoadMore={this.props.onLoadMore}
          optionClick={this.props.optionClick}
          loading={this.props.loading}
          messageList={this.props.messageList}
          onUserInputSubmit={this.props.onMessageWasSent}
          onFilesSelected={this.props.onFilesSelected}
          agentProfile={this.props.agentProfile}
          isOpen={this.props.isOpen}
          onClose={this.props.onClose}
          showEmoji={this.props.showEmoji}
        />
      </div>
    );
  }
}

Launcher.propTypes = {
  onMessageWasReceived: PropTypes.func,
  onMessageWasSent: PropTypes.func,
  newMessagesCount: PropTypes.number,
  isOpen: PropTypes.bool,
  handleClick: PropTypes.func,
  messageList: PropTypes.arrayOf(PropTypes.object),
  mute: PropTypes.bool,
  showEmoji: PropTypes.bool,
  loading: PropTypes.bool
};

Launcher.defaultProps = {
  newMessagesCount: 0,
  showEmoji: true
};

export default Launcher;
