import { doPostRequest } from './api';

import { ChatHelper } from '../helper/chatHelper';
import {
  converObjectMessageFileData,
  convertObjectMessageData,
} from '../utils/Message';

let objInstanceId = null;
let objId = null;
let userId = null;
let appType = null;
let userName = '';
let userList = [];
let userListInfo = [];
let messageId = '';
let typeOfAction = 'get';
let sessionId = '';
let replyObject = null;

export const setPayloadDefault = (instanceId, oId, user, username, apptype) => {
  objInstanceId = Number(instanceId);
  objId = Number(oId);
  userId = user;
  userName = username;
  appType = apptype;
};

export const requestGetListGroupChat = async (
  keySearch,
  page = 1,
  limit = 10
) => {
  let formdata = new FormData();
  formdata.append('page', page);
  formdata.append('limit', limit);
  formdata.append('key_search', keySearch);
  formdata.append('app_type', appType);
  const response = await doPostRequest('common/comment.do', formdata);
  return response?.data?.itemList ?? [];
};

export const requestGetListFilterResult = async (
  keySearch,
  objectId,
  apiUrl,
  page = 1
) => {
  let formdata = new FormData();
  formdata.append('app_type', appType);
  formdata.append('key_search', keySearch);
  formdata.append('object_id', objectId);
  formdata.append('page', page);
  formdata.append('limit', 20);
  const response = await doPostRequest(apiUrl, formdata);
  if (response.data.result === 'success') {
    return {
      items: response.data.items,
      totalItem: response.data.totalItem,
    };
  }
  return {
    items: [],
    totalItem: 0,
  };
};

export const requestGetListFilterOptions = async () => {
  let formdata = new FormData();
  formdata.append('app_type', appType);
  const response = await doPostRequest('comment/form_search.do', formdata);
  let filterOption = {
    isShow: false,
  };
  let filterInput = {
    isShow: false,
  };
  let submitFormUrl = '';
  if (response.data.result === 'success') {
    const items = response.data.items;
    submitFormUrl = response?.data?.submit_api?.ref_api ?? '';
    const dropdownOtion = items.filter((e) => e.input_type == 'select');
    const filterInputOption = items.filter((e) => e.input_type == 'textbox');

    if (dropdownOtion.length) {
      filterOption = {
        isShow: true,
        options: dropdownOtion[0].options,
        label: dropdownOtion[0].label,
      };
    }

    if (filterInputOption.length) {
      filterInput = {
        isShow: true,
        label: filterInputOption[0].label,
      };
    }
  }
  return {
    filterInput,
    filterOption,
    submitFormUrl,
  };
};

export const requestGetSetting = async () => {
  let formdata = new FormData();
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('app_type', appType);
  formdata.append('mode', 'info');
  const response = await doPostRequest('common/comment.do', formdata);
  if (response.data.result === 'success') {
    userList = response.data.userList.map((e) => {
      return JSON.stringify(e.user_id);
    });

    userListInfo = response.data.userList.map((e) => {
      return e;
    });
  }
  return {
    title: response.data.OBJECT_INSTANCE_NAME,
    isAllowAddNew: response.data.allow_add_new === 1,
    isAllowAttach: response.data.allow_attach === 1,
    url: response.data.OBJECT_INSTANCE_URL,
  };
};

const convertMessageData = (data) => {
  if (!data) return;
  let objectMessage = {};
  const { fileList } = data;
  objectMessage = convertObjectMessageData(data);

  if (fileList && fileList.length) {
    for (const i in fileList) {
      objectMessage = converObjectMessageFileData(data, fileList[i]);
    }
  }
  return objectMessage;
};

