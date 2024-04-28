
import imageExtensions from '../image-extensions.json';
export class MessageHelper {

    static convertMessageResponseToChatMessage = (payload) => {
      const listMessage = [];
      const { id, user_created_name, avatar, comment_content, created_date_view, fileList } = payload;
      let objMessage = {
        id,
        author: 'them',
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
          const fileMessage = objMessage;
          const { extension, fileUrl, fileName } = fileList[i];
          const type = imageExtensions.includes(extension.replace('.', '')) ? 'image' : 'file';
          objMessage.type = 'file';
          objMessage.data.url = fileUrl;
          objMessage.data.fileName = fileName;
          objMessage.data.type = type;
          listMessage.push(fileMessage);
        }
      } else {
        listMessage.push(objMessage);
      }
      return listMessage;
    }
}
