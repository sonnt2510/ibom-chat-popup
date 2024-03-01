import { doPostRequest } from './api';
import imageExtensions from '../image-extensions.json';

import { ChatHelper } from '../helper/chatHelper';

let objInstanceId = null;
let objId = null;
let userId = null;
let userName = '';
let userList = [];
let messageId = '';
let typeOfAction = 'get';
let sessionId = '';

export const setPayloadDefault = (instanceId, oId, user, username) => {
  objInstanceId = instanceId;
  objId = oId;
  userId = user;
  userName = username;
};

export const requestGetListMessage = async (lastId) => {
  sessionId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
  let index = 1;
  let formdata = new FormData();
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('app_type', 1);
  formdata.append('is_older', 1);
  formdata.append('last_id', lastId);
  const response = await doPostRequest('common/comment.do', formdata);
  const messageList = [];
  if (response.data.result === 'success') {
    const listMessageResponse = response.data.itemList.reverse();
    userList = response.data.userList.map(e => {
      return JSON.stringify(e.user_id);
    });
    for (const i in listMessageResponse) {
      const { created_by, comment_content, created_date_view, avatar, fileList, user_created_name, comment_id } = listMessageResponse[i];
      let objMessage = {
        index,
        id: comment_id,
        author: created_by === userId ? 'me' : 'them',
        type: 'text',
        data: {
          name: user_created_name,
          text: comment_content,
          date: created_date_view,
          avatar
        }
      };

      if (fileList.length) {
        for (const i in fileList) {
          const { extension, file_path, file_name } = fileList[i];
          const type = imageExtensions.includes(extension.replace('.', '')) ? 'image' : 'file';
          const fileMessage = {
            index,
            id: comment_id,
            author: created_by === userId ? 'me' : 'them',
            type: 'file',
            data: {
              name: user_created_name,
              type,
              url: file_path,
              fileName: file_name,
              date: created_date_view,
              avatar
            }
          };
          messageList.push(fileMessage);
          index++;
        }
      } else {
        if (objMessage.data.text) {
          index++;
          messageList.push(objMessage);
        }
      }
    }
  }
  return {
    list: messageList,
    title: response.data.OBJECT_INSTANCE_NAME,
  };
};

export const requestSendMessage = async (comment, files) => {
  const payloadEvent = getTypingPayload();
  let formdata = new FormData();
  formdata.append('comment_id', messageId);
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('mode', 'submit');
  formdata.append('comment_content', comment);
  formdata.append('FileUpload', files);
  formdata.append('app_type', 1);
  const response = await doPostRequest('common/comment.do', formdata);
  if (messageId) {
    payloadEvent.content = comment;
    payloadEvent.messageId = messageId;
    ChatHelper.sendEditMessageEvent(comment, messageId);
  } else {
    ChatHelper.sendNewMessageEvent(response.data.commentInfo);
  }
  return {
    isSuccess: response.data.result === 'success',
    commentId: response.data.comment_id
  };
};

export const requestDeleteMessage = (id) => {
  const payloadEvent = getTypingPayload();
  payloadEvent.messageId = id;
  ChatHelper.sendDeleteMessageEvent(payloadEvent);
  let formdata = new FormData();
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('mode', 'delete');
  formdata.append('comment_id', id);
  formdata.append('app_type', 1);
  doPostRequest('common/comment.do', formdata);
};

export const setMessageId = (id) => {
  messageId = id;
};

export const getMessageId = () => {
  return messageId;
};

export const getTypeOfAction = () => {
  return typeOfAction;
};

export const setTypeOfAction = (type) => {
  typeOfAction = type;
};

export const getTypingPayload = () => {
  return {
    userName,
    objectId: Number(objId),
    objectInstanceId: Number(objInstanceId)
  };
};

export const getUserIds = () => {
  return userList;
};

export const getSessionId = () => {
  return sessionId;
};

