import { converObjectMessageFileData, convertObjectMessageData } from '../utils/Message';
export class MessageHelper {

    static convertMessageResponseToChatMessage = (payload, currentUserId) => {
      const {reply, fileList, created_by} = payload;
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

      const listMessage = [];
      let objMessage = convertMessageData(payload);
      objMessage.reply = convertMessageData(reply);
      objMessage.author = currentUserId == created_by ? 'me' : 'them';

      if (fileList && fileList.length) {
        for (const i in fileList) {
          let fileMessage = converObjectMessageFileData(payload, fileList[i]);
          fileMessage.reply = convertMessageData(reply);
          fileMessage.author = currentUserId == created_by ? 'me' : 'them';
          listMessage.push(fileMessage);
        }
      } else {
        if (objMessage.data.text) {
          listMessage.push(objMessage);
        }
      }
      return listMessage;
    }
}
