var Monk = require('monk');
var fs = require('fs');

var db_name = process.env["DB"] || 'test';
db_name = "localhost/" + db_name;

var db = Monk(db_name);

var rootPath = "./contents/";

var Exporter = {};

function safename(name) {
  return name.replace(/\W/g, '');
};

Exporter.go = function () {
  var Album = db.get('Album');
  var User = db.get('User');

  var query = {
    type: "artist",
    public: true
  }

  User.find(query, {sort:'name'}, function (err, docs) {
    //Export artist data
    docs.forEach(function (el, i, arr) {

      var query = {$or: [
        {title : {$regex : ".*(feat\\..*" + el.name + ").*"}},
        {artists: {$elemMatch: {artistId: el._id}}}
      ]};

      Album.find(query,
        {sort:[['released', -1]]},
        function (err2, docs2) {
          el.releases = docs2;
          el.safename = safename(arr[i].name);
          el.social = {};
          if (el.bookings) {
            el.bookings = el.bookings.replace(/\n/g, '<br/>');
          }
          if (el.managementDetail) {
            el.managementDetail = el.managementDetail.replace(/\n/g, '<br/>');
          }
          el.links.forEach(function (link, i, arr) {
            el.social[link.type] = link;
          });

          el.epsingles = [];
          el.albums = [];

          el.releases.forEach(function (release) {
            if (release.links) {
              release.social = {};
              release.links.forEach(function (link, i, arr) {
                release.social[link.type] = link;
              });
              if (release.social.Soundcloud) {
                release.soundcloud_path = release.social.Soundcloud.url;
              }
            }
            if (release.type === "Single" || release.type === "EP") {
              el.epsingles.push(release);
            } else if (release.type === "Album" || release.type === "Mixes") {
              el.albums.push(release);
            }
          });
          var path = rootPath + "artists/" + el.safename;

          var details = {
            template: "artist.jade",
            locals: path + "/data.json"
          };

          if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
          }
          fs.writeFile(details.locals, JSON.stringify(el));
          fs.writeFile(path + "/index.mcp.json", JSON.stringify(details));
          console.log('Done artist');
        }
      );
    });

    var featured = [];
    var other = [];
    docs.forEach(function (el, i, arr) {
      var doc = {
        _id: el._id,
        url: "/artists/" + safename(el.name) + "/",
        name: el.name,
        profileImage: el.profileImage
      };
      if (el.tier > 0) {
        featured[el.tier-1] = doc;
      }
      other.push(doc);
    });

    var artistDetails = {
      artists: other,
      featured: featured
    };

    var path = rootPath + "artists";

    var details = {
      template: "artists.jade",
      locals: path + "/data.json"
    };

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    fs.writeFile(details.locals, JSON.stringify(artistDetails));
    fs.writeFile(path + "/index.mcp.json", JSON.stringify(details));
    console.log('Done artists');
  });

  Album.find({links:{$elemMatch:{type:"Soundcloud"}}}, {limit:20, sort:[['released', -1]]},
    function (err, docs) {
      var albums = [];
      var eps = [];
      var singles = [];

      docs.forEach(function (release) {
        if (release.links) {
          release.social = {};
          release.links.forEach(function (link, i, arr) {
            release.social[link.type] = link;
          });
          if (release.social.Soundcloud) {
            release.soundcloud_path = release.social.Soundcloud.url;
          }
        }
      });

      var indexData = {
        releases: docs
      };

      var path = rootPath;

      var details = {
        template: "index.jade",
        locals: path + "/data.json"
      };

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
      fs.writeFile(details.locals, JSON.stringify(indexData));
      fs.writeFile(path + "/index.mcp.json", JSON.stringify(details));
      console.log('Done index');
    }
  );

  Album.find({links:{$elemMatch:{type:"Soundcloud"}}}, {sort:[['released', -1]]},
    function (err, docs) {
      var albums = [];
      var eps = [];
      var singles = [];

      docs.forEach(function (release) {
        if (release.links) {
          release.social = {};
          release.links.forEach(function (link, i, arr) {
            release.social[link.type] = link;
          });
          if (release.social.Soundcloud) {
            release.soundcloud_path = release.social.Soundcloud.url;
          }
        }
        if (release.type === "Single") {
          singles.push(release);
        } else if (release.type === "EP") {
          eps.push(release);
        } else if (release.type === "Album") {
          albums.push(release);
        }
      });

      var path = rootPath;

      var releasesData = {
        eps: eps,
        singles: singles,
        albums: albums
      };

      var details = {
        template: "releases.jade",
        locals: path + "/release_data.json"
      };

      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
      fs.writeFile(details.locals, JSON.stringify(releasesData));
      fs.writeFile(path + "/releases.mcp.json", JSON.stringify(details));
      console.log('Done releases');

    }
  );
};

module.exports = Exporter;

Exporter.go();

setTimeout(function() {
  process.exit(1);
}, 2000);
