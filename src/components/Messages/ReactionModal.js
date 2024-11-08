import React from 'react';
import { ReactValue } from '../../utils/Constants';
import { mapReactWithReactId } from '../../utils/Reaction';
import closeIcon from '../../assets/close-icon.png';
import { getCurrentUserId } from '../../services/request';

const ReactionModal = ({ isVisible = false, reaction, onClose }) => {
  if (!isVisible) return <div />;

  const renderTotalReaction = () => {
    return (
      <div className="reaction-modal--listReaction">
        <div className="reaction-modal--listReactionItem">
          <span className="reaction-modal--listReactionAll">Tất cả</span>
          <span className="reaction-modal--listReactionAll">
            {reaction.length}
          </span>
        </div>
        {renderReaction(ReactValue.LIKE)}
        {renderReaction(ReactValue.HEART)}
        {renderReaction(ReactValue.LAUGH)}
        {renderReaction(ReactValue.SUPRISED)}
        {renderReaction(ReactValue.CRY)}
        {renderReaction(ReactValue.ANGRY)}
      </div>
    );
  };

  const renderReaction = (emoji) => {
    const filter = reaction.filter((e) => e.react === emoji);
    const length = filter ? filter.length : 0;
    if (length == 0) return <div />;
    return (
      <div className="reaction-modal--listReactionItem">
        <span>{mapReactWithReactId(emoji)}</span>
        <span className="reaction-modal--listReactionAll">{length}</span>
      </div>
    );
  };

  const renderUsersReaction = () => {
    const currentUserId = getCurrentUserId();
    return (
      <div className="reaction-modal--userList">
        {reaction.map((e, i) => {
          const name =
            currentUserId == e.user_sent_id ? 'Bạn' : e.user_sent_name;
          return (
            <div key={i} className="reaction-modal--userListItem">
              <img
                src={
                  e.avatar ? e.avatar : 'https://pro.ibom.vn/images/nophoto.jpg'
                }
                className="reaction-modal--userAvatar"
              />
              <span className="reaction-modal--userName">{name}</span>
              <span className="reaction-modal--userEmoji">
                {mapReactWithReactId(e.react)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="reaction-modal--overlay">
      <div className="reaction-modal--container">
        <div className="reaction-modal--header">
          <p>Biểu cảm</p>
          <div onClick={() => onClose()} className="reaction-modal--closeIcon">
            <img width={18} height={18} src={closeIcon} alt="closeIcon" />
          </div>
        </div>
        <div className="reaction-modal--body">
          {renderTotalReaction()}
          {renderUsersReaction()}
        </div>
      </div>
    </div>
  );
};

export default ReactionModal;
