import React, { Component } from 'react';
import './styles';
import './styles/base.css';
import moment from 'moment';
import {
  requestGetListMessage,
  setMessageId,
  getMessageId,
  requestSendMessage,
  requestDeleteMessage,
  setTypeOfAction,
  requestGetSetting,
  setReplyObject,
  getReplyObject,
  requestGetFiles,
  requestGetImages,
  getListFiles,
  setListFiles,
} from './services/request';
import { ChatHubHelper } from './services/signalR';
import UserInputHelper from './helper/userInputHelper';
import fileIcon from './assets/file-icon.png';
import ChatWindow from './components/ChatWindow';
import { GestureEvent, MessageEvent, TypeOfAction } from './utils/Constants';
import { blobToData } from './utils/Message';
import PreviewImageSection from './PreviewImageSection';
import ListFowardSection from './ListForwardSection';

class PopupChat extends Component {
  dragCounter;
  constructor() {
    super();
    this.state = {
      messageList: [],
      isOpen: true,
      loading: true,
      roomName: '',
      isLoadMore: false,
      isAllowAddNew: false,
      isAllowAttach: false,
      url: '',
      canLoadMore: true,
      fileList: [],
      dragging: false,
    };
  }

  setupData() {
    const { objInstanceId, objId } = this.props;
    if (objInstanceId && objId) {
      this._getListMessage();
      this._getInfo();
      this._getListFiles();
      document.addEventListener(
        MessageEvent.NEW_MESSAGES,
        (e) => this.handleNewMessageListener(e),
        false
      );
      document.addEventListener(
        MessageEvent.EDIT_MESSAGE,
        (e) => this.handleEditDeleteMessageListener(e, 'edit'),
        false
      );
      document.addEventListener(
        MessageEvent.DELETE_MESSAGE,
        (e) => this.handleEditDeleteMessageListener(e, 'delete'),
        false
      );
      document.addEventListener(
        MessageEvent.REACT_MESSAGE,
        (e) => this.handleReactMessageListener(e, 'react'),
        false
      );
    } else {
      this.setState({ loading: false });
    }
  }

  handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({ dragging: true });
    }
  };

  handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter--;
    if (this.dragCounter > 0) return;
    this.setState({ dragging: false });
  };

  handleDrop = async (e) => {
    const dragAndDrop = new CustomEvent(GestureEvent.DRAG_AND_DROP);
    var files = Array.from(e.dataTransfer.files);
    e.preventDefault();
    e.stopPropagation();

    this.setState({ dragging: false });
    if (files && files.length > 0) {
      for (const i in files) {
        files[i].path = await blobToData(files[i]);
      }
      const getFiles = getListFiles();
      const combineList = [...getFiles, ...files];
      if (combineList.length > 7) {
        alert('Tối đa 7 ảnh/files');
        return;
      }
      setListFiles(combineList);
      document.dispatchEvent(dragAndDrop);
      e.dataTransfer.clearData();
      this.dragCounter = 0;
    }
  };

  componentDidMount() {
    moment.locale('en');
    setTimeout(() => {
      this.setupData();
    }, 300);

    if (this.dropRef) {
      this.dragCounter = 0;
      let div = this.dropRef;
      div.addEventListener('dragenter', this.handleDragIn);
      div.addEventListener('dragleave', this.handleDragOut);
      div.addEventListener('dragover', this.handleDrag);
      div.addEventListener('drop', this.handleDrop);
    }
  }

  componentWillUnmount() {
    let div = this.dropRef;
    div.removeEventListener('dragenter', this.handleDragIn);
    div.removeEventListener('dragleave', this.handleDragOut);
    div.removeEventListener('dragover', this.handleDrag);
    div.removeEventListener('drop', this.handleDrop);
  }

  handleReactMessageListener(e) {
    const message = e.reactMessage;
    const { reactionData, user } = message;
    const { messageList } = this.state;
    const index = messageList.findIndex((e) => e.id == reactionData.messageId);
    if (index > 0) {
      const reactionMessage = messageList[index].reaction;
      const reactObj = {
        avatar: user.avatar,
        react: reactionData.reaction,
        user_sent_id: user.id,
        user_sent_name: user.fullname,
      };
      if (reactionMessage && reactionMessage.length) {
        const findUserIndex = reactionMessage.findIndex(
          (e) => e.user_sent_id == user.id
        );
        if (findUserIndex >= 0) {
          if (message.actType === 'add') {
            messageList[index].reaction[findUserIndex].react =
              reactionData.reaction;
          } else {
            messageList[index].reaction.splice(findUserIndex, 1);
          }
        } else {
          messageList[index].reaction.push(reactObj);
        }
      } else {
        messageList[index].reaction = [reactObj];
      }
      this.setState({ messageList });
    }
  }

  handleNewMessageListener(e) {
    // const currentUserId = getCurrentUserId();
    // const rawMessage = e.rawMessage;
    // if (currentUserId != rawMessage.created_by) {
    //   window.parent.postMessage(rawMessage, '*');
    // }
    window.parent.postMessage('NEW_MESSAGE', '*');
    setTypeOfAction(TypeOfAction.ADD);

    if (e.newMessage[0].type == 'file') {
      const { data, fileId, extension } = e.newMessage[0];
      const fileObj = [
        {
          created_date: data.date,
          file_id: fileId,
          file_name: data.fileName,
          file_path: data.url,
          user_created_name: data.name,
          extension,
        },
      ];
      this.setState({ fileList: [...fileObj, ...this.state.fileList] });
    }

    this.setState({
      messageList: [...this.state.messageList, ...e.newMessage],
    });
  }

  handleEditDeleteMessageListener(e, type) {
    const message = e.newMessage;
    const { messageList, fileList } = this.state;
    const index = messageList.findIndex(
      (e) => e.id == (message.comment_id || message.messageId)
    );
    if (index > 0) {
      if (type === 'edit') {
        messageList[index].data.text = message.content;
      } else {
        const messageItem = messageList[index];
        if (messageItem && messageItem.type === 'file') {
          const fileIndex = fileList.findIndex(
            (e) => e.file_id == messageItem.fileId
          );
          fileList.splice(fileIndex, 1);
        }
        messageList.splice(index, 1);
      }
      this.setState({ messageList, fileList });
    }
  }

  async _getListFiles() {
    const response = await Promise.all([requestGetFiles(), requestGetImages()]);
    this.setState({ fileList: [...response[0], ...response[1]] });
  }

  async _getInfo() {
    const response = await requestGetSetting();
    this.setState({
      roomName: response ? response.title : '',
      isAllowAddNew: response ? response.isAllowAddNew : false,
      isAllowAttach: response ? response.isAllowAttach : false,
      url: response ? response.url : '',
    });
  }

  async _getListMessage() {
    const response = await requestGetListMessage();
    ChatHubHelper.startConnection(this.props.userId);
    this.setState({
      messageList: response ? response.list : [],
      loading: false,
    });
  }

  async _onMessageWasSent(message) {
    const { messageList } = this.state;
    const messageId = getMessageId();
    if (messageId) {
      const findIndex = messageList.findIndex((e) => e.id === messageId);
      messageList[findIndex].id = '';
      messageList[findIndex].data.text = message.data.text;
      this.setState({ messageList }, () => {
        this._mapIdAfterResponse(
          message.data.text,
          messageList[findIndex].index,
          messageId,
          [],
          messageList[findIndex].isAllowEdit,
          messageList[findIndex].isAlowDel
        );
      });
    } else {
      const messageText = message.data.text;
      const listFiles = getListFiles();
      if (messageText && messageText.length) {
        let replyObject = getReplyObject();
        setTypeOfAction(TypeOfAction.ADD);
        const index = messageList.length + 1;
        message.id = null;
        message.index = index;
        message.data.date = moment().format('DD/MM/YYYY hh:mmA');
        message.reply = replyObject;
        this.setState(
          {
            messageList: messageList.push(message)
          },
          () => {
            this._mapIdAfterResponse(message.data.text, index);
          }
        );
      }
      this._onFilesSelected(listFiles);
    }
  }

  _mapIdAfterResponse = async (
    message,
    index,
    propsId,
    files,
    allowEdit,
    allowDel
  ) => {
    const response = await requestSendMessage(
      message,
      files,
      allowEdit,
      allowDel
    );
    if (response.isSuccess) {
      const fileList = response.commentInfo.fileList;
      const id = response.commentId || propsId;
      const listAssign = Object.assign([], this.state.messageList);
      const findIndex = listAssign.findIndex((e) => e.index === index);
      if (findIndex > 0) {
        listAssign[findIndex].id = id;
        listAssign[findIndex].isAllowEdit = response.isAllowEdit == 1;
        listAssign[findIndex].isAllowDelete = response.isAllowEdit == 1;
        this.setState({ messageList: listAssign });
        setMessageId('');
        if (fileList && fileList.length > 0) {
          this.setState({ fileList: [...fileList, ...this.state.fileList] });
          listAssign[findIndex].fileId = fileList[0].file_id;
        }
      }
    }
  };

  _onFilesSelected(fileList) {
    const currentLength = this.state.messageList.length;
    const arrayFile = [];
    for (const i in fileList) {
      const fileType = fileList[i].type.includes('image') ? 'image' : 'file';
      const index = currentLength + i + 1;
      const objFile = {
        id: null,
        index,
        type: 'file',
        author: 'me',
        data: {
          url: window.URL.createObjectURL(fileList[i]),
          fileName: fileList[i].name,
          date: moment().format('DD/MM/YYYY hh:mmA'),
          type: fileType,
        },
      };
      arrayFile.push(objFile);
    }

    this.setState(
      {
        messageList: [...this.state.messageList, ...arrayFile],
      },
      () => {
        const reverse = fileList.reverse();
        for (const i in reverse) {
          this._mapIdAfterResponse('', currentLength + i + 1, '', reverse[i]);
        }
      }
    );
  }

  async copyToClipboard(textToCopy) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'absolute';
      textArea.style.left = '-999999px';

      document.body.prepend(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
      } catch (error) {
        console.error(error);
      } finally {
        textArea.remove();
      }
    }
  }

  optionClick = (message, type) => {
    if (type === 'copy') {
      this.copyToClipboard(message.data.text);
    } else if (type === 'edit') {
      setTypeOfAction(TypeOfAction.EDIT);
      UserInputHelper.setText(message.data.text);
      setMessageId(message.id);
      const editMessage = new CustomEvent(MessageEvent.EDIT_MY_MESSAGE);
      document.dispatchEvent(editMessage);
    } else if (type === 'delete') {
      setTypeOfAction(TypeOfAction.DELETE);
      requestDeleteMessage(message.id);
      this._handleDeteleMessage(message.id);
    } else if (type === 'reply') {
      setReplyObject(message);
      setTypeOfAction(TypeOfAction.REPLY);
      const replyEvent = new CustomEvent(MessageEvent.REPLY_MESSAGE);
      const replyObject = message;
      replyEvent.replyObject = replyObject;
      document.dispatchEvent(replyEvent);
    } else if (type === 'foward') {
      const fowardMessage = new CustomEvent(MessageEvent.FOWARD_MESSAGE);
      fowardMessage.message = message;
      document.dispatchEvent(fowardMessage);
    }
  };

  _handleDeteleMessage = (id) => {
    const { messageList, fileList } = this.state;
    const index = messageList.findIndex((e) => e.id === id);

    const messageItem = messageList[index];
    if (messageItem && messageItem.type === 'file') {
      const fileIndex = fileList.findIndex(
        (e) => e.file_id == messageItem.fileId
      );
      fileList.splice(fileIndex, 1);
    }
    messageList.splice(index, 1);
    this.setState({ messageList, fileList });
  };

  onLoadMore = async () => {
    const { messageList, canLoadMore } = this.state;
    if (!canLoadMore) return;
    setTypeOfAction(TypeOfAction.LOAD_MORE);
    this.setState({ isLoadMore: true });
    const lastId = messageList[0].id;
    const response = await requestGetListMessage(lastId);
    const responseList = response ? response.list : [];
    if (responseList.length > 0) {
      const newList = [...responseList, ...messageList];
      for (const i in newList) {
        newList[i].index = Number(i) + 1;
      }
      this.setState({
        isLoadMore: false,
        messageList: newList,
        canLoadMore: true,
      });
    } else {
      this.setState({ isLoadMore: false, canLoadMore: false });
    }
  };

  dragAndDropSection = () => {
    return (
      <div className="drag-box">
        <div className="drag-content-box">
          <img src={fileIcon} alt="fileIcon" className="drag-file-icon" />
          <span>Kéo thả ảnh/file để gửi</span>
        </div>
      </div>
    );
  };

  render() {
    const {
      roomName,
      messageList,
      loading,
      isLoadMore,
      isAllowAddNew,
      isAllowAttach,
      url,
      fileList,
      dragging,
    } = this.state;
    const listMessagesParse = JSON.parse(JSON.stringify(messageList));

    for (const i in listMessagesParse) {
      listMessagesParse[0].showDate = true;
      if (listMessagesParse[i].author === 'them') {
        if (!listMessagesParse[i - 1]) {
          listMessagesParse[i].showName = true;
        } else {
          if (
            listMessagesParse[i].data.name !==
            listMessagesParse[i - 1].data.name
          ) {
            listMessagesParse[i].showName = true;
          }
        }
      }
      if (listMessagesParse[i - 1]) {
        const currentMessageDate = listMessagesParse[i].data.date.split(' ')[0];
        const previousMessageDate =
          listMessagesParse[i - 1].data.date.split(' ')[0];
        if (
          !moment(currentMessageDate, 'DD-MM-YYYY').isSame(
            moment(previousMessageDate, 'DD-MM-YYYY')
          )
        ) {
          listMessagesParse[i].showDate = true;
        }
      }
    }
   
    return (
      <div
        ref={(e) => {
          this.dropRef = e;
        }}
      >
        {dragging ? this.dragAndDropSection() : null}
        <PreviewImageSection defaultListImage={this.state.messageList} />
        <ListFowardSection />
        <ChatWindow
          fileList={fileList}
          isLoadMore={isLoadMore}
          onLoadMore={this.onLoadMore}
          optionClick={this.optionClick}
          loading={loading}
          profile={{
            roomName,
            url,
            isDetail: this.props.isDetail,
          }}
          onMessageWasSent={this._onMessageWasSent.bind(this)}
          onFilesSelected={this._onFilesSelected.bind(this)}
          messageList={listMessagesParse}
          isOpen={true}
          onClose={() => {
            window.parent.postMessage('CLOSE', '*');
          }}
          isAllowAddNew={isAllowAddNew}
          isAllowAttach={isAllowAttach}
        />
      </div>
    );
  }
}

export default PopupChat;
