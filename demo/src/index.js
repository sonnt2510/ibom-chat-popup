import React, { Component } from 'react';
import { render } from 'react-dom';
import PopupChat from '../../src';

class Demo extends Component {
  render() {
    return <div>
      <PopupChat />
    </div>;
  }
}

render(<Demo />, document.querySelector('#demo'));
