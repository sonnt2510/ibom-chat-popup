# ibom-chat-popup

`ibom-chat-popup` provides an intercom-like chat window for IBom organization, this project based on <a href="https://www.npmjs.com/package/react-chat-window">react-chat-window</a>

![GitHub license](https://img.shields.io/github/package-json/v/kingofthestack/react-chat-window.svg?style=flat-square) 
<a href="https://www.npmjs.com/package/react-chat-window" target="\_parent">
</a>

![Demo and image of chat popup](https://imgur.com/a/hYtCLjM)


## Installation

```
$ npm install ibom-chat-popup
```

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


