var fs = require('fs'),
    rimraf = require('rimraf'),
    path = require('path');

var mkdirp = function(dir) {
    'use strict';

    if (!fs.existsSync(dir)) {
        var s = '/';
        dir.split(path.sep).forEach(function(p) {
            p = path.join(s, p);

            if (!fs.existsSync(p)) {
                fs.mkdirSync(p);
            }
            s = p;
        });
    }
};

var cp = function(src, dest, merge) {
    'use strict';

    return new Promise(function(resolve, reject) {
        var exists = fs.existsSync(src);
        var stats = exists && fs.statSync(src);
        var isDirectory = exists && stats.isDirectory();
        // if (exists && isDirectory) {
        if (exists) {
            if (isDirectory) {
                var promises = [];

                try {
                    fs.mkdirSync(dest);
                } catch(e) {
                    if (!merge) {
                        throw e;
                    }
                }

                fs.readdirSync(src).forEach(function(childItemName) {
                    promises.push(cp(
                        path.join(src, childItemName),
                        path.join(dest, childItemName)
                    ));
                });

                Promise.all(promises)
                    .then(resolve, reject);
            } else {
                var destS = fs.createWriteStream(dest);
                fs.createReadStream(src).pipe(destS);

                destS.on('finish', function() {
                    resolve();
                });

                destS.on('error', function(err) {
                    reject(err);
                });
            }
        }
    });
};

module.exports = {
    mkdirp: mkdirp,
    cp: cp,
    rm: rimraf.sync
};