import React from 'react';
// import FileIcon from './../icons/FileIcon';


const FileMessage = (props) => {
  const { date, type, url, fileName, name, showName } = props.data;
  const splitDate = date.split(' ');
  const renderFile = () => {
    if (type === 'image') {
      return <img className="sc-message--image" alt="image-message" src={url} />;
    }
    return <span>
      <p style={{ marginTop: type !== 'image' && props.author === 'me' ? 15 : 0 }}>{fileName}</p>
    </span>;
  };

  return (
    <a
      style={{
        color: props.author === 'them' ? '#263238' : 'white',
        backgroundColor: props.author === 'them' ? '#f4f7f9' : '#39518B'
      }}
      target='blank' className="sc-message--file" href={url} download={fileName}
    >
      {props.author === 'them' && showName ? <p className="sc-message--fileAuthorName">{name}</p> : null}
      {renderFile()}
      <p style={{
        marginTop: 10,
        textAlign: props.author === 'them' ? 'left' : 'right',
        color: props.author === 'them' ? '#263238' : 'white',
      }} className="sc-message--time">{splitDate[splitDate.length - 1]}</p>
    </a>
  );
};

export default FileMessage;
