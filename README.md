# ibom-chat-popup

`ibom-chat-popup` provides an intercom-like chat window for IBom organization, this project based on <a href="https://www.npmjs.com/package/react-chat-window">react-chat-window</a>

![GitHub license](https://img.shields.io/github/package-json/v/kingofthestack/react-chat-window.svg?style=flat-square) 
<a href="https://www.npmjs.com/package/react-chat-window" target="\_parent">
</a>

![Demo and image of chat popup](https://i.imgur.com/5Yyc03f.png)


## Installation

```
$ npm install ibom-chat-popup or $ yarn add ibom-chat-popup
```

## Running as demo

Using git to clone the project, and then run <b>yarn install && npm start</b> to install node modules and run the project (remember to provide correct token)

## Example

``` javascript
import React, {Component} from 'react'
import PopupChat from 'ibom-chat-popup'

class Demo extends Component {
  ...
  render() {
    return (
      <div>
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
    </div>
    )
  }
}
```

For more detailed examples see the demo folder.


