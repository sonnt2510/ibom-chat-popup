import * as signalR from '@microsoft/signalr';
import { MessageHelper } from '../helper/messageHelper';
import { getObjId, getObjInstanceId, getSessionId } from './request';

let _chathubURI = '';
let connection = null;
let _typingState = 'ended';
const typingEvent = new CustomEvent('typing');
const newMessageEvent = new CustomEvent('new-messages');
const editMessageEvent = new CustomEvent('edit-message');
const deleteMessageEvent = new CustomEvent('delete-message');

export class ChatHubHelper {
  static _isValidMessage = (data) => {
    console.log('new event', data);
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
    case 'new-messages': {
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
    case 'user-typing': {
      const typingData = data.payload;
      return (
        typingData &&
          typingData.userName &&
          typingData.typingState &&
          !isSentByThisDevice &&
          typingData.objectId == objId &&
          typingData.objectInstanceId == objInstanceId
      );
    }

    case 'edit-message': {
      const editEventData = data.payload;
      return editEventData && editEventData.messageId && !isSentByThisDevice;
    }
    case 'delete-message': {
      const deleteEventData = data.payload;
      return (
        deleteEventData && deleteEventData.messageId && !isSentByThisDevice
      );
    }
    }
    return false;
  };

  static _onReceivedMessage = (user, dataString) => {
    const data = JSON.parse(dataString);
    const objId = getObjId();
    const objInstanceId = getObjInstanceId();
    const isFromList = !objId && !objInstanceId;
    if (ChatHubHelper._isValidMessage(data)) {
      const event = data.event;
      switch (event) {
      case 'new-messages': {
        const messages = MessageHelper.convertMessageResponseToChatMessage(
          data.payload
        );
        newMessageEvent.newMessage = isFromList ? data.payload : messages;
        document.dispatchEvent(newMessageEvent);
        break;
      }

      case 'user-typing': {
        const typingData = data.payload;
        typingEvent.typingDetail = {
          typingState: typingData.typingState,
          userName: typingData.userName,
        };
        document.dispatchEvent(typingEvent);
        break;
      }
      case 'edit-message': {
        editMessageEvent.message = data.payload;
        document.dispatchEvent(editMessageEvent);
        break;
      }

      case 'delete-message': {
        deleteMessageEvent.message = data.payload;
        document.dispatchEvent(deleteMessageEvent);
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
        console.log('SignalR connected');
      })
      .catch((error) => {
        console.log('Connect to signalr failed: ', error);
      });

    connection.onclose((error) => {
      if (error) {
        console.error('SignalR close with error: ', error);
      } else {
        console.log('SignalR closed');
      }
    });

    connection.onreconnecting((error) => {
      if (error) {
        console.error('SignalR is reconnecting with error: ', error);
      } else {
        console.log('SignalR is reconnecting');
      }
    });

    connection.onreconnected((error) => {
      if (error) {
        console.error('SignalR is reconnected with error: ', error);
      } else {
        console.log('SignalR is reconncted');
      }
    });

    connection.on('ReceiveMessage', (userId, data) =>
      ChatHubHelper._onReceivedMessage(userId, data)
    );
  };

  static sendMessageToUsers = (userIds, payload) => {
    const connectionHub = ChatHubHelper.getConnectionHub();
    connectionHub
      .invoke('SendMessageToUsers', userIds, JSON.stringify(payload))
      .then(() => {})
      .catch((error) => {
        console.error('Invoke send messages error: ', error);
      });
  };

  static stopConnection = () => {
    connection.off('ReceiveMessage');
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
