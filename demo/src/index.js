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
  token: '76a18f0301a5361d9ed865d9b6e7215765929b23077e469455e59b510a6f16c50e559565299cab49996019263b228285785e5c3bb81b5e4917c44674b5fd1a5d',
  objinstanceid: '399316',
  objid: '13',
  username: 'quantri11@pro.qa',
  userid: 39093,
  chathuburi: 'https://chathub.ibom.vn/',
  apptype: 2,
  isopen: true
};

render(<Demo {...(document.querySelector('#demo').dataset)}/>, document.querySelector('#demo'));
