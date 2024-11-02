import { getSessionId, getTypingPayload, getUserIds } from '../services/request';
import { ChatHubHelper } from '../services/signalR';
import { MessageEvent } from '../utils/Constants';

export class ChatHelper {
  static sendTypingEvent = (typingState) => {
    let payloadData = getTypingPayload();
    payloadData.typingState = typingState;
    if (ChatHubHelper.getTypingState() !== typingState) {
      ChatHubHelper.sendMessageToUsers(getUserIds(), {
        event: MessageEvent.USER_TYPING,
        sentDeviceUID: getSessionId(),
        payload: payloadData
      });
    }
  }

  static sendEditMessageEvent = (content, messageId, allowDel, allowEdit) => {
    let payloadData = getTypingPayload();
    payloadData.content = content;
    payloadData.comment_id = messageId;
    payloadData.allow_del = allowDel;
    payloadData.allow_edit = allowEdit;
    ChatHubHelper.sendMessageToUsers(getUserIds(), {
      event: MessageEvent.EDIT_MESSAGE,
      payload: payloadData,
      sentDeviceUID: getSessionId(),
    });
    console.info('Send edit message event: ', payloadData);
  };

  static sendDeleteMessageEvent = (payload) => {
    ChatHubHelper.sendMessageToUsers(getUserIds(), {
      event: MessageEvent.DELETE_MESSAGE,
      payload,
      sentDeviceUID: getSessionId(),
    });
    console.info('Send delete message event: ', payload);
  };

  static sendNewMessageEvent = (payload) => {
    ChatHubHelper.sendMessageToUsers(getUserIds(), {
      event: MessageEvent.NEW_MESSAGES,
      payload,
      sentDeviceUID: getSessionId(),
    });
    console.info('Send new message event: ', payload);
  };

  static sendReactMessageEvent = (payload) => {
    ChatHubHelper.sendMessageToUsers(getUserIds(), {
      event: MessageEvent.REACT_MESSAGE,
      payload,
      sentDeviceUID: getSessionId(),
    });
    console.info('Send react message event: ', payload);
  };

}
