export default class UserInputHelper {
  static userInput;

  static setUserInput(userInputRef) {
    UserInputHelper.userInput = userInputRef;
  }

  static setText = (message) => {
    UserInputHelper.userInput.focus();
    UserInputHelper.userInput.textContent = message;
  
  };
}
