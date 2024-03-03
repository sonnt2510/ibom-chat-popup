import React, { Component } from 'react';
import { render } from 'react-dom';
import PopupChat from '../../src';

class Demo extends Component {
  render() {
    return <div>
      <PopupChat
        apiHost={this.props.apiHost}
        token={this.props.token}
        objInstanceId={this.props.objInstanceId}
        objId={this.props.objId}
        username={this.props.username}
        userId={this.props.userId}
        chathubURI={this.props.chathubURI}
        isOpen={this.props.isOpen}
      />
    </div>;
  }
}

Demo.defaultProps = {
  apiHost: 'http://qa.ibom.com.vn:8113/',
  token: '8e98caf7d4beb38376cda411d3717ad66a3fc94f7b66d38a552e6377f2395a1602a56894b90f78c7fc463adb2b1b120c7d95271fb7630fa549d775ce643b4432',
  objInstanceId: '360314',
  objId: '13',
  username: 'demo6@pro.qa',
  userId: 39253,
  chathubURI: 'https://chathub.ibom.vn/',
  isOpen: true
};

render(<Demo />, document.querySelector('#demo'));
