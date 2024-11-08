import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SendIcon from './icons/SendIcon';
import CloseIcon from '../assets/close-icon.png';
import FileIcon from './icons/FileIcon';
import { ChatHubHelper } from '../services/signalR';
import UserInputHelper from '../helper/userInputHelper';
import { setMessageId, setReplyObject, setTypeOfAction } from '../services/request';
import { ChatHelper } from '../helper/chatHelper';
import EmojiIcon from './icons/EmojiIcon';
import PopupWindow from './popups/PopupWindow';
import EmojiPicker from './emoji/EmojiPicker';
import { MessageEvent } from '../utils/Constants';
import quoteIcon from '../assets/icon-quote.png';
import { mapFileIcon } from '../utils/Message';

class UserInput extends Component {
  constructor() {
    super();
    this.state = {
      inputActive: false,
      inputHasText: false,
      inputHasClose: false,
      emojiPickerIsOpen: false,
      emojiFilter: '',
      replyObject: null,
    };
  }

  componentDidMount() {
    document.addEventListener(
      MessageEvent.EDIT_MESSAGE,
      () => this.setState({ inputHasClose: true }),
      false
    );

    document.addEventListener(
      MessageEvent.REPLY_MESSAGE,
      (e) => {
        this.setState({ replyObject: e.replyObject });
        this.userInput.focus();
      },
      false
    );

    this.chatWindow = document.querySelector('.sc-chat-window');
  }

