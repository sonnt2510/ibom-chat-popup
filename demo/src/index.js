import React, { Component } from 'react';
import { render } from 'react-dom';
import MainPage from '../../src';

class Demo extends Component {
  
  render() {
    const search = window.location.search;
    const params = new URLSearchParams(search);

    const apiHost = params.get('apihost')
    const token = params.get('token')
    const objInstanceId = params.get('objinstanceid')
    const objId = params.get('objid')
    const userName = params.get('username')
    const userId = params.get('userid')
    const chathubURI = params.get('chathuburi')
    const appType = params.get('apptype')
    const isList = params.get('islist')


    return <div>
      <MainPage
        apiHost={apiHost}
        token={token}
        objInstanceId={objInstanceId}
        objId={objId}
        username={userName}
        userId={userId}
        chathubURI={chathubURI}
        appType={appType}
        isList={isList}
      />
    </div>;
  }
}

Demo.defaultProps = {
  apihost: 'http://qa.ibom.com.vn:8113/',
  token: '0d424cd5b0992d80978d4bde5436f253b0c1ef3168d9f8184b4b7e625d4975352e3b32bdbe5028283375f11ec6f6d31dd675e60a842607c19b883207c0ae7599',
  objinstanceid: '399316',
  objid: '13',
  username: 'quantri11@pro.qa',
  userid: 39093,
  chathuburi: 'https://chathub.ibom.vn/',
  apptype: 2,
  islist: 1
};

render(<Demo {...(document.querySelector('#demo').dataset)}/>, document.querySelector('#demo'));
