import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SendIcon from './icons/SendIcon';
import CloseIcon from '../assets/close-icon.png';
import FileIcon from './icons/FileIcon';
import { ChatHubHelper } from '../services/signalR';
import UserInputHelper from '../helper/userInputHelper';
import {
  getListFiles,
  getListFilesToDisplay,
  setListFiles,
  setMessageId,
  setReplyObject,
  setTypeOfAction,
} from '../services/request';
import { ChatHelper } from '../helper/chatHelper';
import EmojiIcon from './icons/EmojiIcon';
import PopupWindow from './popups/PopupWindow';
import EmojiPicker from './emoji/EmojiPicker';
import { MessageEvent, GestureEvent } from '../utils/Constants';
import quoteIcon from '../assets/icon-quote.png';
import { blobToData, mapFileIcon } from '../utils/Message';
import trashIcon from '../assets/trash-icon.png';

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
      files: [],
    };
  }

  componentDidMount() {
    document.addEventListener(
      MessageEvent.EDIT_MY_MESSAGE,
      () => this.setState({ inputHasClose: true }),
      false
    );

    document.addEventListener(
      GestureEvent.DRAG_AND_DROP,
      () => {
        const totalFiles = getListFilesToDisplay();
        this.setState({ files: totalFiles, inputHasText: true });
      },
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

    this.checkCopyFunction();
  }

  checkCopyFunction = () => {
    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('paste', async (evt) => {
        const clipboardItems = evt.clipboardData.items;

        const items = [].slice.call(clipboardItems).filter((item) => {
          return (
            /^image\//.test(item.type) ||
            /^application\//.test(item.type) ||
            /^video\//.test(item.type)
          );
        });

        if (items.length === 0) {
          return;
        }

        for (const i in items) {
          items[i] = items[i].getAsFile();
        }

        for (const i in items) {
          const path = await blobToData(items[i]);
          items[i].path = path;
        }

        //Save the data
        const savedData = getListFiles();
        setListFiles([...savedData, ...items]);

        //New data
        const newData = getListFilesToDisplay();
        this.setState({ files: newData });
      });
    });
  };

  handleKeyDown(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      return this._submitText(event);
    }
  }

  handleKeyUp(event) {
    const innerHTML =
      event.target.innerHTML.replace('<br>', '').replace(/<img[^>]*>/g, '') ??
      '';
    if (!innerHTML || innerHTML.length == 0) {
      this.userInput.innerText = '';
      this.userInput.innerHTML = '';
    }
    const inputHasText =
      (innerHTML &&
        innerHTML.length !== 0 &&
        event.target.innerText !== '\n') ||
      this.state.files.length;
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
    this.setState({ inputHasClose: false, replyObject: null, files: [] });
    setTypeOfAction('');
    event.preventDefault();
    const text = this.userInput.innerText;
    text.replace('<br>', '\r');
    this.props.onSubmit({
      author: 'me',
      type: 'text',
      data: { text },
    });
    this.userInput.innerHTML = '';
    ChatHelper.sendTypingEvent('ended');
    ChatHubHelper.setTypingState('ended');
    setListFiles([]);
  }

  _onFilesSelected(event) {
    if (event.target.files && event.target.files.length > 0) {
      const items = [].slice.call(event.target.files);
      this.props.onFilesSelected(items);
    }
  }

  _renderSendOrFileIcon() {
    const { replyObject } = this.state;
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
          multiple
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
      this.userInput.innerHTML = '';
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
    this.userInput.innerText += emoji;
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

  setEndOfContenteditable(contentEditableElement) {
    var range, selection;
    if (document.createRange) {
      range = document.createRange();
      range.selectNodeContents(contentEditableElement);
      range.collapse(false);
      selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (document.selection) {
      range = document.body.createTextRange();
      range.moveToElementText(contentEditableElement);
      range.collapse(false);
      range.select();
    }
  }

  onHoverImage = (e, isHover) => {
    const { files } = this.state;
    for (const i in files) {
      if (files[i].id == e.id) {
        files[i].isHover = isHover;
      }
    }
    this.setState({ files });
  };

  deleteFile = (e) => {
    const { files } = this.state;
    const index = files.findIndex((v) => v.id == e.id);
    files.splice(index, 1);
    setListFiles(files);
    this.setState({ files });
  };

  onDeleteAll = () => {
    this.setState({ files: [] });
    setListFiles([]);
  };

  renderFileDrag = () => {
    const { files } = this.state;
    const listImage = files.filter((e) => e.type.includes('image'));
    const listFiles = files.filter((e) => !e.type.includes('image'));
    let title = [];
    if (listImage.length) {
      title.push(`${listImage.length} ảnh`);
    }

    if (listFiles.length) {
      title.push(`${listFiles.length} file`);
    }
    return (
      <div className="sc-user-input-files-container">
        <div className="sc-user-input-files-header">
          <span>{title.join(', ')}</span>
          <div
            onClick={() => this.onDeleteAll()}
            className="sc-user-input-files-delete-button"
          >
            <span>Xoá tất cả</span>
          </div>
        </div>
        <div className="sc-user-input-list-file">
          {files.map((e) => {
            const isImage = e.type.includes('image');
            let icon = mapFileIcon(e.name);
            return (
              <div
                onMouseLeave={() => this.onHoverImage(e, false)}
                onMouseEnter={() => this.onHoverImage(e, true)}
                className="sc-user-input-files-item"
                key={e.id}
              >
                {e.isHover ? (
                  <div
                    onClick={() => this.deleteFile(e)}
                    className="sc-user-input-files-hover"
                  >
                    <img
                      src={trashIcon}
                      className="sc-user-input-files-trash"
                    />
                  </div>
                ) : null}
                {isImage ? (
                  <img
                    className="sc-user-input-files-image"
                    alt={e.path}
                    src={e.path}
                  />
                ) : (
                  <div className="sc-user-input-files-wrap">
                    <img className="sc-user-input-files-icon" src={icon} />
                    <span className="sc-user-input-files-name">{e.name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  render() {
    const focusInputEvent = new CustomEvent('focus-input');
    if (!this.props.isAllowAddNew) return null;
    const { inputActive, inputHasClose, emojiPickerIsOpen, files } = this.state;
    return (
      <div>
        {this.renderReplySection()}
        <form className={`sc-user-input ${inputActive ? 'active' : ''}`}>
          <div className="sc-user-input--mainWrap">
            <div
              role="input"
              tabIndex="0"
              multiple
              id="el"
              onFocus={() => {
                var element = document.getElementById('el');
                this.setEndOfContenteditable(element);
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
        {files && files.length ? this.renderFileDrag() : null}
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
