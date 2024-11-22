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
    data: {
      name: user_created_name,
      text: comment_content,
      date: convertDate,
      avatar,
      userId: created_by,
    },
  };
};

export const converObjectMessageFileData = (data, file) => {
  const { extension, file_path, file_name } = file;
  const {
    comment_id,
    text_align,
    allow_del,
    user_created_name,
    comment_content,
    created_date_view,
    avatar, 
    created_by
  } = data;
  const type = imageExtensions.includes(extension.replace('.', ''))
    ? 'image'
    : 'file';
  return {
    id: comment_id,
    author: text_align === 2 ? 'me' : 'them',
    type: 'file',
    isAllowDelete: allow_del === 1,
    data: {
      name: user_created_name,
      type,
      text: comment_content,
      url: file_path,
      fileName: file_name,
      date: created_date_view,
      avatar,
      userId: created_by,
    },
  };
};
