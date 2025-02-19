import React from 'react';
import Linkify from 'react-linkify';
import { mapFileIcon } from '../../utils/Message';
import VideoIcon from '../../assets/video-icon.png';
import quoteIcon from '../../assets/icon-quote.png';
import downloadIcon from '../../assets/icon_download.png';
import { getCurrentUserId } from '../../services/request';
import { GestureEvent } from '../../utils/Constants';
import ReactPlayer from 'react-player';

const FileMessage = (props) => {
  const { date, type, url, fileName, name, text } = props.data;
  const splitDate = date.split(' ');

  const isVideo = () => {
    return url.includes('.mp4') || fileName.includes('.mp4') || url.includes('.mkv') || fileName.includes('.mkv')
  };

  const renderFile = () => {
    let icon = mapFileIcon(fileName);

    if (type === 'image') {
      return (
        <img className="sc-message--image" alt="image-message" src={url} />
      );
    }
    if (isVideo()) {
      return (
        <div className="sc-message--videoWrap">
          <ReactPlayer
            controls={true}
            style={{ objectFit: 'cover' }}
            height={220}
            width={350}
            url={url}
          />
        </div>
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
        <img
          style={{ marginRight: 5 }}
          alt="fileIcon"
          src={icon}
          height={22}
          width={22}
        />
        {fileName}
      </p>
    );
  };

  const renderReplySection = () => {
    if (!props.reply) return <div />;
    const userId = getCurrentUserId();
    const { data } = props.reply;
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
              <b>{userId != data.userId ? data.name : 'Bạn'}</b>
            </span>
          </div>
          <div className="sc-input--quoteResponseWrap">{renderMessage}</div>
        </div>
      </div>
    );
  };

  const downloadVideo = () => {
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.download = fileName;
    anchor.click();
  };

  const renderVideoInfo = () => {
    if (!isVideo()) return <div />;

    return (
      <div className="sc-message-video-info">
        <img
          style={{ marginRight: 10 }}
          src={VideoIcon}
          height={22}
          width={22}
        />
        <p
          onClick={() => window.open(url, '_blank')}
          style={{
            fontWeight: 500,
            flex: 1,
            cursor: 'pointer',
            paddingRight: 10,
          }}
        >
          {fileName}
        </p>
        <img
          onClick={() => downloadVideo()}
          style={{ cursor: 'pointer' }}
          src={downloadIcon}
          height={26}
          width={26}
        />
      </div>
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
        maxWidth: isVideo() ? 350 : 300,
        cursor: isVideo() ? 'default' : 'pointer',
      }}
      target="blank"
      className="sc-message--file"
      // href={url}
      // download={fileName}
      onClick={() => {
        if (props.data.type == 'image') {
          const event = new CustomEvent(GestureEvent.CLICK_IMAGE);
          event.imageType = 'image';
          event.imageUrl = props.data.url;
          document.dispatchEvent(event);
        } else {
          if (!isVideo()) {
            window.open(url, '_blank');
          }
        }
      }}
    >
      {renderReplySection()}
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
      <Linkify
        className="sc-message--linkify"
        properties={{ target: '_blank' }}
      >
        <p>{text}</p>
      </Linkify>
      {renderFile()}
      {renderVideoInfo()}
      <p
        style={{
          marginTop: 10,
          color: 'black',
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
