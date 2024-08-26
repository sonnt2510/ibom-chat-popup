import React from 'react';
import FileIcon from './../icons/FileIcon';

const FileMessage = (props) => {
  const { date, type, url, fileName, name, showName } = props.data;

  const splitDate = date.split(' ');
  const renderFile = () => {
    if (type === 'image') {
      return (
        <img className="sc-message--image" alt="image-message" src={url} />
      );
    }
    return (
      <p
        style={{
          display: 'flex',
          gap: 5,
          marginTop: type !== 'image' && !props.showName ? 15 : 0,
        }}
      >
        <FileIcon />
        {fileName}
      </p>
    );
  };

  return (
    <a
      style={{
        color: props.author === 'them' ? '#263238' : 'black',
        backgroundColor: props.author === 'them' ? '#f4f7f9' : '#E5EFFF',
        paddingBottom: 20,
        paddingLeft: type === 'image' ? 0 : 15,
        paddingRight: type === 'image' ? 0 : 15,
      }}
      target="blank"
      className="sc-message--file"
      href={url}
      download={fileName}
    >
      {props.author === 'them' && props.showName ? (
        <p
          style={{
            marginLeft:
              type === 'image' && props.author === 'them' && props.showName
                ? 15
                : 0,
          }}
          className="sc-message--fileAuthorName"
        >
          {name}
        </p>
      ) : null}
      {renderFile()}
      <p
        style={{
          marginTop: 10,
          textAlign: props.author === 'them' ? 'left' : 'right',
          color: props.author === 'them' ? '#263238' : 'black',
          marginRight: type === 'image' ? 15 : 0,
          marginLeft: type === 'image' ? 15 : 0,
        }}
        className="sc-message--time"
      >
        {splitDate[splitDate.length - 1]}
      </p>
    </a>
  );
};

export default FileMessage;
