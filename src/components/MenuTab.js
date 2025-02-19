import React, { Component } from 'react';
import peopleIcon from './../assets/people-icon.png';
import arrowUp from './../assets/arrow-up.png';
import arrowDown from './../assets/arrow-down.png';
import imageIcon from './../assets/image-icon.png';
import fileIcon from './../assets/file-icon.png';
import { getUserListInfo } from '../services/request';
import Collapsible from 'react-collapsible';
import imageExtensions from '../image-extensions.json';
import { mapFileIcon } from '../utils/Message';
import ListFile from './ListFile';
import { GestureEvent } from '../utils/Constants';

class MenuTab extends Component {
  constructor() {
    super();
    this.state = {
      isOpenMember: false,
      isOpenImage: false,
      isOpenFile: false,
      screen: '',
    };
  }

  listUser = (userList) => {
    const { isOpenMember } = this.state;
    return (
      <Collapsible
        transitionTime={200}
        trigger={
          <div
            onClick={() => this.setState({ isOpenMember: !isOpenMember })}
            className="menu-tab--memberHeaderWrap"
          >
            <span className="menu-tab--sectionTitle">Thành viên tham gia</span>
            <div style={{ display: 'flex', marginTop: 10 }}>
              <img
                src={peopleIcon}
                alt="people"
                className="menu-tab--peopleIcon"
              />
              <span style={{ fontSize: 14 }}>
                {userList && userList.length} thành viên
              </span>
              <img
                src={isOpenMember ? arrowUp : arrowDown}
                alt="arrow"
                className="menu-tab--arrowIcon"
              />
            </div>
          </div>
        }
      >
        <div className="menu-tab--memberWrap">
          {userList &&
            userList.map((e) => {
              return (
                <div className="menu-tab--memberItemWrap" key={e.user_id}>
                  <img
                    alt={e.avatar}
                    src={e.user_id}
                    className="menu-tab--avatar"
                  />
                  <span>{e.full_name}</span>
                </div>
              );
            })}
        </div>
      </Collapsible>
    );
  };

  collapImage = (list) => {
    const { isOpenImage } = this.state;
    return (
      <Collapsible
        transitionTime={200}
        trigger={
          <div
            onClick={() => this.setState({ isOpenImage: !isOpenImage })}
            className="menu-tab--memberHeaderWrap"
          >
            <img
              style={{
                height: 20,
                width: 20,
                marginBottom: -3,
              }}
              src={imageIcon}
              className="menu-tab--peopleIcon"
            />
            <span style={{ marginLeft: 0 }} className="menu-tab--sectionTitle">
              Ảnh/Video
            </span>
            <img
              src={isOpenImage ? arrowUp : arrowDown}
              alt="arrow"
              className="menu-tab--arrowIcon"
            />
          </div>
        }
      >
        <div className="menu-tab--listImageWrap">
          {list.map((e) => (
            <img
              key={e.file_path}
              onClick={() => {
                const event = new CustomEvent(GestureEvent.CLICK_IMAGE);
                event.listImage = list;
                event.imageType = 'image';
                event.imageUrl = e.file_path;
                document.dispatchEvent(event);
              }}
              className="menu-tab--image"
              src={e.file_path}
            />
          ))}
        </div>
        {list && list.length > 0 ? (
          <div
            onClick={() => this.setState({ screen: 'image' })}
            className="menu-tab--allButton"
          >
            Xem tất cả
          </div>
        ) : <p className='menu-tab--emptyText'>Chưa có ảnh/video</p>}
      </Collapsible>
    );
  };

  collapFiles = (list) => {
    const { isOpenFile } = this.state;
    return (
      <Collapsible
        transitionTime={200}
        trigger={
          <div
            onClick={() => this.setState({ isOpenFile: !isOpenFile })}
            className="menu-tab--memberHeaderWrap"
          >
            <img
              style={{
                height: 20,
                width: 20,
                marginBottom: -3,
              }}
              src={fileIcon}
              className="menu-tab--peopleIcon"
            />
            <span style={{ marginLeft: 0 }} className="menu-tab--sectionTitle">
              File
            </span>
            <img
              src={isOpenFile ? arrowUp : arrowDown}
              alt="arrow"
              className="menu-tab--arrowIcon"
            />
          </div>
        }
      >
        <div className="menu-tab--listImageWrap">
          {list.map((e) => (
            <div
              onClick={() => {
                window.open(e.file_path, '_blank', 'noreferrer');
              }}
              className="menu-tab--listFileItem"
              key={e.file_path}
            >
              <img
                style={{ marginBottom: -3 }}
                alt="fileIcon"
                src={mapFileIcon(e.file_name)}
                height={20}
                width={20}
              />
              <span>{e.file_name}</span>
            </div>
          ))}
        </div>
        {list && list.length > 0 ? (
          <div
            onClick={() => this.setState({ screen: 'image' })}
            className="menu-tab--allButton"
          >
            Xem tất cả
          </div>
        ) : <p className='menu-tab--emptyText'>Chưa có file</p>}
      </Collapsible>
    );
  };

  listFiles = () => {
    const { fileList } = this.props;
    const listImages = [];
    const listFiles = [];

    for (const i in fileList) {
      const type = imageExtensions.includes(
        fileList[i].extension.replace('.', '')
      )
        ? 'image'
        : 'file';
      if (type == 'image') {
        listImages.push(fileList[i]);
      } else {
        listFiles.push(fileList[i]);
      }
    }
    return (
      <div>
        {this.collapImage(listImages)}
        <div className="menu-tab--seperator" />
        {this.collapFiles(listFiles)}
      </div>
    );
  };

  render() {
    const userList = getUserListInfo();
    const { roomName } = this.props;
    const { screen } = this.state;
    if (screen) {
      return (
        <ListFile
          onClickBack={() => this.setState({ screen: '' })}
          screen={screen}
        />
      );
    }
    return (
      <div>
        <div className="menu-tab--header">
          <span className="menu-tab--title">Thông tin</span>
        </div>
        <div className="menu-tab--listAvaWrap">
          {userList.slice(0, 5).map((e) => {
            return (
              <img
                key={e.avatar}
                className="menu-tab--avatar"
                alt={e.avatar}
                src={e.avatar}
              />
            );
          })}
          {userList && userList.length > 5 ? (
            <div className="menu-tab--avatarNumber">
              <span>{userList.length}</span>
            </div>
          ) : null}
        </div>
        <p className="menu-tab--roomName">{roomName}</p>
        <div className="menu-tab--seperator" />
        {this.listUser(userList)}
        <div className="menu-tab--seperator" />
        {this.listFiles()}
        <div className="menu-tab--seperator" />
      </div>
    );
  }
}

export default MenuTab;
