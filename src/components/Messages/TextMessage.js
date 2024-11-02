import React from 'react';
import Linkify from 'react-linkify';
import EmojiConvertor from 'emoji-js';

const TextMessage = (props) => {
  // var emoji = new EmojiConvertor();

  const { data, author, showName } = props;
  
  let text = data.text;
  if (text.includes('\r') && !text.includes('\n')) {
    text = text.replace('\r', '\n');
  }
  const splitDate = data.date.split(' ');
  return (
    <div
      style={{ textAlign: author === 'them' ? 'left' : 'right' }}
      className="sc-message--text"
    >
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
      <p
        style={{ textAlign: author === 'them' ? 'left' : 'right' }}
        className="sc-message--time"
      >
        {splitDate[splitDate.length - 1]}
      </p>
    </div>
  );
};

export default TextMessage;
