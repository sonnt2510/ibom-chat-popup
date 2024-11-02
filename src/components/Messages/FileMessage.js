import React from 'react';
import FileIcon from '../../assets/icon_files.png';
import ExcelIcon from '../../assets/icon_excel.png';
import PDFIcon from '../../assets/icon_pdf.png';
import WordIcon from '../../assets/icon_word.png';
import ZipIcon from '../../assets/icon_zip.png';

const FileMessage = (props) => {
  const { date, type, url, fileName, name } = props.data;
  const splitDate = date.split(' ');
  const renderFile = () => {
    let icon = FileIcon;

    if (type === 'image') {
      return (
        <img className="sc-message--image" alt="image-message" src={url} />
      );
    }

    if (url) {
      if (url.includes('.xls') || url.includes('.xlsx')) {
        icon = ExcelIcon;
      } else if (url.includes('.pdf')) {
        icon = PDFIcon;
      } else if (url.includes('.docx') || url.includes('.doc')) {
        icon = WordIcon;
      } else if (url.includes('.zip')) {
        icon = ZipIcon;
      }
    }

    return (
      <p
        style={{
          display: 'flex',
          gap: 5,
          marginTop: type !== 'image' && !props.showName ? 15 : 0,
        }}
      >
        <img
          style={{ marginRight: 5 }}
          alt="fileIcon"
          src={icon}
          height={22}
          width={22}
        />
        {fileName}
      </p>
    );
  };

  return (
    <a
      style={{
        color: props.author === 'them' ? '#263238' : 'black',
        backgroundColor: props.author === 'them' ? '#f4f7f9' : '#E5EFFF',
        paddingBottom: 20,
        paddingLeft: type === 'image' ? 0 : 15,
        paddingRight: type === 'image' ? 0 : 15,
      }}
      target="blank"
      className="sc-message--file"
      // href={url}
      // download={fileName}
      onClick={() => {
        window.open(url, '_blank');
      }}
    >
      {props.author === 'them' && props.showName ? (
        <p
          style={{
            marginLeft:
              type === 'image' && props.author === 'them' && props.showName
                ? 15
                : 0,
          }}
          className="sc-message--fileAuthorName"
        >
          {name}
        </p>
      ) : null}
      {renderFile()}
      <p
        style={{
          marginTop: 10,
          textAlign: props.author === 'them' ? 'left' : 'right',
          color: 'black',
          marginRight: type === 'image' ? 15 : 0,
          marginLeft: type === 'image' ? 15 : 0,
        }}
        className="sc-message--time"
      >
        {splitDate[splitDate.length - 1]}
      </p>
    </a>
  );
};

export default FileMessage;
