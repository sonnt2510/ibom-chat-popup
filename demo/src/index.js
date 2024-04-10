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
        isOpen={true}
      />
    </div>;
  }
}

// Demo.defaultProps = {
//   apihost: 'http://qa.ibom.com.vn:8113/',
//   token: '8e98caf7d4beb38376cda411d3717ad66a3fc94f7b66d38a552e6377f2395a1602a56894b90f78c7fc463adb2b1b120c7d95271fb7630fa549d775ce643b4432',
//   objinstanceid: '360314',
//   objid: '13',
//   username: 'demo6@pro.qa',
//   userid: 39253,
//   chathuburi: 'https://chathub.ibom.vn/',
//   isopen: true
// };

render(<Demo {...(document.querySelector('#demo').dataset)}/>, document.querySelector('#demo'));
