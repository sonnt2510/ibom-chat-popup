import { ReactEmoji, ReactValue } from './Constants';

export const mapReactWithReactId = (value) => {
  let react = '';
  switch (value) {
  case ReactValue.LIKE:
    react = ReactEmoji.LIKE;
    break;
  case ReactValue.HEART:
    react = ReactEmoji.HEART;
    break;
  case ReactValue.LAUGH:
    react = ReactEmoji.LAUGH;
    break;
  case ReactValue.SUPRISED:
    react = ReactEmoji.SUPRISED;
    break;
  case ReactValue.CRY:
    react = ReactEmoji.CRY;
    break;
  case ReactValue.ANGRY:
    react = ReactEmoji.ANGRY;
    break;
  }
  return react;
};
