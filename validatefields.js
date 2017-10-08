function validateFields(fields, callback) {

  var errorCounter = 0;
  var letters = /^[A-Za-zğüşiöçıIĞÜŞİÖÇ ]+$/;
  var mailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  for (var myKey in Object.keys(fields)) {

    switch (myKey) {

      // Check for Name Surname (Must be at least 6 characters)-----------------
      case "userNameSurname":

        if (fields.userNameSurname.length == 0) {
          ++errorCounter;

        } else if (fields.userNameSurname.length < 6 || fields.userNameSurname.length > 60) {
          ++errorCounter;

        } else if (!fields.userNameSurname.match(letters)) {
          ++errorCounter;

        }
        break;
        // -----------------------------------------------------------------------

        // Check for Email (Must be a proper email) ------------------------------
      case "userEmail":

        if (fields.userEmail.length == 0) {
          ++errorCounter;

        } else if (fields.userEmail.length > 60) {
          ++errorCounter;

        } else if (!fields.userEmail.match(mailformat)) {
          ++errorCounter;

        }
        break;
        // -----------------------------------------------------------------------

        // Check for password ----------------------------------------------------
      case "userPsw":
      case "userPswConfirm":

        if (fields.userPsw.length == 0) {
          ++errorCounter;

        } else if (fields.userPswConfirm.length == 0) {
          ++errorCounter;

        } else if (fields.userPsw != fields.userPswConfirm) {
          ++errorCounter;

        } else if (fields.userPsw.length > 20 || fields.userPsw.length < 6) {
          ++errorCounter;

        }
        break;
        // -----------------------------------------------------------------------

        // Check for SecretQ -----------------------------------------------------
      case "userSecretQ":

        if (fields.SecretQ.length == 0) {
          ++errorCounter;

        } else if (fields.SecretQ.length > 50 || fields.SecretQ.length < 6) {
          ++errorCounter;

        }
        break;
        // -----------------------------------------------------------------------

        // Check for SecretA -----------------------------------------------------
      case "userSecretA":

        if (fields.SecretA.length == 0) {
          ++errorCounter;

        } else if (fields.SecretA.length > 20 || fields.SecretA.length < 6) {
          ++errorCounter;

        }
        break;
        // -----------------------------------------------------------------------

      default:

    } // switch ends here

  } // for loop ends here

  if (errorCounter > 0) {
    callback(false);

  } else if (errorCounter == 0) {
    callback(true);

  }

}; // function ends here

module.exports = validateFields;
