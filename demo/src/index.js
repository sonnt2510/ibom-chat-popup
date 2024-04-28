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
  token: 'ed0e221b3c2a78f13d669f98bd4f7a11f34999b5c85853b0edff5c917b394763289aa7541b3ffb4b8cf9c4240c4bb704626ceea8d38576fbb67fa0eb00b7082b',
  objinstanceid: '360314',
  objid: '13',
  username: 'demo6@pro.qa',
  userid: 39253,
  chathuburi: 'https://chathub.ibom.vn/',
  apptype: 2,
  isopen: true
};

render(<Demo {...(document.querySelector('#demo').dataset)}/>, document.querySelector('#demo'));
