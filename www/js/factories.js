angular.module('SMARTLobby.factories', [])

  .factory('VisitorsFactory', function ($q, $http, APP_CONFIG, localStorageService) {

    function Visitor(guest_contact_1, guest_contact_2, guest_checkInDateTime,
                     guest_image, guest_name, guest_organization,
                     host_contact_1, host_contact_2, host_checkInDateTime,
                     host_image, host_name, host_organization,
                     meetingID, guestId, avatarImg) {

      this.contact_1 = guest_contact_1;
      this.contact_2 = guest_contact_2;
      this.contactStatus = 'Uncontacted';
      this.checkInDateTime = guest_checkInDateTime;
      this.image = guest_image || 'img/visitor.png';
      this.name = guest_name;
      this.organization = guest_organization;

      this.host_contact_1 = host_contact_1;
      this.host_contact_2 = host_contact_2;
      this.host_checkInDateTime = host_checkInDateTime;
      this.host_image = host_image || 'img/visitor.png';
      this.host_name = host_name;
      this.host_organization = host_organization;

      this.remark = '';
      this.guestId = guestId;
      this.avatarImg = avatarImg || 'img/visitor.png';

      this.meetingID = meetingID;
      this.contactStatusLastUpdatedTime = new Date().getTime().toString();
      this.apiLastCalledTime = new Date().getTime().toString();
    }

    return {
      getAllVisitors: function () {
        var defer = $q.defer();

        var ip = localStorageService.get(APP_CONFIG.BASE_IP);
        var port = APP_CONFIG.PORT;

        var http = localStorageService.get(APP_CONFIG.IS_HTTPS) ? 'https' : 'http';
        var site = JSON.parse(localStorageService.get(APP_CONFIG.SITE.SELECTED_SITE));

        $http.jsonp(http + '://' + ip + port + '/' + APP_CONFIG.GET_VISITORS + '&s=' + site.siteId + '&callback=JSON_CALLBACK').
          success(function (data, status, headers, config) {
        //$http.get('./mock-json/visitors-list.json').
        //  success(function (data, status, headers, config) {
            console.log('JSON from ' + http + '://' + ip + port + '/' + APP_CONFIG.GET_VISITORS + '&s=' + site.siteId + '\t' + JSON.stringify(data));

            var visitors = [];

            angular.forEach(data.v, function (visitor) {

              var avatarImg = null;

              if(visitor.g.img) {
                avatarImg = http + '://' + ip + port + '/' + APP_CONFIG.PHOTO_DIR + visitor.g.img;
              }

              var v = new Visitor(visitor.g.c1, visitor.g.c2, visitor.g.ci, visitor.g.img, visitor.g.n, visitor.g.o,
                visitor.h.c1, visitor.h.c2, visitor.h.ci, visitor.h.img, visitor.h.n, visitor.h.o,
                visitor.sr, visitor.g.vid, avatarImg);

              visitors.push(v);
            });

            // Uncomment to test with mock json data structure
            //angular.forEach(data, function (visitor) {
            //
            //  var v = new Visitor(visitor.g.c1, visitor.g.c2, visitor.g.ci, visitor.g.img, visitor.g.n, visitor.g.o,
            //    visitor.h.c1, visitor.h.c2, visitor.h.ci, visitor.h.img, visitor.h.n, visitor.h.o,
            //    visitor.sr);
            //
            //  visitors.push(v);
            //});

            defer.resolve(visitors);
          })
          .error(function (err) {
            defer.reject(err);
          });

        return defer.promise;
      },
      checkOutVisitor: function(guestId) {
        var defer = $q.defer();

        var ip = localStorageService.get(APP_CONFIG.BASE_IP);
        var port = APP_CONFIG.PORT;

        var http = localStorageService.get(APP_CONFIG.IS_HTTPS) ? 'https' : 'http';

        $http.jsonp(http + '://' + ip + port + '/' + APP_CONFIG.CHECK_OUT + '&vid=' + guestId + '&callback=JSON_CALLBACK').
          success(function (data, status, headers, config) {

            console.log('JSON from ' + http + '://' + ip + port + '/' + APP_CONFIG.CHECK_OUT + '\t' + JSON.stringify(data));

            defer.resolve({success: true});
          })
          .error(function (err) {
            defer.reject(err);
          });

        return defer.promise;
      },
      pushEmergencyContactStatus: function(visitors) {
        var defer = $q.defer();

        var ip = localStorageService.get(APP_CONFIG.BASE_IP);
        var port = APP_CONFIG.PORT;

        var http = localStorageService.get(APP_CONFIG.IS_HTTPS) ? 'https' : 'http';

        var site = JSON.parse(localStorageService.get('SELECTED_SITE'));
        var siteId = site.siteId;

        var allV = JSON.stringify(visitors);

        var url = http + '://' + ip + port + '/' + APP_CONFIG.UPDATE_CONTACT_STATUS + '&m_u=' + siteId;

        $http({
          method: 'POST',
          url: url,
          data: allV,
          headers: {'Content-Type': 'application/json'}
        }).then(function(data) {
          console.log('JSON from ' + url + '\t' + JSON.stringify(data));

          defer.resolve(data);
        }, function(err) {
          defer.reject(err);
        });

        return defer.promise;
      }
    };
  })
  .factory('StatsFactory', function ($http, $q, APP_CONFIG, localStorageService) {

    function Site(off, longSiteId, siteId, siteName, tActiveHost, tCin, tOnSite) {
      this.timeAtSite = off;
      this.longSiteId = longSiteId;
      this.siteId = siteId;
      this.siteName = siteName;
      this.inBuildingHost = tActiveHost;
      this.totalCheckin = tCin;
      this.inBuildingVisitor = tOnSite;
      this.siteDetails = [];
    }

    function SiteDetails(cin, cout, key, siteId, tOnSite) {
      this.checkin = cin;
      this.checkout = cout;
      this.key = key;
      this.siteId = siteId;
      this.inBuildingVisitor = tOnSite;
    }

    return {
      getAllStats: function () {
        var defer = $q.defer();

        var ip = localStorageService.get(APP_CONFIG.BASE_IP);
        var port = APP_CONFIG.PORT;

        var http = localStorageService.get(APP_CONFIG.IS_HTTPS) ? 'https' : 'http';

        $http.jsonp(http + '://' + ip + port + '/' + APP_CONFIG.GET_STATS + '&callback=JSON_CALLBACK').
          success(function (data, status, headers, config) {
            console.log('JSON from ' + http + '://' + ip + port + '/' + APP_CONFIG.GET_STATS + '\t' + JSON.stringify(data));

            var siteList = [];
            var siteDetailsList = [];

            // Destructuring each site
            angular.forEach(data.v.i, function (site) {
              var site = new Site(site.off, site.id, site.siteId, site.siteName, site.tActiveHost,
                site.tCin, site.tOnSite);

              siteList.push(site);
            });

            // Destructuring each site details
            angular.forEach(data.v.s, function (details) {
              var siteDetails = new SiteDetails(details.cin, details.cout,
                details.key, details.siteId, details.tOnSite);

              siteDetailsList.push(siteDetails);
            });

            // Adding all site details to sites by siteId
            angular.forEach(siteDetailsList, function (sd) {
              angular.forEach(siteList, function (s) {
                if (sd.siteId === s.siteId) {
                  s.siteDetails.push(sd);
                }
              });
            });

            defer.resolve(siteList);
          })
          .error(function (err) {
            defer.reject(err);
          });

        return defer.promise;
      }
    }

  })
  .factory('AuthFactory', function ($http, $q) {
    return {
      authServer: function (ip, isHTTPS) {
        var defer = $q.defer();

        var port = APP_CONFIG.PORT;

        var http = isHTTPS ? 'https' : 'http';

        $http.jsonp(http + '://' + ip + port + '/' + APP_CONFIG.GET_STATS + '&callback=JSON_CALLBACK').
          success(function (data, status, headers, config) {
            defer.resolve({auth: true});
          })
          .error(function (error) {
            defer.reject({auth: false});
          })

        return defer.promise;
      }
    };
  })
  .factory('TimerFactory', function ($http, $q) {
    var deferred = $q.defer();

    var timerFactory = {};

    timerFactory.getStats = function () {
      $http.get('./js/stats.json')
        .success(function (data, status) {
          deferred.resolve(data);

        })
        .error(function (data, status) {
          deferred.reject(data);
        });

      return deferred.promise;
    };

    return timerFactory;
  })
  .factory('MaskFactory', function ($ionicLoading) {
    var maskTypes = {
      success: {
        icon: '',
        dur: 1000,
        color: ''
      },
      warning: {
        icon: 'ion-alert ',
        dur: 1000,
        color: ''
      },
      error: {
        icon: 'ion-alert assertive',
        dur: 1500,
        color: 'assertive'
      }
    };

    return {
      showMask: function (type, msg) {
        $ionicLoading.show({
          template: '<label class="' + type.color + '">' + msg + '</label>' + ' <i class="' + type.icon + '"/>',
          noBackdrop: true,
          duration: type.dur
        });
      },
      loadingMask: function (show, msg) {
        if (show) {
          $ionicLoading.show({
            template: '<img src="img/ajax-loader.gif"/>' + msg,
            noBackdrop: false
          });
        } else {
          $ionicLoading.hide();
        }

      },
      warning: maskTypes.warning,
      error: maskTypes.error,
      success: maskTypes.success
    };
  })
  .factory('VisitorsStorageFactory', function ($q) {
    var _db;

    var _visitors;

    return {
      initDB: initDB,

      getAllVisitors: getAllVisitors,
      getVisitor: getVisitor,
      addVisitor: addVisitor,
      updateVisitor: updateVisitor,
      deleteVisitor: deleteVisitor,
      deleteAllRecords: deleteAllRecords
    }

    function initDB() {
      // Creates the websql database or opens if it already exists
      // Avoiding Cordova SQLite, built-in IndexedDB and WebSQL adapters are nearly always more performant and stable
      _db = new PouchDB('visitors', {adapter: 'websql'});

      //console.log(_db.adapter);
      _db.info().then(console.log.bind(console));
    };

    function addVisitor(visitor) {
      return $q.when(_db.post(visitor));
    }

    function updateVisitor(visitor) {
      return $q.when(_db.put(visitor));
    }

    function deleteVisitor(visitor) {
      return $q.when(_db.remove(visitor));
    }

    function deleteAllRecords() {
      return $q.when(_db.allDocs({include_docs: true}).then(function (result) {

        return $q.all(result.rows.map(function (row) {
          return _db.remove(row.id, row.value.rev);
        }));
      }));
    }

    function getAllVisitors() {
      if (!_visitors) {
        return $q.when(_db.allDocs({include_docs: true}))
          .then(function (docs) {

            // Each row has a .doc object and we just want to send an
            // array of visitor objects back to the calling controller,
            // so let's map the array to contain just the .doc objects.
            _visitors = docs.rows.map(function (row) {
              // Dates are not automatically converted from a string.
              row.doc.Date = new Date(row.doc.Date);
              return row.doc;
            });

            // Listen for changes on the database.
            _db.changes({live: true, since: 'now', include_docs: true})
              .on('change', onDatabaseChange);

            return _visitors;
          });
      } else {
        // Return cached data as a promise
        return $q.when(_visitors);
      }
    }

    // _db.find() is an extension from pouchdb.find.js
    function getVisitor(name) {
      return _db.find({
        selector: {name: {$eq: name}}
      });
    }

    function onDatabaseChange(change) {
      var index = findIndex(_visitors, change.id);
      var visitor = _visitors[index];

      if (change.deleted) {
        if (visitor) {
          _visitors.splice(index, 1); // delete
        }
      } else {
        if (visitor && visitor._id === change.id) {
          _visitors[index] = change.doc; // update
        } else {
          _visitors.splice(index, 0, change.doc) // insert
        }
      }
    }

    // Binary search, the array is by default sorted by _id.
    function findIndex(array, id) {
      var low = 0, high = array.length, mid;
      while (low < high) {
        mid = (low + high) >>> 1;
        array[mid]._id < id ? low = mid + 1 : high = mid
      }
      return low;
    }

  })



