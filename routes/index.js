var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var CollectionDriver = require('../collectionDriver').CollectionDriver;
var collectionDriver = new CollectionDriver(mongoose.connection.db);

router.get('/:collection', function(req, res) {
  var params = req.params;
  collectionDriver.findAll(req.params.collection, function(error, objs) {
    if (error) { res.send(400, error); }
	  else { 
	    if (req.accepts('html')) {
    	  res.render('data',{objects: objs, collection: req.params.collection});
      } else {
	      res.set('Content-Type','application/json');
        res.status(200).send(objs);
      }
    }
 	});
});
 
router.get('/:collection/:entity', function(req, res) {
  var params = req.params;
  var entity = params.entity;
  var collection = params.collection;
  if (entity) {
    collectionDriver.get(collection, entity, function(err, objs) {
      if (err) { res.status(400).send(err); }
      else { res.status(200).send(objs); }
    });
  } else {
    res.status(400).send({error: 'bad url', url: req.url});
  }
});

router.post('/:collection', function(req, res) {
  var object = req.body;
  var collection = req.params.collection;
  collectionDriver.save(collection, object, function(err,docs) {
    if (err) { res.status(400).send(err); } 
    else { res.status(201).send(docs); }
  });
});

router.put('/:collection/:entity', function(req, res) {
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
