import FileIcon from '../assets/icon_files.png';
import ExcelIcon from '../assets/icon_excel.png';
import PDFIcon from '../assets/icon_pdf.png';
import WordIcon from '../assets/icon_word.png';
import ZipIcon from '../assets/icon_zip.png';
import moment from 'moment';
import imageExtensions from '../image-extensions.json';

export const mapFileIcon = (fileName) => {
  let icon = FileIcon;
  if (fileName) {
    if (fileName.includes('.xls') || fileName.includes('.xlsx')) {
      icon = ExcelIcon;
    } else if (fileName.includes('.pdf')) {
      icon = PDFIcon;
    } else if (fileName.includes('.docx') || fileName.includes('.doc')) {
      icon = WordIcon;
    } else if (fileName.includes('.zip')) {
      icon = ZipIcon;
    }
  }
  return icon;
};

export const convertObjectMessageData = (data) => {
  const {
    comment_content,
    created_date_view,
    avatar,
    user_created_name,
    comment_id,
    text_align,
    allow_del,
    allow_edit,
    reaction,
    created_by,
    reply,
    comment_type,
    bg_color
  } = data;

  const convertDate = moment(created_date_view, 'DD/MM/YYYY hh:mmA').format(
    'DD/MM/YYYY hh:mmA'
  );
  return {
    id: comment_id,
    author: text_align === 2 ? 'me' : 'them',
    type: 'text',
    isAllowDelete: allow_del === 1,
    isAllowEdit: allow_edit === 1,
    reaction,
    reply,
    commentType: comment_type,
    bgColor: bg_color,
    data: {
      name: user_created_name,
      text: comment_content,
      date: convertDate,
      avatar,
      userId: created_by,
    },
  };
};

export const converObjectMessageFileData = (data, file, position) => {
  const { extension, file_path, file_name, file_id } = file;
  const {
    comment_id,
    text_align,
    allow_del,
    user_created_name,
    comment_content,
    created_date_view,
    avatar,
    created_by,
  } = data;
  const type = imageExtensions.includes(extension.replace('.', ''))
    ? 'image'
    : 'file';
  return {
    id: comment_id,
    author: text_align === 2 ? 'me' : 'them',
    type: 'file',
    isAllowDelete: allow_del === 1,
    fileId: file_id,
    extension,
    data: {
      name: user_created_name,
      type,
      text: position == 0 ? comment_content : '',
      url: file_path,
      fileName: file_name,
      date: created_date_view,
      avatar,
      userId: created_by,
    },
  };
};

export const getDateText = (fullDateMessage) => {
  const dateMessage = fullDateMessage.split(' ')[0];
  const timeMessage = fullDateMessage.split(' ')[1];

  const date = moment(dateMessage, 'DD/MM/YYYY');

  const nowDay = moment().date();
  const nowMonth = moment().month() + 1;
  const nowYear = moment().year();

  const messageDay = moment(date).date();
  const messageMonth = moment(date).month() + 1;
  const messageYear = moment(date).year();

  if (
    nowDay === messageDay &&
    nowMonth === messageMonth &&
    nowYear === messageYear
  ) {
    return `Hôm nay lúc ${timeMessage}`;
  } else if (
    nowDay === messageDay &&
    (nowMonth - 1) === messageMonth &&
    nowYear === messageYear
  ) {
    return `Hôm qua lúc ${timeMessage}`;
  }

  return '';
};
