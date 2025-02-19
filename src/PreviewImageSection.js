import React, { Component } from 'react';
import './styles';
import './styles/base.css';
import closeIcon from './assets/close-icon.png';
import rotateIcon from './assets/rotate-icon.png';
import zoomInIcon from './assets/zoom-in-icon.png';
import zoomOutIcon from './assets/zoom-out-icon.png';
import { GestureEvent } from './utils/Constants';

class PreviewImageSection extends Component {
  prevPosition;
  constructor(props) {
    super(props);
    this.state = {
      type: 'image',
      url: '',
      scale: 1,
      position: {
        x: 0,
        y: 0,
      },
      rotate: 0,
      isDragging: false,
      imageList: [],
      defaultImageList: [],
    };
  }

  componentDidUpdate(_prevProps) {
    if (_prevProps.defaultListImage !== this.props.defaultListImage) {
      const list = this.props.defaultListImage;
      const filter = list.filter(
        (e) => e.type == 'file' && e.extension != '.mp4'
      );
      this.setState({ defaultImageList: filter });
    }
  }

  componentDidMount() {
    document.addEventListener(
      GestureEvent.CLICK_IMAGE,
      (e) => {
        this.setState({
          type: e.imageType,
          url: e.imageUrl,
          imageList: e.listImage,
          scale: 1,
          position: {
            x: 0,
            y: 0,
          },
          isDragging: false,
        });
      },
      false
    );

    document.addEventListener('keydown', (event) => {
      const { url, imageList, defaultImageList } = this.state;
      const list = imageList ?? defaultImageList;
      const key = event.key;
      if (url) {
        const findIndex = list.findIndex(
          (e) => e.file_path === url || (e.data && e.data.url) === url
        );
        if (findIndex >= 0) {
          if (key == 'ArrowLeft' || key == 'ArrowUp') {
            const data = list[findIndex - 1];
            if (data) {
              this.setState({ url: data.file_path || data.data.url });
            }
          } else if (key == 'ArrowRight' || key == 'ArrowDown') {
            const data = list[findIndex + 1];
            if (data) {
              this.setState({ url: data.file_path || data.data.url });
            }
          }
        }
      }
    });
  }

  handleMouseDown = (e) => {
    if (this.state.scale == 1) return;
    this.setState({ isDragging: true });
    this.prevPosition = { x: e.clientX, y: e.clientY };
  };

  handleMouseMove = (e) => {
    const { position, isDragging } = this.state;
    if (!isDragging) return;
    const deltaX = e.clientX - this.prevPosition.x;
    const deltaY = e.clientY - this.prevPosition.y;
    this.prevPosition = { x: e.clientX, y: e.clientY };
    this.setState({
      position: {
        x: position.x + deltaX,
        y: position.y + deltaY,
      },
    });
  };

  handleMouseUp = () => {
    this.setState({ isDragging: false });
  };

  render() {
    const { url, scale, position, rotate } = this.state;
    if (!url) return null;
    return (
      <div className="preview-image-container">
        <div className="preview-image-wrap">
          <div className="preview-image-header">
            <span className="preview-image-title"></span>
            <div
              onClick={() => this.setState({ url: '', imageList: [] })}
              style={{ padding: 10, cursor: 'pointer' }}
            >
              <img src={closeIcon} className="preview-image-close-icon" />
            </div>
          </div>
          <img
            onMouseUp={this.handleMouseUp}
            onMouseMove={this.handleMouseMove}
            onMouseDown={this.handleMouseDown}
            style={{
              cursor: scale > 1 ? 'move' : 'auto',
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px) rotate(${rotate}deg)`,
            }}
            draggable={false}
            className="preview-image"
            src={url}
          />
          <div className="preview-image-footer">
            <div style={{ padding: 10, cursor: 'pointer' }}>
              <img
                onClick={() => this.setState({ rotate: rotate + 90 })}
                src={rotateIcon}
                className="preview-image-close-icon"
              />
            </div>
            <div
              onClick={() =>
                this.setState({ scale: scale + 0.5, position: { x: 0, y: 0 } })
              }
              style={{ padding: 10, cursor: 'pointer' }}
            >
              <img src={zoomInIcon} className="preview-image-close-icon" />
            </div>
            <div
              onClick={() => {
                if (scale > 1) {
                  this.setState({
                    scale: scale - 0.5,
                    position: { x: 0, y: 0 },
                  });
                }
              }}
              style={{ padding: 10, cursor: 'pointer' }}
            >
              <img src={zoomOutIcon} className="preview-image-close-icon" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PreviewImageSection;
