import PropTypes from 'prop-types';
import React, { Component } from 'react';
import SendIcon from './icons/SendIcon';
import CloseIcon from '../assets/close-icon.png';
import FileIcon from './icons/FileIcon';
import { ChatHubHelper } from '../services/signalR';
import UserInputHelper from '../helper/userInputHelper';
import { setMessageId } from '../services/request';
import { ChatHelper } from '../helper/chatHelper';

class UserInput extends Component {

  constructor() {
    super();
    this.state = {
      inputActive: false,
      inputHasText: false,
      inputHasClose: false
    };
  }

  componentDidMount() {
    document.addEventListener('edit-my-message', () => this.setState({ inputHasClose: true }), false);
  }

  handleKeyDown(event) {
    if (event.keyCode === 13 && !event.shiftKey) {
      return this._submitText(event);
    }
  }

  handleKeyUp(event) {
    const inputHasText = event.target.innerHTML.length !== 0 &&
      event.target.innerText !== '\n';
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
    this.setState({ inputHasClose: false });
    event.preventDefault();
    const text = this.userInput.textContent;
    if (text && text.length > 0) {
      this.props.onSubmit({
        author: 'me',
        type: 'text',
        data: { text }
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
    return (
      <div className="sc-user-input--button">
        <FileIcon onClick={this._showFilePicker.bind(this)} />
        <input
          type="file"
          // name="files[]"
          ref={(e) => { this._fileUploadButton = e; }}
          onChange={this._onFilesSelected.bind(this)}
        />
      </div>
    );
  }

  onClickCloseEdit = () => {
    if (this.userInput) {
      this.userInput.blur();
      this.userInput.textContent = '';
      setMessageId('');
      this.setState({ inputHasClose: false, inputHasText: false, inputActive: false });
    }
  }

  render() {
    const { inputActive, inputHasClose } = this.state;
    return (
      <form className={`sc-user-input ${(inputActive ? 'active' : '')}`}>
        <div
          role="button"
          tabIndex="0"
          onFocus={() => { this.setState({ inputActive: true }); }}
          onBlur={() => { this.setState({ inputActive: false }); }}
          ref={(e) => {
            UserInputHelper.setUserInput(e);
            this.userInput = e;
          }}
          onKeyDown={this.handleKeyDown.bind(this)}
          onKeyUp={this.handleKeyUp.bind(this)}
          contentEditable={!this.props.loading}
          placeholder="Hãy viết gì đó ..."
          className="sc-user-input--text"
        >
        </div>
        <div className="sc-user-input--buttons">
          {inputHasClose ?
            <div onClick={() => this.onClickCloseEdit()} className="sc-user-input--button">
              <img src={CloseIcon} alt='close-icon' className="sc-user-input--closeIcon" />
            </div>
            : null}
          {this._renderSendOrFileIcon()}
        </div>
      </form>
    );
  }
}

UserInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onFilesSelected: PropTypes.func.isRequired,
  showEmoji: PropTypes.bool
};

export default UserInput;
