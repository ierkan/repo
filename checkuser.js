// Functon to check if user exists in database by enteredEmail
var readWriteDB = require('./readwritedb.js');

var checkUser = function(queryField, queryValue, callBack) {
  // queryField can be "userNameSurname","userEmail", "userPsw" or "userConfirmStatus"

  switch (queryField) {
    case "userNameSurname":
      var myQuery = {
        "userNameSurname": queryValue
      };
      break;

    case "userEmail":
      var myQuery = {
        "userEmail": queryValue
      };
      break;

    case "userPsw":
      var myQuery = {
        "userPsw": queryValue
      };
      break;

    case "userConfirmStatus":
      var myQuery = {
        "userConfirmStatus": queryValue
      };
      break;

    case "userConfirmLink":
      var myQuery = {
        "userConfirmLink": queryValue
      };
      break;

    case "userPswResetLink":
      var myQuery = {
        "userPswResetLink": queryValue
      };
      break;

    case "userSecretQ":
      var myQuery = {
        "userSecretQ": queryValue
      };
      break;

    case "userSecretA":
      var myQuery = {
        "userSecretA": queryValue
      };
      break;
  }


  var myOptions = {
    "myDemand": 'readDocument',
    "myCollection": 'credentials',
    "myDocument": '',
    "myQuery": myQuery, // Query as a json object e.g. { name: 'Ahmet' };
  };

  readWriteDB(myOptions, function(result) {
    var dbData = result;
    var myDbRecord;

    if (dbData.length != 0) {

      switch (queryField) {
        case "userNameSurname":
          myDbRecord = dbData[0].userNameSurname;
          break;

        case "userEmail":
          myDbRecord = dbData[0].userEmail;
          break;

        case "userPsw":
          myDbRecord = dbData[0].userPsw;
          break;

        case "userConfirmStatus":
          myDbRecord = dbData[0].userConfirmStatus;
          break;

        case "userConfirmLink":
          myDbRecord = dbData[0].userConfirmLink;
          break;

        case "userPswResetLink":
          myDbRecord = dbData[0].userPswResetLink;
          break;

        case "userSecretQ":
          myDbRecord = dbData[0].userSecretQ;
          break;

        case "userSecretA":
          myDbRecord = dbData[0].userSecretA;
          break;

        default:
          myDbRecord = dbData[0].userEmail;
          break;
      }

      if (myDbRecord == queryValue) {
        callBack(dbData);
      }
    } else {

      callBack(dbData);
    }
  });
}

module.exports = checkUser;
