import { getSessionId, getTypingPayload, getUserIds } from '../services/request';
import { ChatHubHelper } from '../services/signalR';

export class ChatHelper {
  static sendTypingEvent = (typingState) => {
    let payloadData = getTypingPayload();
    payloadData.typingState = typingState;
    if (ChatHubHelper.getTypingState() !== typingState) {
      ChatHubHelper.sendMessageToUsers(getUserIds(), {
        event: 'user-typing',
        sentDeviceUID: getSessionId(),
        payload: payloadData
      });
    }
  }

  static sendEditMessageEvent = (content, messageId) => {
    let payloadData = getTypingPayload();
    payloadData.content = content;
    payloadData.messageId = messageId;
    ChatHubHelper.sendMessageToUsers(getUserIds(), {
      event: 'edit-message',
      payload: payloadData,
      sentDeviceUID: getSessionId(),
    });
    console.info('Send edit message event: ', payloadData);
  };

  static sendDeleteMessageEvent = (payload) => {
    ChatHubHelper.sendMessageToUsers(getUserIds(), {
      event: 'delete-message',
      payload,
      sentDeviceUID: getSessionId(),
    });
    console.info('Send delete message event: ', payload);
  };

  static sendNewMessageEvent = (payload) => {
    ChatHubHelper.sendMessageToUsers(getUserIds(), {
      event: 'new-messages',
      payload,
      sentDeviceUID: getSessionId(),
    });
    console.info('Send new message event: ', payload);
  };
}
