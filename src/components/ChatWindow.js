import PropTypes from 'prop-types';
import React, { Component } from 'react';
import MessageList from './MessageList';
import UserInput from './UserInput';
import Header from './Header';
import MenuTab from './MenuTab';

class ChatWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenMenu: false,
    };
  }

  onUserInputSubmit(message) {
    this.props.onMessageWasSent(message);
  }

  onFilesSelected(filesList) {
    this.props.onFilesSelected(filesList);
  }

  openMenu = () => {
    this.setState({ isOpenMenu: !this.state.isOpenMenu });
  };

  render() {
    const {isOpenMenu} = this.state;
    let messageList = this.props.messageList || [];
    let classList = [
      'sc-chat-window',
      this.props.isOpen ? 'opened' : 'closed',
      isOpenMenu ? 'openMenu' : 'hideMenu',
    ];
    let menuTabClassList = [
      'menu-tab',
      isOpenMenu ? 'open' : 'hide',
    ];
    return (
      <div style={{ display: 'flex', width: '100%' }}>
        <div className={classList.join(' ')}>
          <Header
            isOpenMenu={isOpenMenu}
            onOpenMenu={this.openMenu}
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
        <div className={menuTabClassList.join(' ')}>
          <MenuTab fileList={this.props.fileList} roomName={this.props.profile.roomName} />
        </div>
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
  loading: PropTypes.bool,
};

export default ChatWindow;
