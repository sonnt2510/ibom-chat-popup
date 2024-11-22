import React from 'react';
import Linkify from 'react-linkify';
import EmojiConvertor from 'emoji-js';
import { mapFileIcon } from '../../utils/Message';
import quoteIcon from '../../assets/icon-quote.png';
import { getCurrentUserId } from '../../services/request';

const TextMessage = (props) => {
  // var emoji = new EmojiConvertor();

  const { data, author, showName, reply } = props;
  let text = data.text;
  if (text.includes('\r') && !text.includes('\n')) {
    text = text.replace('\r', '\n');
  }

  const renderReplySection = () => {
    if (!reply) return <div />;
    const userId = getCurrentUserId();
    const { data } = reply;

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
      <div
        style={{
          padding: 0,
          marginBottom: 10,
        }}
        className="sc-user-input--replyContainer"
      >
        <div className="sc-user-input--replyWrap">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="sc-input--replyName">
              <img
                className="sc-input--quoteIcon"
                alt="quote-message"
                src={quoteIcon}
              />
              <b>{userId != data.userId ? data.name : 'Bạn'}</b>
            </span>
          </div>
          <div className="sc-input--quoteResponseWrap">{renderMessage}</div>
        </div>
      </div>
    );
  };

  const splitDate = data.date.split(' ');
  return (
    <div className="sc-message--text">
      {renderReplySection()}
      {author === 'them' && showName ? (
        <p className="sc-message--name">{data.name}</p>
      ) : null}
      <Linkify
        className="sc-message--linkify"
        properties={{ target: '_blank' }}
      >
        {/* {emoji.replace_emoticons(text)} */}
        {text}
      </Linkify>
      <p className="sc-message--time">{splitDate[splitDate.length - 1]}</p>
    </div>
  );
};

export default TextMessage;
