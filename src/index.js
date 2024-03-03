import React, { Component } from 'react';
import Launcher from './components/Launcher';
import './styles';
import './styles/base.css';
import PropTypes from 'prop-types';
import { setApiInstance } from './services/api';
import moment from 'moment';
import { requestGetListMessage, setPayloadDefault, setMessageId, getMessageId, requestSendMessage, requestDeleteMessage, setTypeOfAction } from './services/request';
import { ChatHubHelper } from './services/signalR';
import UserInputHelper from './helper/userInputHelper';
import incomingMessageSound from './assets/sounds/notification.mp3';
import * as ReactDOM from 'react-dom';

class PopupChat extends Component {
  constructor() {
    super();
    this.state = {
      messageList: [],
      isOpen: false,
      loading: true,
      roomName: '',
      isLoadMore: false
    };
  }

  componentWillUnmount() {
    this.stopConnect();
  }

  stopConnect(){
    ChatHubHelper.stopConnection();
    document.removeEventListener('new-messages');
    document.removeEventListener('edit-message');
    document.removeEventListener('delete-message');
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.objInstanceId !== this.props.objInstanceId) {
      this.setupData();
    }

    if (prevProps.isOpen !== this.state.isOpen) {
      this.setState({ isOpen: prevProps.isOpen });
    }
  }

  setupData() {
    const { apiHost, token, username, objInstanceId, userId, objId, chathubURI } = this.props;
    setApiInstance(apiHost, token, username);
    setPayloadDefault(objInstanceId, objId, userId, username);
    ChatHubHelper.storeChatHubURI(chathubURI);
    this._getListMessage();
    document.addEventListener('new-messages', (e) => this.handleNewMessageListener(e), false);
    document.addEventListener('edit-message', (e) => this.handleEditDeleteMessageListener(e, 'edit'), false);
    document.addEventListener('delete-message', (e) => this.handleEditDeleteMessageListener(e, 'delete'), false);
  }

  componentDidMount() {
    this.setState({isOpen: this.props.isOpen});
    this.setupData();
  }


  handleNewMessageListener(e) {
    setTypeOfAction('add');
    var audio = new Audio(incomingMessageSound);
    audio.play();
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
      loading: false
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
    const { teamName, isOpen, messageList, loading, isLoadMore } = this.state;
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
      <Launcher
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
        isOpen={isOpen}
        onClose={() => {
          this.setState({ isOpen: false });
          this.stopConnect();
        }}
      />
    </div>;
  }
}


PopupChat.propTypes = {
  apiHost: PropTypes.string.isRequired,
  token: PropTypes.string.isRequired,
  objInstanceId: PropTypes.string.isRequired,
  objId: PropTypes.string.isRequired,
  username: PropTypes.object.isRequired,
  userId: PropTypes.number.isRequired,
  chathubURI: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired
};

export default PopupChat;

