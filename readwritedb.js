
var url = "[MongoDB connection URL here]";
var MongoClient = require('mongodb').MongoClient;

var readWriteDB = function(myOptions, callback) {

  MongoClient.connect(url, function(err, db) {

    switch (myOptions.myDemand) {
      case 'insertDocument':
        db.collection(myOptions.myCollection).insertOne(myOptions.myDocument, function(err, result) {
          if (err) throw err;
          callback(result.result);
          db.close();
        });
        break;

      case 'deleteDocument':
        db.collection(myOptions.myCollection).deleteOne(myOptions.myQuery, function(err, result) {
          if (err) throw err;
          callback(result.result);
          db.close();
        });
        break;

      case 'deleteManyDocuments':
        db.collection(myOptions.myCollection).deleteMany(myOptions.myQuery, function(err, result) {
          if (err) throw err;
          callback(result.result);
          db.close();
        });
        break;

      case 'insertCollection':
        db.createCollection(myOptions.myCollection, function(err, result) {
          if (err) throw err;
          callback(result.result);
          db.close();
        });
        break;

      case 'dropCollection':
        db.collection(myOptions.dbCollection).drop(function(err, result) {
          if (err) throw err;
          callback(result.result);
          db.close();
        });
        break;

      case 'readDocument':
        db.collection(myOptions.myCollection).find(myOptions.myQuery, function(err, result) {
          if (err) throw err;
          result.toArray(function(err, result) {
            db.close();
            callback(result);
          });
        });
        break;

      case 'updateDocument':
        db.collection(myOptions.myCollection).updateOne(myOptions.myQuery, myOptions.myDocument, function(err, result) {
          if (err) throw err;
          callback(result.result);
          db.close();
        });
        break;
        //default:
    }

  });
}

module.exports = readWriteDB;

