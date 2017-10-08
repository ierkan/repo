/* var stitch = require("mongodb-stitch")
var MongoClient = new stitch.StitchClient('turna-login-fpgun');
var db = MongoClient.service('mongodb', 'mongodb-atlas').db('turna');
MongoClient.login().then(() =>
  db.collection('credentials').updateOne({owner_id: client.authedId()}, {$set:{number:42}}, {upsert:true})
).then(() =>
  db.collection('credentials').find({owner_id: client.authedId()})
).then(docs => {
  console.log("Found docs", docs)
  console.log("[MongoDB Stitch] Connected to Stitch")
}).catch(err => {
  console.error(err)
}); */

var url = "mongodb://[username]:[Password]@cluster0-shard-00-00-vnfnc.mongodb.net:27017,cluster0-shard-00-01-vnfnc.mongodb.net:27017,cluster0-shard-00-02-vnfnc.mongodb.net:27017/turna?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
var MongoClient = require('mongodb').MongoClient;
// var assert = require('assert');
//var url = 'mongodb://localhost:27017/test';

// Database >> collections >> Objects >> Documents
// e.g.
// database: test
// collection: turna
// Object: "_id" : ObjectId("59c8ee9cd2e59c5dce24568a")
// Document: "ad" : "cenap","soyad" : "baydar",

/*
MyDemand Cases
  insertDocument
  insertObject
  deleteDocument
  deleteManyDocuments
  deleteObject
  dropCollection
  insertCollection
  readDocument
  updateDocument


Var myOptions = {
  myDemand: '', // Stated above
  myCollection: '', // Collection name as a string
  myDocument: '', // Document as a json object e.g. { name: "Company Inc", address: "Highway 37" };
  myQuery: '', // Query as a json object e.g. { name: 'Ahmet' };
  myNewCollection: '' // Collection name as string
}
*/
var readWriteDB = function(myOptions, callback) {

  MongoClient.connect(url, function(err, db) {
    //    assert.equal(null, err);

    //console.log("Connected correctly to server.");

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

/* var objectID = MongoClient.ObjectID;

var insertDocument = function(db, myDocument, callback) {
  db.collection('turna').insertOne(myDocument, function(err, result) {
    assert.equal(err, null);
    // console.log("Inserted a document into the restaurants collection.");
    callback();
  });
};

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  insertDocument(db, myDocument, function() {
    db.close();
  });
});
*/