  handleKeyDown(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      return this._submitText(event);
    }
  }

  handleKeyUp(event) {
    const inputHasText =
      event.target.innerHTML.length !== 0 && event.target.innerText !== '\n';
    if (!inputHasText) {
      ChatHelper.sendTypingEvent('ended');
      ChatHubHelper.setTypingState('ended');
    } else {
      ChatHelper.sendTypingEvent('typing');
      ChatHubHelper.setTypingState('typing');
    }

    this.setState({ inputHasText });
  }

  _showFilePicker() {
    this._fileUploadButton.click();
  }

  _submitText(event) {
    this.setState({ inputHasClose: false, replyObject: null });
    setTypeOfAction('');
    event.preventDefault();
    const text = this.userInput.innerText;
    text.replace('<br>', '\r');
    if (text && text.length > 0) {
      this.props.onSubmit({
        author: 'me',
        type: 'text',
        data: { text },
      });
      this.userInput.innerHTML = '';
      ChatHelper.sendTypingEvent('ended');
      ChatHubHelper.setTypingState('ended');
    }
  }

  _onFilesSelected(event) {
    if (event.target.files && event.target.files.length > 0) {
      this.props.onFilesSelected(event.target.files[0]);
    }
  }

  _renderSendOrFileIcon() {
    const {replyObject} = this.state;
    if (this.props.loading) {
      return null;
    }
    if (this.state.inputHasText) {
      return (
        <div className="sc-user-input--button">
          <SendIcon onClick={this._submitText.bind(this)} />
        </div>
      );
    }
    return this.props.isAllowAttach && !replyObject ? (
      <div className="sc-user-input--button">
        <FileIcon onClick={this._showFilePicker.bind(this)} />
        <input
          type="file"
          // name="files[]"
          ref={(e) => {
            this._fileUploadButton = e;
          }}
          onChange={this._onFilesSelected.bind(this)}
        />
      </div>
    ) : null;
  }

  onClickCloseEdit = () => {
    if (this.userInput) {
      this.userInput.blur();
      this.userInput.innerHtml = '';
      setMessageId('');
      this.setState({
        inputHasClose: false,
        inputHasText: false,
        inputActive: false,
      });
    }
  };

  toggleEmojiPicker = (e) => {
    e.preventDefault();
    if (!this.state.emojiPickerIsOpen) {
      this.setState({ emojiPickerIsOpen: true });
    }
  };

  closeEmojiPicker = (e) => {
    if (this.chatWindow.contains(e.target)) {
      e.stopPropagation();
      e.preventDefault();
    }
    this.setState({ emojiPickerIsOpen: false });
  };

  _handleEmojiPicked = (emoji) => {
    this.setState({ emojiPickerIsOpen: false });
    this.userInput.innerHTML += emoji;
    this.userInput.focus();
  };

  _renderEmojiPopup = () => (
    <PopupWindow
      isOpen={this.state.emojiPickerIsOpen}
      onClickedOutside={this.closeEmojiPicker}
    >
      <EmojiPicker
        onEmojiPicked={this._handleEmojiPicked}
        filter={this.state.emojiFilter}
      />
    </PopupWindow>
  );

  onCloseQuote = () => {
    this.setState({ replyObject: null });
    setTypeOfAction('');
    setReplyObject(null);
  };

  renderReplySection = () => {
    const { replyObject } = this.state;
    if (!replyObject) return <div />;
    const { data, author } = replyObject;

    let renderMessage = (
      <span className="sc-input--replyName">{data.text}</span>
    );

    if (data.type == 'image') {
      renderMessage = <img src={data.url} className="sc-input--quoteImage" />;
    }

    if (data.type == 'file') {
      renderMessage = (
        <span
          className="sc-input--replyName"
          style={{
            display: 'flex',
          }}
        >
          <img
            style={{ marginRight: 10 }}
            alt="fileIcon"
            src={mapFileIcon(data.fileName)}
            height={15}
            width={15}
          />
          {data.fileName}
        </span>
      );
    }

    return (
      <div className="sc-user-input--replyContainer">
        <div className="sc-user-input--replyWrap">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="sc-input--replyName">
              <img
                className="sc-input--quoteIcon"
                alt="quote-message"
                src={quoteIcon}
              />
              Trả lời <b>{author === 'them' ? data.name : ''}</b>
            </span>
            <div
              onClick={() => this.onCloseQuote()}
              className="sc-input--quoteCloseButton"
            >
              <img
                className="sc-input--closeQuoteIcon"
                alt="quote-close"
                src={CloseIcon}
              />
            </div>
          </div>
          <div className="sc-input--quoteResponseWrap">{renderMessage}</div>
        </div>
      </div>
    );
  };

  render() {
    const focusInputEvent = new CustomEvent('focus-input');
    if (!this.props.isAllowAddNew) return null;
    const { inputActive, inputHasClose, emojiPickerIsOpen } = this.state;
    return (
      <div>
        {this.renderReplySection()}
        <form className={`sc-user-input ${inputActive ? 'active' : ''}`}>
          <div className="sc-user-input--mainWrap">
            <div
              role="input"
              tabIndex="0"
              multiple
              onFocus={() => {
                this.setState({ inputActive: true });
                document.dispatchEvent(focusInputEvent);
              }}
              onBlur={() => {
                this.setState({ inputActive: false });
              }}
              ref={(e) => {
                UserInputHelper.setUserInput(e);
                this.userInput = e;
              }}
              onKeyDown={this.handleKeyDown.bind(this)}
              onKeyUp={this.handleKeyUp.bind(this)}
              contentEditable={!this.props.loading}
              placeholder="Hãy viết gì đó ..."
              className="sc-user-input--text"
            />
            <div className="sc-user-input--buttons">
              {inputHasClose ? (
                <div
                  onClick={() => this.onClickCloseEdit()}
                  className="sc-user-input--button"
                >
                  <img
                    src={CloseIcon}
                    alt="close-icon"
                    className="sc-user-input--closeIcon"
                  />
                </div>
              ) : null}
              <div
                style={{ marginRight: 10 }}
                className="sc-user-input--button"
              >
                <EmojiIcon
                  onClick={this.toggleEmojiPicker}
                  isActive={emojiPickerIsOpen}
                  tooltip={this._renderEmojiPopup()}
                />
              </div>
              {this._renderSendOrFileIcon()}
            </div>
          </div>
        </form>
      </div>
    );
  }
}

UserInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onFilesSelected: PropTypes.func.isRequired,
  showEmoji: PropTypes.bool,
};

export default UserInput;
