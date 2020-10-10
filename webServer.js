"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');
var fs = require("fs");

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

var allUsers;

app.use(session({ secret: 'secretKey', resave: false, saveUninitialized: false }));
app.use(bodyParser.json());

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!


mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            { name: 'user', collection: User },
            { name: 'photo', collection: Photo },
            { name: 'schemaInfo', collection: SchemaInfo }
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.login_name) {

        response.status(401).send();
    } else {
        User.find({}, function (err, info) {

            if (err) {
                console.error('Doing /user/list error:', err);
                response.status(400).send(JSON.stringify(err));
            } else {
                allUsers = info;
                info = JSON.parse(JSON.stringify(info));
                async.each(info, function (oneUser, callback) {
                    delete oneUser.location;
                    delete oneUser.description;
                    delete oneUser.occupation;
                    delete oneUser.__v;
                    delete oneUser.login_name;
                    delete oneUser.password
                    callback(err);
                }, function (err) {
                    if (err) response.status(500).send(JSON.stringify(err));
                    else response.json(info);
                })


            }
        })
    }

});
/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.login_name) {
        response.status(401).send();
    } else {
        var id = request.params.id;

        User.findById(id, function (err, info) {
            if (err) {
                console.error('Loading /user/:id error:');
                response.status(400).send(JSON.stringify(err));
            } else {

                if (info) {
                    info = JSON.parse(JSON.stringify(info));
                    delete info.__v;
                    delete info.login_name;
                    delete info.password;
                }
                response.json(info);
            }

        })
    }

});

app.get('/commentsOfPhoto/:photo_id', function (request, response) {
    if (!request.session.login_name) {
        response.status(401).send();
    } else {
        var photo_id = request.params.photo_id;
        Photo.findOne({ _id: photo_id }, function (err, photo) {
            if (err) {
                console.error('photo not found');
                response.status(400).send(JSON.stringify(err));
            } else {
                // console.log(photo);
                response.json(photo.comments);
            }
        })
    }
})

app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    var photo_id = request.params.photo_id;
    var comment_in = request.body.comment;
    Photo.findOne({ _id: photo_id }, function (err, photo) {
        if (err) {
            console.error('photo not found');
            response.status(400).send(JSON.stringify(err));
        } else {
            if (!comment_in) {
                response.status(400).send();
            } else {
                photo.comments = photo.comments.concat([{
                    comment: comment_in,
                    date_time: Date.now(),
                    user_id: request.session.user_id
                }]);

                photo.save();
            }
            response.json(photo.comments);
        }
    })
})

app.post('/user', function (request, response) {
    User.findOne({ login_name: request.body.loginName }, function (err, photo) {
        if (err) {
            response.status(400).send();
        } else {
            if (!photo) {
                User.create({
                    login_name: request.body.loginName, // The login_name.
                    first_name: request.body.firstName, // First name of the user.
                    last_name: request.body.lastName,  // Last name of the user.
                    location: request.body.location,    // Location  of the user.
                    description: request.body.description,  // A brief user description
                    occupation: request.body.occupation,
                    password: request.body.password
                },
                    function doneCallBack(err, newUser) {
                        if (err) {
                            console.error(err);
                        }
                        newUser.save();
                        console.log('Created object with ID', newUser._id, newUser);
                    });
                response.status(200).send();
            } else {
                response.status(400).send();
            }

        }
    })

})

app.post('/photos/new', function (request, response) {

    processFormBody(request, response, function (err) {
        let permitted_users = request.body.new;

        let visible_users = [];
        console.log(request);
        for (let i = 0; i < allUsers.length; i++) {
            if (permitted_users.includes(allUsers[i]._id)) {
                visible_users.push(allUsers[i]);
            }

        }

        if (err || !request.file) {
            response.status(404).send();
            // XXX -  Insert error handling code here.
            return;
        }

        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        var timestamp = new Date().valueOf();
        var filename = 'U' + String(timestamp) + request.file.originalname;

        fs.writeFile("./images/" + filename, request.file.buffer, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            }
        });

        Photo.create({
            file_name: filename, date_time: Date.now(), user_id: request.session.user_id, comment: [], num_likes: 0,
            like_list: [], visibility: visible_users
        }, doneCallBack);
        function doneCallBack(err, newPhoto) {

            newPhoto.save();
            response.status(200).send(newPhoto._id);

            console.log('Created object with ID', newPhoto._id);
        }
    });

})
/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.login_name) {

        response.status(401).send();
    } else {
        var id = request.params.id;
        Photo.find({ user_id: id, visibility: request.session.user_id }, function (err, photos) {
            if (err) {
                console.error('Loading /photosOfUser/:id error:');
                response.status(400).send(JSON.stringify(err));
            } else {
                photos = JSON.parse(JSON.stringify(photos));
                photos.sort((a, b) => { return b.num_likes - a.num_likes });
                var allPhotos = [];
                async.eachSeries(photos,
                    function (photo, callback) {
                        delete photo.__v;
                        delete photo.like_list;
                        delete photo.visibility;
                        delete photo.num_likes;
                        async.eachSeries(photo.comments, function (comment, done_callback) {
                            User.findById(comment.user_id, '_id first_name last_name', function (err, info) {
                                if (err) {
                                    console.error('Cannot find the author of the comment:');
                                    response.status(400).send(JSON.stringify(err));
                                } else {
                                    console.log(info);
                                    comment.user = info;
                                    delete comment.user_id;
                                    console.log("Loading: " + comment.comment);
                                    done_callback(err);
                                }
                            })
                        },
                            function (err) {
                                if (err) {
                                    response.status(400).json(err);
                                } else {
                                    console.log("All Comments loaded.");
                                    callback(err);
                                }

                            });

                        allPhotos.push(photo);
                    },
                    function (err) {
                        if (err) {
                            response.status(400).json(err);
                        } else {
                            console.log("All photos loaded.");
                            response.json(allPhotos);
                        }
                    })
            }
        })
    }
});

