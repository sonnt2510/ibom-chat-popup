import React, { Component } from 'react';
import TextMessage from './TextMessage';
import FileMessage from './FileMessage';
import waitingIcon from '../../assets/waiting.png';
import copyIcon from '../../assets/copy-icon.png';
import quoteIcon from '../../assets/icon-quote.png';
import editIcon from '../../assets/edit-icon.png';
import trashIcon from '../../assets/trash-icon.png';
import forwardIcon from '../../assets/forward-icon.png';
import verticalDot from '../../assets/vertical_dot.png';
import likeIcon from '../../assets/icon_like.png';
import Popup from 'reactjs-popup';
import ReactTooltip from 'react-tooltip';
import {
  getCurrentUserId,
  getCurrentUserName,
  requestReactMessage,
  setTypeOfAction,
} from '../../services/request';
import { ReactEmoji, ReactValue } from '../../utils/Constants';
import { mapReactWithReactId } from '../../utils/Reaction';
import ReactionModal from './ReactionModal';
import { getDateText } from '../../utils/Message';

class Message extends Component {
  constructor() {
    super();
    this.state = {
      hoverMessageIndex: null,
      reactionData: [
        { reaction: ReactEmoji.LIKE, reactionId: ReactValue.LIKE },
        { reaction: ReactEmoji.HEART, reactionId: ReactValue.HEART },
        { reaction: ReactEmoji.LAUGH, reactionId: ReactValue.LAUGH },
        { reaction: ReactEmoji.SUPRISED, reactionId: ReactValue.SUPRISED },
        { reaction: ReactEmoji.CRY, reactionId: ReactValue.CRY },
        { reaction: ReactEmoji.ANGRY, reactionId: ReactValue.ANGRY },
      ],
      onSelectReaction: false,
      reactionModalVisible: false,
    };
  }
  _renderMessageOfType(type) {
    switch (type) {
    case 'text':
      return <TextMessage {...this.props.message} />;
    case 'file':
      return <FileMessage {...this.props.message} />;
    default:
      console.error(
        `Attempting to load message with unsupported file type '${type}'`
      );
    }
  }

  componentDidMount() {
    document.addEventListener(
      'focus-input',
      () => {
        if (this.popup) {
          this.popup.closePopup();
        }
      },
      false
    );
  }

  componentDidUpdate() {
    if (!this.props.isOpenOption) {
      if (this.popup) {
        this.popup.closePopup();
      }
    }
  }

  onOptionClick = (type) => {
    if (this.popup) {
      this.popup.closePopup();
    }
    this.props.optionClick(this.props.message, type);
  };

