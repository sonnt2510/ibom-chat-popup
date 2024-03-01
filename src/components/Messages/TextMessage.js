import React from 'react';
import Linkify from 'react-linkify';


const TextMessage = (props) => {
  const { data, author, showName } = props;
  const splitDate = data.date.split(' ');
  return <div className="sc-message--text">
    {author === 'them' && showName ? <p className="sc-message--name">{data.name}</p> : null}
    <Linkify properties={{ target: '_blank' }}>{data.text}</Linkify>
    <p style={{textAlign: author === 'them' ? 'left' : 'right'}} className="sc-message--time">{splitDate[splitDate.length - 1]}</p>
  </div>;
};

export default TextMessage;
