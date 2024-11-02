import React, { Component } from 'react';

class PopupWindow extends Component {

  componentDidMount() {
    this.scLauncher = document.querySelector('.sc-chat-window');
    this.scLauncher.addEventListener('click', this.interceptLauncherClick);
  }

  componentWillUnmount() {
    this.scLauncher.removeEventListener('click', this.interceptLauncherClick);
  }

  interceptLauncherClick = (e) => {
    const { isOpen } = this.props;
    const clickedOutside = !this.emojiPopup.contains(e.target) && isOpen;
    clickedOutside && this.props.onClickedOutside(e);
  }

  render() {
    const { isOpen, children } = this.props;
    return (
      <div className="sc-popup-window" ref={e => this.emojiPopup = e}>
        <div className={`sc-popup-window--cointainer ${isOpen ? '' : 'closed'}`}>
          {children}
        </div>
      </div>
    );
  }
}

export default PopupWindow;