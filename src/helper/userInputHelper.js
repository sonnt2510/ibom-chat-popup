export default class UserInputHelper {
  static userInput;

  static setUserInput(userInputRef) {
    UserInputHelper.userInput = userInputRef;
  }

  static setText = (message) => {
    UserInputHelper.userInput.innerText = message;
    UserInputHelper.userInput.innerHTML = message;
    UserInputHelper.userInput.focus();
  };
}
