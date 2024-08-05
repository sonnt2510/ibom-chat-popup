import React, { Component } from 'react';
import './styles';
import './styles/base.css';
import PropTypes from 'prop-types';
import { setApiInstance } from './services/api';
import moment from 'moment';
import { requestGetListMessage, setPayloadDefault, setMessageId, getMessageId, requestSendMessage, requestDeleteMessage, setTypeOfAction } from './services/request';
import { ChatHubHelper } from './services/signalR';
import UserInputHelper from './helper/userInputHelper';
import incomingMessageSound from './assets/sounds/notification.mp3';
import copyIcon from './assets/bubble-icon.png';
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
      isAllowAttach: false
    };
  }

  setupData() {
    const { apiHost, token, username, objInstanceId, userId, objId, chathubURI, appType } = this.props;
    if (objInstanceId && objId) {
      setApiInstance(apiHost, token, username);
      setPayloadDefault(objInstanceId, objId, userId, username, appType);
      ChatHubHelper.storeChatHubURI(chathubURI);
      this._getListMessage();
      document.addEventListener('new-messages', (e) => this.handleNewMessageListener(e), false);
      document.addEventListener('edit-message', (e) => this.handleEditDeleteMessageListener(e, 'edit'), false);
      document.addEventListener('delete-message', (e) => this.handleEditDeleteMessageListener(e, 'delete'), false);
    } else {
      this.setState({ loading: false })
    }
  }

  componentDidMount() {
    moment.locale('vi')
    setTimeout(() => {
      this.setupData();
    }, 100)
  }

  handleNewMessageListener(e) {
    window.parent.postMessage('NEW MESSAGE', '*')
    setTypeOfAction('add');
    var audio = new Audio(incomingMessageSound);
    var resp = audio.play();
    if (resp!== undefined) {
      resp.then(_ => {
        audio.play()
      }).catch(error => {
        console.log('error', error);
      });
    }
    this.setState({
      messageList: [...this.state.messageList, ...e.newMessage]
    });
  }

  handleEditDeleteMessageListener(e, type) {
    const message = e.message;
    const { messageList } = this.state;
    const index = messageList.findIndex(e => e.id == message.messageId);
    if (index > 0) {
      if (type === 'edit') {
        messageList[index].data.text = message.content;
      } else {
        messageList.splice(index, 1);
      }
      this.setState({ messageList });
    }
  }

  async _getListMessage() {
    const response = await requestGetListMessage();
    ChatHubHelper.startConnection(this.props.userId);
    this.setState({
      teamName: response ? response.title : '',
      messageList: response ? response.list : [],
      loading: false,
      isAllowAddNew: response ? response.isAllowAddNew : false,
      isAllowAttach: response ? response.isAllowAttach : false
    });
  }

  async _onMessageWasSent(message) {
    const { messageList } = this.state;
    const messageId = getMessageId();
    if (messageId) {
      const findIndex = messageList.findIndex(e => e.id === messageId);
      messageList[findIndex].id = '';
      messageList[findIndex].data.text = message.data.text;
      this.setState({ messageList }, () => {
        this._mapIdAfterResponse(message.data.text, messageList[findIndex].index, messageId);
      });
    } else {
      setTypeOfAction('add');
      const index = messageList.length + 1;
      message.id = null;
      message.index = index;
      message.data.date = moment().format('DD/MM/YYYY hh:mmA');
      this.setState({
        messageList: [...messageList, message]
      }, () => {
        this._mapIdAfterResponse(message.data.text, index);
      });
    }
  }

  _mapIdAfterResponse = async (message, index, propsId, files) => {
    const response = await requestSendMessage(message, files);
    if (response.isSuccess) {
      const id = response.commentId || propsId;
      const listAssign = Object.assign([], this.state.messageList);
      const findIndex = listAssign.findIndex(e => e.index === index);
      listAssign[findIndex].id = id;
      listAssign[findIndex].isAllowEdit = response.isAllowEdit;
      listAssign[findIndex].isAllowDelete = response.isAllowEdit;
      this.setState({ messageList: listAssign });
      setMessageId('');
    }
  }

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
        type: fileType
      }
    };
    this.setState({
      messageList: [...this.state.messageList, objFile]
    }, () => {
      this._mapIdAfterResponse('', index, '', fileList);
    });
  }

  optionClick = (message, type) => {
    if (type === 'copy') {
      navigator.clipboard.writeText(message.data.text);
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
  }

  _handleDeteleMessage = (id) => {
    const { messageList } = this.state;
    const index = messageList.findIndex(e => e.id === id);
    messageList.splice(index, 1);
    this.setState({ messageList });
  }

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
  }

  render() {
    const { teamName, isOpen, messageList, loading, isLoadMore, isAllowAddNew, isAllowAttach } = this.state;
    const listMessagesParse = JSON.parse(JSON.stringify(messageList));

    for (const i in listMessagesParse) {
      listMessagesParse[0].showDate = true;
      if (listMessagesParse[i].author === 'them') {
        if (!listMessagesParse[i - 1]) {
          listMessagesParse[i].showName = true;
        } else {
          if (listMessagesParse[i].data.name !== listMessagesParse[i - 1].data.name) {
            listMessagesParse[i].showName = true;
          }
        }
      }
      if (listMessagesParse[i - 1]) {
        const currentMessageDate = listMessagesParse[i].data.date.split(' ')[0];
        const previousMessageDate = listMessagesParse[i - 1].data.date.split(' ')[0];
        if (!moment(currentMessageDate, 'DD-MM-YYYY').isSame(moment(previousMessageDate, 'DD-MM-YYYY'))) {
          listMessagesParse[i].showDate = true;
        }
      }
    }
    return <div>
      {/* {!isOpen ?   
      <div onClick={() => {
        window.parent.postMessage('OPEN', '*')
        this.setState({ isOpen: true})
      }} className='sc-launcher'>
        <img alt='bubble' src={copyIcon} />
        <span>Trao đổi</span>
      </div> : null} */}
      <ChatWindow
        isLoadMore={isLoadMore}
        onLoadMore={this.onLoadMore}
        optionClick={this.optionClick}
        loading={loading}
        agentProfile={{
          teamName
        }}
        onMessageWasSent={this._onMessageWasSent.bind(this)}
        onFilesSelected={this._onFilesSelected.bind(this)}
        messageList={listMessagesParse}
        isOpen={true}
        onClose={() => {
          window.parent.postMessage('CLOSE', '*')
        }}
        isAllowAddNew={isAllowAddNew}
        isAllowAttach={isAllowAttach}
      />
    </div>;
  }
}

export default PopupChat;

