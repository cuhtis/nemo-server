var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var FileDriver = require('../fileDriver').FileDriver;
var fileDriver = new FileDriver(mongoose.connection.db);
var CollectionDriver = require('../collectionDriver').CollectionDriver;
var collectionDriver = new CollectionDriver(mongoose.connection.db);

router.post('/files', function(req,res) {
  fileDriver.handleUploadRequest(req,res);
});

router.get('/files/:id', function(req, res) {
  fileDriver.handleGet(req,res);
}); 

router.get('/:collection', function(req, res) {
  console.log("FIND ALL");
  var params = req.params;
  collectionDriver.findAll(req.params.collection, function(error, objs) {
    if (error) { res.status(400).send(error); }
	  else { 
      res.set('Content-Type','application/json');
      res.status(200).send(objs);
    }
 	});
});
 
router.get('/:collection/:entity', function(req, res) {
  console.log("FIND ONE");
  var params = req.params;
  var entity = params.entity;
  var collection = params.collection;
  collectionDriver.get(collection, entity, function(err, objs) {
    if (err) { res.status(400).send(err); }
    else { res.status(200).send(objs); }
  });
});

router.post('/:collection', function(req, res) {
  console.log("CREATE");
  var object = req.body;
  var collection = req.params.collection;
  collectionDriver.save(collection, object, function(err,docs) {
    if (err) { res.status(400).send(err); } 
    else { res.status(201).send(docs); }
  });
});

router.put('/:collection/:entity', function(req, res) {
  console.log("UPDATE");
  console.log (req.params);
  var params = req.params;
  var entity = params.entity;
  var collection = params.collection;
  if (entity) {
    collectionDriver.update(collection, req.body, entity, function(err, objs) {
      if (err) { res.status(400).send(err); }
      else { res.status(200).send(objs); }
    });
  } else {
	  var error = { "message" : "Cannot PUT a whole collection" }
	  res.send(400, error);
  }
});

router.delete('/:collection/:entity', function(req, res) {
  console.log("DELETE");
  var params = req.params;
  var entity = params.entity;
  var collection = params.collection;
  if (entity) {
    collectionDriver.delete(collection, entity, function(err, objs) {
      if (err) { res.status(400).send(err); }
      else { res.status(200).send(objs); }
    });
  } else {
    var error = { "message" : "Cannot DELETE a whole collection" }
    res.status(400).send(error);
  }
});

module.exports = router;
