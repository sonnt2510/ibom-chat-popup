import { doPostRequest } from './api';
import imageExtensions from '../image-extensions.json';

import { ChatHelper } from '../helper/chatHelper';

let objInstanceId = null;
let objId = null;
let userId = null;
let appType = null;
let userName = '';
let userList = [];
let messageId = '';
let typeOfAction = 'get';
let sessionId = '';

export const setPayloadDefault = (instanceId, oId, user, username, apptype) => {
  objInstanceId = instanceId;
  objId = oId;
  userId = user;
  userName = username;
  appType = apptype;
};

export const requestGetListGroupChat = async (keySearch) => {
  const page = 1;
  const limit = 50;
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
  }
  return {
    title: response.data.OBJECT_INSTANCE_NAME,
    isAllowAddNew: response.data.allow_add_new === 1,
    isAllowAttach: response.data.allow_attach === 1,
    url: response.data.OBJECT_INSTANCE_URL,
  };
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
      const {
        comment_content,
        created_date_view,
        avatar,
        fileList,
        user_created_name,
        comment_id,
        text_align,
        allow_del,
        allow_edit,
      } = listMessageResponse[i];
      let objMessage = {
        index,
        id: comment_id,
        author: text_align === 2 ? 'me' : 'them',
        type: 'text',
        isAllowDelete: allow_del === 1,
        isAllowEdit: allow_edit === 1,
        data: {
          name: user_created_name,
          text: comment_content,
          date: created_date_view,
          avatar,
        },
      };

      if (fileList.length) {
        for (const i in fileList) {
          const { extension, file_path, file_name } = fileList[i];
          const type = imageExtensions.includes(extension.replace('.', ''))
            ? 'image'
            : 'file';
          const fileMessage = {
            index,
            id: comment_id,
            author: text_align === 2 ? 'me' : 'them',
            type: 'file',
            isAllowDelete: allow_del === 1,
            data: {
              name: user_created_name,
              type,
              url: file_path,
              fileName: file_name,
              date: created_date_view,
              avatar,
            },
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
  };
};

export const requestSendIsReadComment = async (objId, objInstanceId) => {
  let formdata = new FormData();
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('app_type', appType);
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
  formdata.append('comment_id', messageId);
  formdata.append('object_instance_id', objInstanceId);
  formdata.append('object_id', objId);
  formdata.append('mode', 'submit');
  formdata.append('comment_content', comment);
  formdata.append('FileUpload', files);
  formdata.append('app_type', appType);
  const response = await doPostRequest('common/comment.do', formdata);
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
