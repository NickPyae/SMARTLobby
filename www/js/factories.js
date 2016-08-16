angular.module('SMARTLobby.factories', [])

  .factory('Visitors', function ($q, $http) {

    function Visitor(id, name, companyName, checkInDateTime, hostName, hostNumber, img, checkInStatus,
                     contactStatus, contact_1, contact_2, meetingID) {
      this.id = id;
      this.name = name;
      this.companyName = companyName;
      this.checkInDateTime = checkInDateTime;
      this.hostName = hostName;
      this.hostNumber = hostNumber;
      this.img = img || 'img/visitor.png';
      this.checkInStatus = null;
      this.contactStatus = contactStatus || 'Uncontacted';
      this.contact_1 = contact_1;
      this.contact_2 = contact_2;
      this.meetingID = meetingID;
      this.isChecked = false;
    }

    function Host(companyName, name, contact_1, contact_2, img, checkInDateTime) {
      this.companyName = companyName;
      this.name = name;
      this.contact_1 = contact_1;
      this.contact_2 = contact_2;
      this.img = img || 'img/visitor.png';
      this.checkInDateTime = checkInDateTime;
    }

    function MeetingDetail(id, location, roomImage, companyName, meetingSubject, hostName, hostNumber, meetingDate, visitors) {
      this.id = id;
      this.location = location || 'Orion @ Paya Lebar Road';
      this.roomImage = roomImage || 'img/16pax-2.jpg';
      this.companyName = companyName || 'NexLabs Pte Ltd';
      this.meetingSubject = meetingSubject || 'New project meeting. Lobby Ambassador mobile for iOS and android platforms.';
      this.meetingHost = hostName || 'Nick';
      this.hostNumber = hostNumber;
      this.meetingDate = meetingDate || new Date().toDateString();
      this.attendees = visitors;
    }

    var defer = $q.defer();

    var visitors = [];

    this.updatedVisitors = [];

    return {
      getAllVisitors: function () {
        $http.get('./test/visitors-list.json')
          .success(function (data) {
            var allVisitors = [];

            angular.forEach(data, function (item, index) {
              allVisitors.push(
                new Visitor(
                  index, item.g.n, item.g.o, item.g.ci, item.h.n, item.h.c1, item.g.img, '', '',
                  item.g.c1, item.g.c2, item.sr.id
                ));
            });

            // For testing purpose only
            visitors = allVisitors;

            defer.resolve(visitors);
          })
          .error(function (err) {
            defer.reject(err);
          })

        return defer.promise;
      },
      getMeetingDetail: function (meetingID) {
        var hostNumber = null;

        if (parseInt(meetingID) === 1) {

          angular.forEach(this.getUpdatedVisitors(), function(visitor) {
            if(parseInt(visitor.meetingID) === 1) {
              hostNumber = visitor.hostNumber;
            }
          });

          return new MeetingDetail(
            meetingID, '', '', '', '', '', hostNumber, '', this.getUpdatedVisitors()
          );
        } else {
          return null;
        }
      },
      updateVisitors: function(visitors) {
        this.updatedVisitors = visitors;
      },
      getUpdatedVisitors: function() {
            return this.updatedVisitors;
      }
    };
  })
  .factory('TimerFactory', ['$http', '$q', function ($http, $q) {
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
  }])
  .factory('MaskFactory', function($ionicLoading, $rootScope) {
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
    $rootScope.exitImageFullscreen = function () {
      $ionicLoading.hide();
    };
    return{
      showMask:function(type, msg){
        $ionicLoading.show({
          template:  '<label class="' +  type.color +'">' + msg + '</label>' + ' <i class="' + type.icon + '"/>',
          noBackdrop: true,
          duration:type.dur
        });
      },
      imageMask:function(url){

        if(ionic.Platform.isAndroid()) {
          $ionicLoading.show({
            template: '<ion-view title="Home" style="background-color:transparent;"  hide-nav-bar="true"><span class="icon ion-ios-close" style="position: fixed;top:10px;right: 10px;font-size:1.5em;" ng-click="exitImageFullscreen()">&nbsp;close</span><ion-scroll zooming="true" direction="xy" scrollbar-x="false" scrollbar-y="false" min-zoom="1" id="scrolly"  style="width: 100%; height: 80%;top:10%;"><img src="' + url + '"></img></ion-scroll></ion-view>',
            noBackdrop: false
            //,scope: _scope

          });
        } else {
          $ionicLoading.show({
            template: '<ion-view title="Home" style="background-color:transparent;"  hide-nav-bar="true"><span class="icon ion-ios-close" style="position: fixed;top:28px;right: 10px;font-size:1.5em;" ng-click="exitImageFullscreen()">&nbsp;close</span><ion-scroll zooming="true" direction="xy" scrollbar-x="false" scrollbar-y="false" min-zoom="1" id="scrolly"  style="width: 100%; height: 80%;top:10%;"><img src="' + url + '"></img></ion-scroll></ion-view>',
            noBackdrop: false
            //,scope: _scope

          });
        }

      },
      confirmMask:function(title, msg, s, fnCall){
        $ionicLoading.show({
          scope: s,
          template: '<div style="height:100%;width:100%"> <h2>' + title + '</h2><p>' + msg + '</p><br><p><button class="button button-positive" ng-click="'+ fnCall + '()">Yes</button><button class="button button-default" ng-click="closeMask()">No</button></p>',
          noBackdrop: false
        });
      },
      loadingMask:function(show, msg){
        if(show){
          $ionicLoading.show({
            template: '<img src="img/ajax-loader.gif"/>' + msg,
            noBackdrop: false
          });
        }else{
          $ionicLoading.hide();
        }

      },
      warning: maskTypes.warning,
      error: maskTypes.error,
      success: maskTypes.success
    };
  });

