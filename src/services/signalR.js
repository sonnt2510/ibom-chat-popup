import * as signalR from "@microsoft/signalr";
import { MessageHelper } from "../helper/messageHelper";
import {
  getCurrentUserId,
  getObjId,
  getObjInstanceId,
  getSessionId,
} from "./request";
import { MessageEvent } from "../utils/Constants";

let _chathubURI = "";
let connection = null;
let _typingState = "ended";
const typingEvent = new CustomEvent("typing");
const newMessageEvent = new CustomEvent(MessageEvent.NEW_MESSAGES);
const editMessageEvent = new CustomEvent(MessageEvent.EDIT_MESSAGE);
const deleteMessageEvent = new CustomEvent(MessageEvent.DELETE_MESSAGE);
const reactMessageEvent = new CustomEvent(MessageEvent.REACT_MESSAGE);

export class ChatHubHelper {
  static _isValidMessage = (data) => {
    console.log("new event", data);
    const objId = getObjId();
    const objInstanceId = getObjInstanceId();
    const isFromList = !objId && !objInstanceId;
    const event = data.event;
    if (!event) {
      return false;
    }
    const sessionId = getSessionId();

    const isSentByThisDevice = data.sentDeviceUID === sessionId;
    switch (event) {
    case MessageEvent.NEW_MESSAGES: {
      const message = data.payload;
      let isValidMessagePayload =
          message &&
          message.comment_id &&
          message.object_id &&
          message.object_instance_id &&
          message.object_id == objId &&
          message.object_instance_id == objInstanceId;
      if (isFromList) {
        isValidMessagePayload = message && message.comment_id;
      }
      return isValidMessagePayload && !isSentByThisDevice;
    }
    case MessageEvent.USER_TYPING: {
      const typingData = data.payload;
      return (
        typingData &&
          typingData.userName &&
          typingData.typingState &&
          !isSentByThisDevice &&
          typingData.object_id == objId &&
          typingData.object_instance_id == objInstanceId
      );
    }

    case MessageEvent.EDIT_MESSAGE: {
      const editEventData = data.payload;
      return editEventData && editEventData.comment_id && !isSentByThisDevice;
    }
    case MessageEvent.DELETE_MESSAGE: {
      const deleteEventData = data.payload;
      return (
        deleteEventData && deleteEventData.comment_id && !isSentByThisDevice
      );
    }
    case MessageEvent.REACT_MESSAGE: {
      const reactEventData = data.payload;
      return (
        reactEventData && reactEventData.comment_id
      );
    }
    }
    return false;
  };

  static _onReceivedMessage = (user, dataString) => {
    const data = JSON.parse(dataString);
    const objId = getObjId();
    const objInstanceId = getObjInstanceId();
    const userId = getCurrentUserId();
    const isFromList = !objId && !objInstanceId;
    if (ChatHubHelper._isValidMessage(data)) {
      const event = data.event;
      switch (event) {
      case MessageEvent.NEW_MESSAGES: {
        const messages = MessageHelper.convertMessageResponseToChatMessage(
          data.payload,
          userId
        );
        newMessageEvent.newMessage = isFromList ? data.payload : messages;
        document.dispatchEvent(newMessageEvent);
        break;
      }

      case MessageEvent.USER_TYPING: {
        const typingData = data.payload;
        typingEvent.typingDetail = {
          typingState: typingData.typingState,
          userName: typingData.userName,
        };
        document.dispatchEvent(typingEvent);
        break;
      }

      case MessageEvent.EDIT_MESSAGE: {
        editMessageEvent.newMessage = data.payload;
        document.dispatchEvent(editMessageEvent);
        break;
      }

      case MessageEvent.DELETE_MESSAGE: {
        deleteMessageEvent.newMessage = data.payload;
        document.dispatchEvent(deleteMessageEvent);
        break;
      }

      case MessageEvent.REACT_MESSAGE: {
        reactMessageEvent.reactMessage = data.payload;
        document.dispatchEvent(reactMessageEvent);
        break;
      }
      }
    }
  };

  static startConnection = (username) => {
    const uri = `${_chathubURI}chatHub?username=${username}`;
    connection = new signalR.HubConnectionBuilder()
      .withUrl(uri)
      .configureLogging(signalR.LogLevel.Debug)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("SignalR connected");
      })
      .catch((error) => {
        console.log("Connect to signalr failed: ", error);
      });

    connection.onclose((error) => {
      if (error) {
        console.error("SignalR close with error: ", error);
      } else {
        console.log("SignalR closed");
      }
    });

    connection.onreconnecting((error) => {
      if (error) {
        console.error("SignalR is reconnecting with error: ", error);
      } else {
        console.log("SignalR is reconnecting");
      }
    });

    connection.onreconnected((error) => {
      if (error) {
        console.error("SignalR is reconnected with error: ", error);
      } else {
        console.log("SignalR is reconncted");
      }
    });

    connection.on("ReceiveMessage", (userId, data) =>
      ChatHubHelper._onReceivedMessage(userId, data)
    );
  };

  static sendMessageToUsers = (userIds, payload) => {
    const connectionHub = ChatHubHelper.getConnectionHub();
    connectionHub
      .invoke("SendMessageToUsers", userIds, JSON.stringify(payload))
      .then(() => {})
      .catch((error) => {
        console.error("Invoke send messages error: ", error);
      });
  };

  static stopConnection = () => {
    connection.off("ReceiveMessage");
    connection.stop();
  };

  static storeChatHubURI = (uri) => {
    _chathubURI = uri;
  };

  static setTypingState = (state) => {
    _typingState = state;
  };

  static getTypingState = () => {
    return _typingState;
  };

  static getConnectionHub = () => {
    return connection;
  };
}
