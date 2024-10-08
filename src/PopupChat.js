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
  requestGetSetting
} from './services/request';
import { ChatHubHelper } from './services/signalR';
import UserInputHelper from './helper/userInputHelper';
import incomingMessageSound from './assets/sounds/notification.mp3';
import ChatWindow from './components/ChatWindow';

class PopupChat extends Component {
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
    };
  }

  setupData() {
    const { objInstanceId, objId } = this.props;
    if (objInstanceId && objId) {
      this._getListMessage();
      this._getInfo();
      document.addEventListener(
        'new-messages',
        (e) => this.handleNewMessageListener(e),
        false
      );
      document.addEventListener(
        'edit-message',
        (e) => this.handleEditDeleteMessageListener(e, 'edit'),
        false
      );
      document.addEventListener(
        'delete-message',
        (e) => this.handleEditDeleteMessageListener(e, 'delete'),
        false
      );
    } else {
      this.setState({ loading: false });
    }
  }

  componentDidMount() {
    moment.locale('en');
    setTimeout(() => {
      this.setupData();
    }, 300);
  }

  handleNewMessageListener(e) {
    window.parent.postMessage('NEW MESSAGE', '*');
    setTypeOfAction('add');
    var audio = new Audio(incomingMessageSound);
    var resp = audio.play();
    if (resp !== undefined) {
      resp
        .then((_) => {
          audio.play();
        })
        .catch((error) => {
          console.log('error', error);
        });
    }
    this.setState({
      messageList: [...this.state.messageList, ...e.newMessage],
    });
  }

  handleEditDeleteMessageListener(e, type) {
    const message = e.newMessage;
    const { messageList } = this.state;
    const index = messageList.findIndex((e) => e.id == message.comment_id);
    if (index > 0) {
      if (type === 'edit') {
        messageList[index].data.text = message.content;
      } else {
        messageList.splice(index, 1);
      }
      this.setState({ messageList });
    }
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
      setTypeOfAction('add');
      const index = messageList.length + 1;
      message.id = null;
      message.index = index;
      message.data.date = moment().format('DD/MM/YYYY hh:mmA');
      this.setState(
        {
          messageList: [...messageList, message],
        },
        () => {
          this._mapIdAfterResponse(message.data.text, index);
        }
      );
    }
  }

  _mapIdAfterResponse = async (message, index, propsId, files, allowEdit, allowDel) => {
    const response = await requestSendMessage(message, files, allowEdit, allowDel);
    if (response.isSuccess) {
      const id = response.commentId || propsId;
      const listAssign = Object.assign([], this.state.messageList);
      const findIndex = listAssign.findIndex((e) => e.index === index);
      listAssign[findIndex].id = id;
      listAssign[findIndex].isAllowEdit = response.isAllowEdit == 1;
      listAssign[findIndex].isAllowDelete = response.isAllowEdit == 1;
      this.setState({ messageList: listAssign });
      setMessageId('');
    }
  };

  _onFilesSelected(fileList) {
    const fileType = fileList.type.includes('image') ? 'image' : 'file';
    const index = this.state.messageList.length + 1;
    const objFile = {
      id: null,
      index,
      type: 'file',
      author: 'me',
      data: {
        url: window.URL.createObjectURL(fileList),
        fileName: fileList.name,
        date: moment().format('DD/MM/YYYY hh:mmA'),
        type: fileType,
      },
    };
    this.setState(
      {
        messageList: [...this.state.messageList, objFile],
      },
      () => {
        this._mapIdAfterResponse('', index, '', fileList);
      }
    );
  }

  async copyToClipboard(textToCopy) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      // Use the 'out of viewport hidden text area' trick
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
            
      // Move textarea out of the viewport so it's not visible
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
      setTypeOfAction('edit');
      UserInputHelper.setText(message.data.text);
      setMessageId(message.id);
      const editMessage = new CustomEvent('edit-my-message');
      document.dispatchEvent(editMessage);
    } else if (type === 'delete') {
      setTypeOfAction('delete');
      requestDeleteMessage(message.id);
      this._handleDeteleMessage(message.id);
    }
  };

  _handleDeteleMessage = (id) => {
    const { messageList } = this.state;
    const index = messageList.findIndex((e) => e.id === id);
    messageList.splice(index, 1);
    this.setState({ messageList });
  };

  onLoadMore = async () => {
    setTypeOfAction('loadMore');
    this.setState({ isLoadMore: true });
    const { messageList } = this.state;
    const lastId = messageList[0].id;
    const response = await requestGetListMessage(lastId);
    const responseList = response ? response.list : [];
    if (responseList.length > 0) {
      const newList = [...responseList, ...messageList];
      for (const i in newList) {
        newList[i].index = Number(i) + 1;
      }
      this.setState({ isLoadMore: false, messageList: newList });
    } else {
      this.setState({ isLoadMore: false });
    }
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
      <div>
        <ChatWindow
          isLoadMore={isLoadMore}
          onLoadMore={this.onLoadMore}
          optionClick={this.optionClick}
          loading={loading}
          profile={{
            roomName,
            url,
            isDetail: this.props.isDetail
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