  renderOption = (isMe) => {
    const { type, id, isAllowDelete, isAllowEdit } = this.props.message;

    return id ? (
      <div
        style={{ cursor: 'pointer' }}
        className="sc-message--waiting-icon-wrap"
      >
        <Popup
          className="sc-popup-window"
          ref={(e) => {
            this.popup = e;
          }}
          onOpen={() => this.props.onOpenOption(id)}
          trigger={
            <img
              className="sc-message--menu-icon"
              alt="loading-message"
              src={verticalDot}
            />
          }
          position={isMe ? 'left' : 'top'}
        >
          <div style={{ paddingLeft: 5, paddingRight: 5 }}>
            <div
              onClick={() => this.onOptionClick('foward')}
              className="sc-message-option-wrap"
            >
              <img
                src={forwardIcon}
                className="sc-message-option-icon"
                alt="forward"
              />
              <span>Chia sẻ</span>
            </div>
            <div
              onClick={() => this.onOptionClick('reply')}
              className="sc-message-option-wrap"
            >
              <img
                src={quoteIcon}
                className="sc-message-option-icon"
                alt="reply"
              />
              <span>Trả lời</span>
            </div>
            {type === 'text' ? (
              <div>
                <div
                  style={{
                    borderBottomWidth: !isAllowDelete && !isAllowEdit ? 0 : 1,
                  }}
                  onClick={() => this.onOptionClick('copy')}
                  className="sc-message-option-wrap"
                >
                  <img
                    src={copyIcon}
                    className="sc-message-option-icon"
                    alt="copy"
                  />
                  <span>Copy tin nhắn</span>
                </div>
                {isAllowEdit && isMe ? (
                  <div
                    style={{ borderBottomWidth: !isAllowDelete ? 0 : 1 }}
                    onClick={() => this.onOptionClick('edit')}
                    className="sc-message-option-wrap"
                  >
                    <img
                      src={editIcon}
                      className="sc-message-option-icon"
                      alt="edit"
                    />
                    <span>Chỉnh sửa tin nhắn</span>
                  </div>
                ) : null}
              </div>
            ) : null}
            {isAllowDelete && isMe ? (
              <div
                onClick={() => this.onOptionClick('delete')}
                style={{ border: 'none' }}
                className="sc-message-option-wrap"
              >
                <img
                  src={trashIcon}
                  className="sc-message-option-icon sc-message-option-icon-trash"
                  alt="trash"
                />
                <span style={{ color: '#FF474C' }}>Xoá</span>
              </div>
            ) : null}
          </div>
        </Popup>
      </div>
    ) : (
      <div className="sc-message--waiting-icon-wrap">
        <img
          className="sc-message--waiting-icon"
          alt="loading-message"
          src={waitingIcon}
        />
      </div>
    );
  };

  sendRequestReact = (value, lastReaction) => {
    const actType = lastReaction === value ? 'remove' : 'add';
    setTypeOfAction('react');
    const { id } = this.props.message;
    const userId = getCurrentUserId();
    const userName = getCurrentUserName();
    const user = {
      avatar: '',
      name: userName,
      userId,
    };
    requestReactMessage(id, value, actType, user);
  };

  onSelectReaction = (value, lastReaction) => {
    this.sendRequestReact(value, lastReaction);
    this.setState({ onSelectReaction: true }, () => {
      this.setState({ onSelectReaction: false });
    });
  };

  renderToolTip = (isDisplay) => {
    let lastReaction = '';
    const userId = getCurrentUserId();
    const { reaction } = this.props.message;
    const { reactionData, onSelectReaction } = this.state;
    if (!isDisplay) return;
    if (reaction && reaction.length > 0) {
      const find = reaction.find((e) => e.user_sent_id == userId);
      if (find) {
        lastReaction = find.react;
      }
    }
    return (
      <div style={{ display: 'flex' }}>
        <div
          onClick={() => this.onSelectReaction(ReactValue.LIKE, lastReaction)}
          data-tip
          data-for="tooltipData"
          className="sc-message--tooltipWrap"
        >
          {lastReaction ? (
            <span style={{ fontSize: 13 }}>
              {mapReactWithReactId(lastReaction)}
            </span>
          ) : (
            <img src={likeIcon} height={16} width={16} />
          )}
        </div>
        {!onSelectReaction ? (
          <ReactTooltip
            arrowColor="transparent"
            id="tooltipData"
            delayHide={100}
            className="sc-message--tooltipContainer"
            effect="solid"
          >
            {reactionData.map((e) => (
              <div
                onClick={() =>
                  this.onSelectReaction(e.reactionId, lastReaction)
                }
                key={e.reactionId}
              >
                {e.reaction}
              </div>
            ))}
          </ReactTooltip>
        ) : null}
        {this.renderReaction(reaction)}
      </div>
    );
  };

  onHoverMessage = () => {
    const { index } = this.props.message;
    this.setState({ hoverMessageIndex: index });
  };

  outHoverMessage = () => {
    this.setState({ hoverMessageIndex: null });
  };

