var fs          = require('fs');
var path        = require('path');
var through     = require('through2');
var gutil       = require('gulp-util');
var mdformatter = require('./gallery-formatter');
var helper      = require('./gallery-helper');


var galleryItems = [];
function getGalleryItems() {
    return galleryItems;
}

function sortByName(list) {
    list.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
}

function buildGalleryDef(docPath, fileContent) {
    // Get some description text from md content
    var docContent = mdformatter.getGalleryDescription(fileContent);
    docContent.path = docPath;
    return docContent;
}

function combine (file, encoding, callback) {
    const normalizedPath = helper.normalizePath(file.path);
    if (!normalizedPath || file.isNull() || file.isDirectory()) {
        return callback();
    }

    if (['.md'].indexOf(path.extname(normalizedPath)) !== -1) {
        // build the bundle documentation structure
        var fileContent = fs.readFileSync(file.path, "utf8");
        var def = buildGalleryDef(normalizedPath, fileContent);
        getGalleryItems().push(def);
    }
    return callback();
}
function flush (callback) {
    var target = new gutil.File();
    target.path = 'gallery.json';
    var content = JSON.stringify(getGalleryItems(), null, 2);
    target.contents = Buffer.from(content);

  	this.push(target);
    this.emit('data', target);

    this.emit('end');
  	return callback()
}

module.exports = function() {
	return through({objectMode: true}, combine, flush);
}