app.post('/admin/login', function (request, response) {
    var name = request.body.login_name;
    var password = request.body.password;
    User.findOne({ login_name: name, password: password }, function (err, user) {
        if (err) {
            console.error('The login name entered does not exist!');
            response.status(400).send(JSON.stringify(err));
        } else {
            if (user) {
                console.log(user);
                request.session.user_id = user._id;
                request.session.login_name = name;
                request.session.full_name = user.first_name + ' ' + user.last_name;
                console.log(request.session);
                response.status(200).send({ id: user._id, currentUser: name, _id: user._id });
            } else {
                request.session.destroy(function (err) { response.status(400).send(JSON.stringify(err)) });
                response.status(400).send("err");
            }

        }
    })
});

app.get('/admin/login', function (request, response) {
    response.status(200).send({ id: request.session.user_id, currentUser: request.session.login_name, fullName: request.session.full_name });
})

app.post('/admin/logout', function (request, response) {
    delete request.session.user_id;
    delete request.session.login_name;
    request.session.destroy(function (err) { response.status(400).send(JSON.stringify(err)) });
    response.status(200).send();
})

app.post("/checkPhotoLike/:id", function (request, response) {
    if (!request.session.login_name) {
        response.status(401).send();
    }

    Photo.find({ user_id: request.params.id }, function (err, photos) {
        if (err) {
            console.error('Loading /photoLikes/:id error:');
            response.status(400).send(JSON.stringify(err));
        } else {
            // if (reorder) {
            // photos = JSON.parse(JSON.stringify(photos));
            photos.sort((a, b) => { return b.num_likes - a.num_likes });
            // }
            let photoLikes = [];
            let numLikes = [];
            async.eachSeries(photos, function (photo, callback) {
                if (photo.like_list.includes(request.session.user_id)) {
                    photoLikes = photoLikes.concat([1]);
                    numLikes = numLikes.concat([photo.num_likes]);
                } else {
                    photoLikes = photoLikes.concat([0]);
                    numLikes = numLikes.concat([photo.num_likes]);
                }
                callback();
            }, function (err) {
                if (err) {
                    console.error('Likelist Construction Error');
                    response.status(400).send(JSON.stringify(err));
                } else {
                    console.log(photoLikes);
                    console.log("Likelist Successfully Constructed");
                    response.json({ photoLikes: photoLikes, numLikes: numLikes });
                }
            });
        }
    });
})

app.post("/likePhoto/:photo_id", function (request, response) {
    if (!request.session.login_name) {
        response.status(401).send();
    }
    Photo.findById(request.params.photo_id, function (err, photo) {
        if (err) {
            console.error('Like Photo error:');
            response.status(400).send(JSON.stringify(err));
        } else {
            photo.num_likes += 1;
            photo.like_list = photo.like_list.concat([request.session.user_id]);
            photo.save();
            response.json(photo);
        }
    })
});

app.post("/dislikePhoto/:photo_id", function (request, response) {
    if (!request.session.login_name) {
        response.status(401).send();
    }
    Photo.findById(request.params.photo_id, function (err, photo) {
        if (err) {
            console.error('Like Photo error:');
            response.status(400).send(JSON.stringify(err));
        } else {
            photo.num_likes -= 1;
            let index = photo.like_list.indexOf(request.session.user_id);
            if (index != -1) photo.like_list.splice(index, 1);
            photo.save();
            response.json(photo);
        }
    })
});

app.post("/delete/comment/:photo_id/:comment_id", function (req, res) {

    Photo.findById(req.params.photo_id, function (err, photo) {
        if (err) {
            console.error("Cannot find the photo with that comment");
            res.status(400).send(JSON.stringify(err));
        } else {
            console.log(req.params.comment_id)
            let newComments = photo.comments.filter(elem => {
                console.log(elem._id);
                if (elem._id != req.params.comment_id) {
                    console.log(elem);
                    return elem;
                }
            })
            photo.comments = newComments;
            photo.save();
            res.json('Comment with id ' + req.params.comment_id + ' deleted.');
        }
    })
})

app.post("/delete/photo/:photo_id", function (req, res) {
    if (!req.session.login_name) {
        res.status(401).send();
    }
    Photo.deleteOne({ _id: req.params.photo_id }).then(res.json('ok'))



})

app.post("/delete/user/:user_id", function (req, res) {
    if (!req.session.login_name) {
        res.status(401).send();
    }

    Photo.find({}, function (err, photos) {
        if (err) {
            res.status(400).send();
        } else {
            async.each(photos, function (photo, callback) {
                let newComments = photo.comments.filter(elem => {
                    if (elem.user_id != req.params.user_id) {

                        return elem;
                    }
                });
                photo.comments = newComments;
                photo.save();
                callback(err);

            }, function (err) {
                if (err) response.status(500).send(JSON.stringify(err));
                else console.log("Comments of the user has been deleted.");
            })
        }
    }).then(
        User.deleteOne({ _id: req.params.user_id }).then(res.json('ok'))).then(Photo.deleteMany({ user_id: req.params.user_id })).catch(
            err => console.log(err));
    console.log('The user has been deleted.')

})

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);

});

