angular.module('SMARTLobby.factories', [])

  .factory('VisitorsFactory', function ($q, $http, APP_CONFIG) {

    function Visitor(guest_contact_1, guest_contact_2, guest_checkInDateTime,
                     guest_image, guest_name, guest_organization,
                     host_contact_1, host_contact_2, host_checkInDateTime,
                     host_image, host_name, host_organization,
                     meetingID) {

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
      this.id = '';

      this.meetingID = meetingID;
    }

    var defer = $q.defer();

    return {
      getAllVisitors: function () {
        $http.jsonp(APP_CONFIG.BASE_URI + APP_CONFIG.GET_VISITORS + '&callback=JSON_CALLBACK').
          success(function (data, status, headers, config) {
        //$http.get('/test/visitors-list.json').
        //  success(function (data, status, headers, config) {
            console.log('JSON from ' + APP_CONFIG.BASE_URI + APP_CONFIG.GET_VISITORS + '\t' + JSON.stringify(data));

            var visitors = [];

            angular.forEach(data.v, function (visitor) {

              var v = new Visitor(visitor.g.c1, visitor.g.c2, visitor.g.ci, visitor.g.img, visitor.g.n, visitor.g.o,
                visitor.h.c1, visitor.h.c2, visitor.h.ci, visitor.h.img, visitor.h.n, visitor.h.o,
                visitor.sr);

              visitors.push(v);
            });

            // To test with /test/visitors-list.json
            //angular.forEach(data.v, function (visitor) {
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
      }
    };
  })
  .factory('StatsFactory', function ($http, $q, APP_CONFIG) {

    function Site(off, siteId, siteName, tActiveHost, tCin, tOnSite) {
      this.timeAtSite = off;
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
    };

    var defer = $q.defer();

    return {
      getAllStats: function () {
        $http.jsonp(APP_CONFIG.BASE_URI + APP_CONFIG.GET_STATS + '&callback=JSON_CALLBACK').
          success(function (data, status, headers, config) {
            console.log('JSON from ' + APP_CONFIG.BASE_URI + APP_CONFIG.GET_STATS + '\t' + JSON.stringify(data));

            var siteList = [];
            var siteDetailsList = [];

            // Destructuring each site
            angular.forEach(data.v.i, function (site) {
              var site = new Site(site.off, site.siteId, site.siteName, site.tActiveHost,
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
  .factory('TimerFactory', function ($http, $q) {
    var deferred = $q.defer();

    var timerFactory = {};

    timerFactory.getStats = function () {
      $http.get('./test/stats.json')
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
  });

