var ObjectID = require('mongoose').ObjectID;

CollectionDriver = function(db) {
  this.db = db;
};

CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(err, collection) {
    if (err) callback(err);
    else callback(null, collection);
  });
};

//find all objects for a collection
CollectionDriver.prototype.findAll = function(collectionName, callback) {
  this.getCollection(collectionName, function(err, collection) {
    if (err) callback(err);
    else {
      collection.find().toArray(function(err, results) {
        if (err) callback(err);
        else callback(null, results)
      });
    }
  });
};

//find a specific object
CollectionDriver.prototype.get = function(collectionName, id, callback) {
  this.getCollection(collectionName, function(err, collection) {
    if (err) callback(err);
    else {
      var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
      if (!checkForHexRegExp.test(id)) callback({ error: "invalid id" });
      else collection.findOne({ '_id': ObjectID(id) }, function(err, doc) {
       	if (err) callback(err);
       	else callback(null, doc);
      });
    }
  });
}

//save new object
CollectionDriver.prototype.save = function(collectionName, obj, callback) {
  this.getCollection(collectionName, function(err, collection) {
    if (err) callback(err);
    else {
      obj.created_at = new Date();
      collection.insert(obj, function() {
        callback(null, obj);
      });
    }
  });
};

//update a specific object
CollectionDriver.prototype.update = function(collectionName, obj, entityId, callback) {
  this.getCollection(collectionName, function(err, collection) {
    if (err) callback(err);
    else {
	    obj._id = ObjectID(entityId);
      obj.updated_at = new Date();
      collection.save(obj, function(err, doc) {
        if (err) callback(err);
        else callback(null, obj);
      });
    }
  });
}

//delete a specific object
CollectionDriver.prototype.delete = function(collectionName, entityId, callback) {
  this.getCollection(collectionName, function(err, collection) {
    if (err) callback(err);
    else {
      collection.remove({'_id':ObjectID(entityId)}, function(err, doc) {
        if (err) callback(err);
        else callback(null, doc);
      });
    }
  });
}

exports.CollectionDriver = CollectionDriver;
