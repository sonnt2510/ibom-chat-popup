import React from "react";
import Linkify from "react-linkify";
import { mapFileIcon } from "../../utils/Message";
import quoteIcon from '../../assets/icon-quote.png';
import { getCurrentUserId } from "../../services/request";

const FileMessage = (props) => {
  const { date, type, url, fileName, name, text } = props.data;
  const splitDate = date.split(" ");
  const renderFile = () => {
    let icon = mapFileIcon(fileName);

    if (type === "image") {
      return (
        <img className="sc-message--image" alt="image-message" src={url} />
      );
    }

    return (
      <p
        style={{
          display: "flex",
          gap: 5,
          marginTop: type !== "image" && !props.showName ? 15 : 0,
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
    const { comment_content, user_created_name, created_by } = props.reply;

    let renderMessage = (
      <span className="sc-input--replyName">{comment_content}</span>
    );

    if (data.type == "image") {
      renderMessage = <img src={data.url} className="sc-input--quoteImage" />;
    }

    if (data.type == "file") {
      renderMessage = (
        <span
          className="sc-input--replyName"
          style={{
            display: "flex",
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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="sc-input--replyName">
              <img
                className="sc-input--quoteIcon"
                alt="quote-message"
                src={quoteIcon}
              />
              <b>{userId !== created_by ? user_created_name : "Bạn"}</b>
            </span>
          </div>
          <div className="sc-input--quoteResponseWrap">{renderMessage}</div>
        </div>
      </div>
    );
  };

  return (
    <a
      style={{
        color: props.author === "them" ? "#263238" : "black",
        backgroundColor: props.author === "them" ? "#f4f7f9" : "#E5EFFF",
        paddingBottom: 20,
        paddingLeft: type === "image" ? 0 : 15,
        paddingRight: type === "image" ? 0 : 15,
      }}
      target="blank"
      className="sc-message--file"
      // href={url}
      // download={fileName}
      onClick={() => {
        window.open(url, "_blank");
      }}
    >
      {props.author === "them" && props.showName ? (
        <p
          style={{
            marginLeft:
              type === "image" && props.author === "them" && props.showName
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
        properties={{ target: "_blank" }}
      >
        <p>{text}</p>
      </Linkify>
      {renderFile()}
      <p
        style={{
          marginTop: 10,
          color: "black",
          marginRight: type === "image" ? 15 : 0,
          marginLeft: type === "image" ? 15 : 0,
        }}
        className="sc-message--time"
      >
        {splitDate[splitDate.length - 1]}
      </p>
    </a>
  );
};

export default FileMessage;
