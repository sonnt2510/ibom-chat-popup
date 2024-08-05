import React, { Component } from "react";
import "./styles";
import "./styles/base.css";
import { setApiInstance } from "./services/api";
import moment from "moment";
import {
  setPayloadDefault,
} from "./services/request";
import { ChatHubHelper } from "./services/signalR";
import ListChat from "./ListChat"
import PopupChat from "./PopupChat"

class MainPage extends Component {
  constructor() {
    super();
   
  }

  setupData() {
    const {
      apiHost,
      token,
      username,
      objInstanceId,
      userId,
      objId,
      chathubURI,
      appType,
    } = this.props;
    
    setApiInstance(apiHost, token, username);
    setPayloadDefault(objInstanceId, objId, userId, username, appType);
    ChatHubHelper.storeChatHubURI(chathubURI);
  }
  
  componentDidMount() {
    moment.locale("vi");
    this.setupData();
  }

  render() {
    const { isList } = this.props;

    if (isList == 1) {
      return <ListChat />
    }
    return <PopupChat />
  }
}

export default MainPage;
