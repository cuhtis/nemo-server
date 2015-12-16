var ObjectID = require('mongoose').Types.ObjectID
var fs = require('fs');
 
FileDriver = function(db) {
  this.db = db;
};

FileDriver.prototype.getCollection = function(callback) {
  this.db.collection('files', function(err, file_collection) {
    if (err) callback(err);
    else callback(null, file_collection);
  });
};
 
//find a specific file
FileDriver.prototype.get = function(id, callback) { 
  this.getCollection(function(err, file_collection) {
    if (err) callback(err);
    else {
      var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
      if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
      else file_collection.findOne({'_id':ObjectID(id)}, function(err, doc) {
       	if (err) callback(err);
       	else callback(null, doc);
      });
    }
  });
}

FileDriver.prototype.handleGet = function(req, res) {
  var fileId = req.params.id;
  if (fileId) {
    this.get(fileId, function(err, thisFile) {
      if (err) { res.status(400).send(err); }
      else {
        if (thisFile) {
          var filename = fileId + thisFile.ext;
          var filePath = './uploads/'+ filename;
          res.sendfile(filePath);
        } else res.status(404).send('file not found');
      }
    });        
  } else {
	  res.status(404).send('file not found');
  }
}

//save new file
FileDriver.prototype.save = function(obj, callback) {
  this.getCollection(function(err, the_collection) {
    if (err) callback(err);
    else {
      obj.created_at = new Date();
      the_collection.insert(obj, function() {
        callback(null, obj);
      });
    }
  });
};
 
FileDriver.prototype.getNewFileId = function(newobj, callback) {
	this.save(newobj, function(err,obj) {
		if (err) { callback(err); } 
		else { callback(null,obj._id); }
	});
};

FileDriver.prototype.handleUploadRequest = function(req, res) {
  var ctype = req.get("content-type");
  var ext = ctype.substr(ctype.indexOf('/')+1);
  if (ext) {ext = '.' + ext; } else {ext = ''};
  this.getNewFileId({'content-type':ctype, 'ext':ext}, function(err,id) {
    if (err) { res.status(400).send(err); } 
    else { 	         
      var filename = id + ext;
      filePath = __dirname + '/uploads/' + filename;
      var writable = fs.createWriteStream(filePath);
	    req.pipe(writable);
      req.on('end', function (){
        res.status(201).send({'_id':id});
      });               
      writable.on('error', function(err) {
        res.status(500).send(err);
      });
    }
  });
};
 
exports.FileDriver = FileDriver;