export const requestGetListMessage = async (lastId) => {
  sessionId = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(2, 10);
  let index = 1;
  let formdata = new FormData();
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('app_type', appType);
  formdata.append('is_older', 1);
  formdata.append('last_id', lastId ?? '');
  const response = await doPostRequest('common/comment.do', formdata);
  const messageList = [];
  if (response.data.result === 'success') {
    const listMessageResponse = response.data.itemList.reverse();
    for (const i in listMessageResponse) {
      const { fileList, reply } = listMessageResponse[i];
      let objMessage = convertMessageData(listMessageResponse[i]);
      objMessage.index = index;
      objMessage.reply = convertMessageData(reply);

      if (fileList && fileList.length) {
        for (const j in fileList) {
          let fileMessage = converObjectMessageFileData(
            listMessageResponse[i],
            fileList[j]
          );
          fileMessage.index = index;
          fileMessage.reply = convertMessageData(reply);
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
  };
};

export const requestSendIsReadComment = async (
  objId,
  objInstanceId,
  commentId
) => {
  let formdata = new FormData();
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('app_type', appType);
  formdata.append('comment_id', commentId);
  await doPostRequest('comment/read.do', formdata);
  return true;
};

export const requestSendMessage = async (
  comment,
  files,
  allowEdit,
  allowDel
) => {
  const payloadEvent = getTypingPayload();
  let formdata = new FormData();
  formdata.append('ref_id', replyObject ? replyObject.id : '');
  formdata.append('comment_id', messageId);
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('mode', 'submit');
  formdata.append('comment_content', comment);
  formdata.append('FileUpload', files);
  formdata.append('app_type', appType);
  const response = await doPostRequest('common/comment.do', formdata);
  replyObject = null;
  if (messageId) {
    payloadEvent.content = comment;
    payloadEvent.messageId = messageId;
    ChatHelper.sendEditMessageEvent(comment, messageId, allowDel, allowEdit);
    return {
      isSuccess: response.data.result === 'success',
      commentId: response.data.comment_id,
      isAllowDelete: allowDel,
      isAllowEdit: allowEdit,
    };
  } else {
    ChatHelper.sendNewMessageEvent(response.data.commentInfo);
    const allow_del = response.data.commentInfo.allow_del;
    const allow_edit = response.data.commentInfo.allow_edit;
    return {
      isSuccess: response.data.result === 'success',
      commentId: response.data.comment_id,
      isAllowDelete: allow_del == 1,
      isAllowEdit: allow_edit == 1,
    };
  }
};

export const requestDeleteMessage = (id) => {
  const payloadEvent = getTypingPayload();
  payloadEvent.comment_id = id;
  ChatHelper.sendDeleteMessageEvent(payloadEvent);
  let formdata = new FormData();
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('mode', 'delete');
  formdata.append('comment_id', id);
  formdata.append('app_type', appType);
  doPostRequest('common/comment.do', formdata);
};

export const requestGetFiles = async () => {
  let formdata = new FormData();
  formdata.append('file_type', 0);
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('is_order', false);
  formdata.append('app_type', appType);
  const response = await doPostRequest('comment/file.do', formdata);
  const fileList = response?.data?.fileList ?? [];
  return fileList;
};

export const requestReactMessage = (id, react, eventType, user) => {
  const payloadEvent = getTypingPayload();
  (payloadEvent.reactionData = {
    messageId: id,
    reaction: react,
    objectId: objId,
    objectInstanceId: objInstanceId,
  }),
  (payloadEvent.actType = eventType);
  payloadEvent.user = {
    id: user.userId,
    fullname: user.name,
    avatar: user.avatar,
  };

  ChatHelper.sendReactMessageEvent(payloadEvent);
  let formdata = new FormData();
  formdata.append('react', react);
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('comment_id', id);
  formdata.append('app_type', appType);
  formdata.append('act_type', eventType === 'add' ? 1 : -1);
  doPostRequest('comment/reaction.do', formdata);
};

export const setMessageId = (id) => {
  messageId = id;
};

export const setReplyObject = (reply) => {
  replyObject = reply;
};

export const getReplyObject = () => {
  return replyObject;
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
    object_id: Number(objId),
    object_instance_id: Number(objInstanceId),
  };
};

export const getUserIds = () => {
  return userList;
};

export const getSessionId = () => {
  return sessionId;
};

export const getObjId = () => {
  return objId;
};

export const getObjInstanceId = () => {
  return objInstanceId;
};

export const getCurrentUserId = () => {
  return userId;
};

export const getCurrentUserName = () => {
  return userName;
};

export const getUserListInfo = () => {
  return userListInfo;
};
