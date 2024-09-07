
import imageExtensions from '../image-extensions.json';
export class MessageHelper {

    static convertMessageResponseToChatMessage = (payload, currentUserId) => {

      const listMessage = [];
      const { user_created_name, avatar, comment_content, 
        created_date_view, fileList, comment_id, allow_del,
        allow_edit,
        created_by
      } = payload;
      let objMessage = {
        id: comment_id,
        author: currentUserId == created_by ? 'me' : 'them',
        type: 'text',
        isAllowDelete: allow_del === 1,
        isAllowEdit: allow_edit === 1,
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
          const { extension, file_path, file_name } = fileList[i];
          const type = imageExtensions.includes(extension.replace('.', '')) ? 'image' : 'file';
          objMessage.type = 'file';
          objMessage.data.url = file_path;
          objMessage.data.fileName = file_name;
          objMessage.data.type = type;
          listMessage.push(fileMessage);
        }
      } else {
        listMessage.push(objMessage);
      }
      return listMessage;
    }
}
