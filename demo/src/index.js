import React, { Component } from 'react';
import { render } from 'react-dom';
import PopupChat from '../../src';

class Demo extends Component {
  
  render() {
    return <div>
      <PopupChat
        apiHost={this.props.apihost}
        token={this.props.token}
        objInstanceId={this.props.objinstanceid}
        objId={this.props.objid}
        username={this.props.username}
        userId={this.props.userid}
        chathubURI={this.props.chathuburi}
        appType={this.props.apptype}
        isOpen={true}
      />
    </div>;
  }
}

Demo.defaultProps = {
  apihost: 'http://qa.ibom.com.vn:8113/',
  token: 'bafa181335f3d8de4b53c80f5d655626c3081fc7ce6d6ec729c6c2b22f9a1da616765b9df86f9b98616a82a66dc08916d069ad62c07c8e73b24c2d2bd58d7f41',
  objinstanceid: '360314',
  objid: '13',
  username: 'demo6@pro.qa',
  userid: 39253,
  chathuburi: 'https://chathub.ibom.vn/',
  apptype: 2,
  isopen: true
};

render(<Demo {...(document.querySelector('#demo').dataset)}/>, document.querySelector('#demo'));
