import React, { Component } from 'react';
import TextMessage from './TextMessage';
import FileMessage from './FileMessage';
import waitingIcon from '../../assets/waiting.png';
import copyIcon from '../../assets/copy-icon.png';
import editIcon from '../../assets/edit-icon.webp';
import trashIcon from '../../assets/trash-icon.png';
import verticalDot from '../../assets/vertical_dot.webp';
import Popup from 'reactjs-popup';
import moment from 'moment';

class Message extends Component {
  _renderMessageOfType(type) {
    switch (type) {
    case 'text':
      return <TextMessage {...this.props.message} />;
    case 'file':
      return <FileMessage {...this.props.message} />;
    default:
      console.error(`Attempting to load message with unsupported file type '${type}'`);
    }
  }

  onOptionClick = (type) => {
    if (this.popup) {
      this.popup.closePopup();
    }
    this.props.optionClick(this.props.message, type);
  }

  renderOption = () => {
    const { type, id, isAllowDelete, isAllowEdit } = this.props.message;

    return (
      id ?
        <div style={{ cursor: 'pointer' }} className='sc-message--waiting-icon-wrap'>
          <Popup
            className='sc-popup-window'
            ref={(e) => {
              this.popup = e;
            }}
            trigger={
              <img className='sc-message--menu-icon' alt='loading-message' src={verticalDot} />
            } position="left top"
          >
            <div style={{ paddingLeft: 5, paddingRight: 5 }}>
              {type === 'text' ?
                <div>
                  <div style={{borderBottomWidth: !isAllowEdit && !isAllowDelete ? 0 : 1}} onClick={() => this.onOptionClick('copy')} className='sc-message-option-wrap'>
                    <img src={copyIcon} className='sc-message-option-icon' alt='copy' />
                    <span>Copy tin nhắn</span>
                  </div>
                  {isAllowEdit ? <div style={{borderBottomWidth: !isAllowDelete ? 0 : 1}} onClick={() => this.onOptionClick('edit')} className='sc-message-option-wrap'>
                    <img src={editIcon} className='sc-message-option-icon' alt='edit' />
                    <span>Chỉnh sửa tin nhắn</span>
                  </div> : null}
                </div>
                : null}
              {isAllowDelete ?  
              <div onClick={() => this.onOptionClick('delete')} style={{ border: 'none' }} className='sc-message-option-wrap'>
                <img src={trashIcon} className='sc-message-option-icon sc-message-option-icon-trash' alt='trash' />
                <span style={{ color: '#FF474C' }}>Xoá</span>
              </div> : null}
            </div>
          </Popup>
        </div>
        :
        <div className='sc-message--waiting-icon-wrap'>
          <img className='sc-message--waiting-icon' alt='loading-message' src={waitingIcon} />
        </div>
    );
  }

  render() {
    const { data, author, type, showName, showDate } = this.props.message;
    const date = data.date.split(' ')[0];
    let contentClassList = [
      'sc-message--content',
      (author === 'me' ? 'sent' : 'received')
    ];
    console.log('adsa', this.props.message)
    return (
      <div>
        {showDate ? <p className='sc-message--date'>{moment(date, 'DD/MM/YYYY').format('MMM DD, yyyy')}</p> : null}
        <div className="sc-message">
          <div className={contentClassList.join(' ')}>
            <div className="sc-message--avatar" style={{
              opacity: showName ? 1 : 0,
              backgroundImage: `url(${data.avatar ? data.avatar : 'https://pro.ibom.vn/images/nophoto.jpg'})`
            }}></div>
            {this._renderMessageOfType(type)}
            {author === 'me' ? this.renderOption() : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Message;