  renderReaction = (reaction) => {
    const userId = getCurrentUserId();
    const { id } = this.props.message;
    const length = reaction && reaction.length;
    let filteredReaction = reaction;
    if (length > 0) {
      filteredReaction = reaction.filter(function (el) {
        if (!this[el.react]) {
          this[el.react] = true;
          return true;
        }
        return false;
      }, Object.create(null));
    }
    if (!reaction || length == 0) return;
    const marginWidth = filteredReaction.length * 8;
    const marginLeft = 60 + filteredReaction.length * marginWidth;
    return (
      <div style={{ display: 'flex' }}>
        <div
          onClick={() => this.setState({ reactionModalVisible: true })}
          data-tip
          data-for={`reactionTooltipData${id}`}
          style={{ marginLeft: -marginLeft }}
          className="sc-message--messageReactionWrap"
        >
          {filteredReaction.slice(0, 3).map((e) => {
            return (
              <span style={{ marginRight: 3 }} key={e.reactionId}>
                {mapReactWithReactId(e.react)}
              </span>
            );
          })}
          <span style={{ fontWeight: '500', marginTop: 0 }}>
            {reaction.length}
          </span>
          <ReactTooltip
            arrowColor="transparent"
            id={`reactionTooltipData${id}`}
            className="sc-message--reactionTooltipContainer"
            effect="solid"
          >
            {reaction.slice(0, 4).map((e, i) => (
              <span key={i}>
                {e.user_sent_id == userId ? 'Bạn' : e.user_sent_name}
              </span>
            ))}
            {reaction.length >= 5 ? (
              <span>... và {6 - reaction.length} người khác</span>
            ) : null}
          </ReactTooltip>
        </div>
      </div>
    );
  };

  renderAlertMessage = () => {
    const { data, bgColor } = this.props.message;
    let dateText = getDateText(data.date);
    return (
      <div
        style={{ backgroundColor: bgColor }}
        className="sc-message--alertWrap"
      >
        <div className="sc-message--headerWrap">
          <img
            src={
              data.avatar
                ? data.avatar
                : 'https://pro.ibom.vn/images/nophoto.jpg'
            }
            className="sc-message--alertAvatar"
          />
          <span className="sc-message--alertTitle">{data.name}</span>
        </div>
        <span className="sc-message--alertDescription">{data.text}</span>
        <div className="sc-message-alertTimeWrap">
          <img src={waitingIcon} className="sc-message-alertClockIcon" />
          <span className="sc-message-alertTime">
            {dateText ? dateText : data.date}
          </span>
        </div>
      </div>
    );
  };

  render() {
    const {
      data,
      author,
      type,
      showName,
      showDate,
      index,
      reaction,
      commentType,
    } = this.props.message;
    const { hoverMessageIndex, reactionModalVisible } = this.state;
    const date = data.date.split(' ')[0];
    let contentClassList = [
      'sc-message--content',
      author === 'me' ? 'sent' : 'received',
    ];

    if (commentType === 'alert') return this.renderAlertMessage();
    return (
      <div>
        <ReactionModal
          onClose={() => this.setState({ reactionModalVisible: false })}
          reaction={reaction}
          isVisible={reactionModalVisible}
        />
        {showDate ? <p className="sc-message--date">{date}</p> : null}
        <div
          onMouseLeave={() => this.outHoverMessage()}
          onMouseEnter={() => this.onHoverMessage()}
          className="sc-message"
        >
          <div className={contentClassList.join(' ')}>
            <div
              className="sc-message--avatar"
              style={{
                opacity: showName ? 1 : 0,
                backgroundImage: `url(${
                  data.avatar
                    ? data.avatar
                    : 'https://pro.ibom.vn/images/nophoto.jpg'
                })`,
              }}
            ></div>
            {this._renderMessageOfType(type)}
            {this.renderOption(author === 'me', hoverMessageIndex === index)}
            {this.renderToolTip(
              hoverMessageIndex === index || (reaction && reaction.length > 0)
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Message;
