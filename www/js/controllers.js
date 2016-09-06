angular.module('SMARTLobby.controllers', [])

  .controller('LoginCtrl', function ($scope, $state, APP_CONFIG, localStorageService) {
    $scope.ip = '192.168.1.179:9999';

    $scope.login = function () {
      initApp();

      $state.go('tab.visitors');
    };

    function initApp() {
      if(!localStorageService.get(APP_CONFIG.VOIP_SERVICE.SELECTED_SERVICE) && !localStorageService.get(APP_CONFIG.SMS_SERVICE.SELECTED_SERVICE)) {
        console.log('localStorageService empty. initApp');
        localStorageService.set(APP_CONFIG.VOIP_SERVICE.SELECTED_SERVICE, APP_CONFIG.VOIP_SERVICE.ANY);
        localStorageService.set(APP_CONFIG.SMS_SERVICE.SELECTED_SMS, APP_CONFIG.SMS_SERVICE.ANY);
      } else {
        console.log('localStorageService has data.');
      }
    }
  })

  .controller('DashCtrl', function ($rootScope, $scope, $state, APP_CONFIG,
                                    $timeout, TimerService, AppModeService,
                                    $ionicPopup, ionicToast, AppColorThemeService,
                                    StatsFactory, MaskFactory, $ionicPopover, $cordovaNetwork, $ionicScrollDelegate) {

    document.addEventListener('deviceready', function () {
      // listen for Online event
      $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
        // Get all the stats from server
        getAllStats();
      });
    }, false);

    $scope.$on('$ionicView.beforeEnter', function (event, data) {
      if (!AppModeService.getMode()) {
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
      } else {
        $scope.mode = AppModeService.getMode();
      }

      // Get all the stats from server
      getAllStats();

      // Firing this event to update chart
      $rootScope.$broadcast('updatePieChart', $scope.mode);
    });

    $scope.sites = [];

    function getAllStats() {
      MaskFactory.loadingMask(true, 'Loading');

      StatsFactory.getAllStats().then(function (data) {

        $scope.sites = data;

        // Prepopulate 1st site as default site
        if ($scope.sites) {
          $scope.selectedSite = angular.extend({}, $scope.sites[0]);

          // Firing this event to update chart
          // Without $timeout, updateComboChart event cannot be caught inside directive after tab switch
          $timeout(function() {
            $rootScope.$broadcast('updateComboChart', $scope.selectedSite);
            MaskFactory.loadingMask(false);
          }, 0);
        }

      }, function (err) {
        console.log(err);
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Loading dashboard data failed');
      });
    }

    $scope.siteHasChanged = function (site) {

      $scope.selectedSite = angular.extend({}, site);
      // Firing this event to update chart
      $rootScope.$broadcast('updateComboChart', site);
    };

    $ionicPopover.fromTemplateUrl('templates/site-popover.html', {
      scope: $scope,
    }).then(function (popover) {
      $scope.popover = popover;
    });

    // Timer component
    var flipTimer = new FlipClock(angular.element(document.querySelector('.avgWaitTimeClock')),
      {
        clockFace: 'MinuteCounter',
        autoStart: false
      });

    if (TimerService.getStoppage()) {
      flipTimer.setTime(TimerService.getStoppage());
    }

    if (TimerService.getTimer().sec) {
      flipTimer.setTime(TimerService.getTimer().sec);
      flipTimer.start();
    }

    $scope.stopTimer = function () {
      if (TimerService.getTimer().timer) {
        flipTimer.stop();
        TimerService.setStoppage(TimerService.getTimer().sec);
        clearTimer();
      }
    };

    function clearTimer() {
      $timeout.cancel(TimerService.getTimer().timer);
      $scope.sec = 0;
      $scope.timer = null;
      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});
    }

    $scope.toggleMode = function () {
      // Scrolling back to top
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();

      if ($scope.mode === APP_CONFIG.MODE.DEFAULT) {

        var confirmPopup = $ionicPopup.show({
          title: 'Activating ' + APP_CONFIG.MODE.EMERGENCY + ' mode',
          buttons: [
            {text: 'Cancel'},
            {
              text: 'OK',
              type: 'button-dark',
              onTap: function () {
                return APP_CONFIG.MODE.EMERGENCY;
              }
            }
          ],
          template: 'Are you sure you want to activate ' + APP_CONFIG.MODE.EMERGENCY + ' mode?'
        });

        confirmPopup.then(function (res) {
          if (res) {
            // Update global timer sec
            updateTimer();

            if (TimerService.getTimer().sec) {

              flipTimer.setTime(TimerService.getTimer().sec);
              flipTimer.start();
            }

            console.log(APP_CONFIG.MODE.EMERGENCY);

            $scope.mode = APP_CONFIG.MODE.EMERGENCY
            ionicToast.show(APP_CONFIG.MODE.EMERGENCY + ' mode', 'middle', false, 1800);

            // Setting mode
            AppModeService.setMode($scope.mode);

            // Updating tabs and navbar color
            AppColorThemeService.setAppColorTheme(APP_CONFIG.THEME.BAR_EMERGENCY, APP_CONFIG.THEME.TABS_EMERGENCY);

            // Firing this event to update chart
            $rootScope.$broadcast('updatePieChart', $scope.mode);
          }
        });

      } else {
        // Get all the stats from server
        getAllStats();

        // Clear sec and timer
        clearTimer();

        console.log(APP_CONFIG.MODE.DEFAULT);
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
        ionicToast.show(APP_CONFIG.MODE.DEFAULT + ' mode', 'middle', false, 1800);

        // Setting mode
        AppModeService.setMode($scope.mode);

        // Updating tabs and navbar color
        AppColorThemeService.setAppColorTheme(APP_CONFIG.THEME.BAR_DEFAULT, APP_CONFIG.THEME.TABS_DEFAULT);

        // Firing this event to update chart
        $rootScope.$broadcast('updatePieChart', $scope.mode);
      }

    };

    // Global timer in emergency mode
    $scope.sec = 0;
    $scope.timer = null;
    var updateTimer = function () {
      $scope.sec++;
      $scope.timer = $timeout(updateTimer, 1000);

      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});
    };

  })

  .controller('VisitorsCtrl', function ($rootScope, $scope, $state, VisitorsFactory,
                                        VisitorStatusService,
                                        $ionicFilterBar, $ionicPopover, $ionicModal,
                                        $ionicPopup, $ionicListDelegate, $window,
                                        localStorageService, ionicToast,
                                        CallService, SMSService, APP_CONFIG,
                                        ContactStatusService, $timeout, TimerService,
                                        AppModeService, AppColorThemeService,
                                        MaskFactory, $cordovaNetwork, $ionicScrollDelegate) {


    document.addEventListener('deviceready', function () {
      // listen for Online event
      $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
        // Getting all visitors from web service
        getAllVisitors();
      });

    }, false);


    $scope.$on('$ionicView.beforeEnter', function (event, data) {
      console.log(APP_CONFIG);

      if (!AppModeService.getMode()) {
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
      } else {
        $scope.mode = AppModeService.getMode();
      }

      if ($scope.mode === APP_CONFIG.MODE.DEFAULT) {
        $scope.contactStatuses = VisitorStatusService.getNormalContactStatuses();

        $scope.filters = VisitorStatusService.getNormalContactStatusFilters();

      } else {
        $scope.contactStatuses = VisitorStatusService.getEmergencyContactStatuses();

        $scope.filters = VisitorStatusService.getEmergencyContactStatusFilters();
      }

      // Filter visitors depending on the pie chart legend selection
      var contactStatus = ContactStatusService.getContactStatus();

      if (contactStatus) {
        filterVisitorsByStatus(contactStatus);
      }

      // Getting all visitors from web service
      getAllVisitors();
    });

    $scope.groups = [];
    $scope.visitors = [];
    $scope.allVisitors = [];

    $scope.searchResult = '';

    $scope.toggleGroup = function (group) {
      group.isShown = !group.isShown;
    };

    $scope.smsServices = VisitorStatusService.getSMSServices();

    $scope.defaultSMSService = {
      type: APP_CONFIG.SMS_SERVICE.DEFAULT
    };

    $scope.bulkMessage = function (group) {
      var contacts = [];

      angular.forEach(group.visitors, function(visitor) {
          if(visitor.contact_1) {
            contacts.push(visitor.contact_1);
          } else {
            contacts.push(visitor.contact_2);
          }
      });

      if(localStorageService.get(APP_CONFIG.SMS_SERVICE.SELECTED_SMS) === APP_CONFIG.SMS_SERVICE.ANY) {
        var popup = $ionicPopup.show({
          templateUrl: 'templates/smsservice-popup.html',
          title: 'Group Messaging',
          subTitle: 'Please select your preferred messaging app.',
          scope: $scope,
          buttons: [
            {
              text: 'Cancel',
              type: 'button-light',
              onTap: function (event) {
                return null;
              }
            },
            {
              text: 'OK',
              type: 'button-dark',
              onTap: function (event) {
                return $scope.defaultSMSService.type;
              }
            }
          ]
        });

        popup.then(function (smsService) {
          if (smsService) {
            if(smsService === APP_CONFIG.SMS_SERVICE.DEFAULT) {
              SMSService.sendSMS(contacts);
            } else {
              var message = '%0D'; //Empty String
              var url = 'whatsapp://send?text=' + encodeURI(message);

              $window.open(url, '_system', 'location=no');
            }

          } else {
            popup.close();
          }
        });
      } else {
          if(localStorageService.get(APP_CONFIG.SMS_SERVICE.SELECTED_SMS) === APP_CONFIG.SMS_SERVICE.DEFAULT) {
            SMSService.sendSMS(contacts);
          } else {
            var message = '%0D'; //Empty String
            var url = 'whatsapp://send?text=' + encodeURI(message);

            $window.open(url, '_system', 'location=no');
          }
      }
    };

    $scope.callHost = function (group) {
      console.log(group);

      $scope.contacts = [];

      $scope.defaultGuest = {
        number: group.visitors[0].host_contact_1,
        name: group.visitors[0].host_name
      };

      if(group.visitors[0].host_contact_1) {
        $scope.contacts.push({
          name:  group.visitors[0].host_name,
          number: group.visitors[0].host_contact_1
        });
      }

      if(group.visitors[0].host_contact_2) {
        $scope.contacts.push({
          name:  group.visitors[0].host_name,
          number: group.visitors[0].host_contact_2
        });
      }

      var popup = $ionicPopup.show({
        templateUrl: 'templates/contact-popup.html',
        title: 'Calling Host',
        subTitle: $scope.defaultGuest.name,
        scope: $scope,
        buttons: [
          {
            text: 'Cancel',
            type: 'button-light',
            onTap: function (event) {
              return null;
            }
          },
          {
            text: 'Call',
            type: 'button-dark',
            onTap: function (event) {
              return $scope.defaultGuest.number;
            }
          }
        ]
      });

      popup.then(function (hostNumber) {
        if (hostNumber) {
          CallService.callNow(hostNumber);
        } else {
          popup.close();
        }
      });

    };

    $scope.callVisitor = function (visitor) {
      console.log(visitor);

      $scope.contacts = [];

      $scope.defaultGuest = {
        number: visitor.contact_1,
        name: visitor.name
      };

      if(visitor.contact_1) {
        $scope.contacts.push({
          name:  visitor.name,
          number: visitor.contact_1
        });
      }

      if(visitor.contact_2) {
        $scope.contacts.push({
          name:  visitor.name,
          number: visitor.contact_2
        });
      }

      var popup = $ionicPopup.show({
        templateUrl: 'templates/contact-popup.html',
        title: 'Calling Visitor',
        subTitle: $scope.defaultGuest.name,
        scope: $scope,
        buttons: [
          {
            text: 'Cancel',
            type: 'button-light',
            onTap: function (event) {
              return null;
            }
          },
          {
            text: 'Call',
            type: 'button-dark',
            onTap: function (event) {
              return $scope.defaultGuest.number;
            }
          }
        ]
      });

      popup.then(function (visitorNumber) {
        if (visitorNumber) {
          CallService.callNow(visitorNumber);
        } else {
          popup.close();
        }
      });
    };

    $scope.updateAllVisitorsStatuses = function () {
      $ionicModal.fromTemplateUrl('templates/visitor-status-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
        modal.show();
      });
    };

    $scope.toggleMode = function () {
      // Scrolling back to top
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();

      if ($scope.mode === APP_CONFIG.MODE.DEFAULT) {
        var confirmPopup = $ionicPopup.show({
          title: 'Activating ' + APP_CONFIG.MODE.EMERGENCY + ' mode',
          buttons: [
            {text: 'Cancel'},
            {
              text: 'OK',
              type: 'button-dark',
              onTap: function () {
                return APP_CONFIG.MODE.EMERGENCY;
              }
            }
          ],
          template: 'Are you sure you want to activate ' + APP_CONFIG.MODE.EMERGENCY + ' mode?'
        });

        confirmPopup.then(function (res) {
          if (res) {
            // Update global timer sec
            updateTimer();

            console.log(APP_CONFIG.MODE.EMERGENCY);

            $scope.mode = APP_CONFIG.MODE.EMERGENCY
            ionicToast.show(APP_CONFIG.MODE.EMERGENCY + ' mode', 'middle', false, 1800);

            // Setting mode
            AppModeService.setMode($scope.mode);

            $scope.contactStatuses = VisitorStatusService.getEmergencyContactStatuses();

            $scope.filters = VisitorStatusService.getEmergencyContactStatusFilters();

            // Updating tabs and navbar color
            AppColorThemeService.setAppColorTheme(APP_CONFIG.THEME.BAR_EMERGENCY, APP_CONFIG.THEME.TABS_EMERGENCY);
          }
        });
      } else {
        // Clear sec and timer
        clearTimer();

        console.log(APP_CONFIG.MODE.DEFAULT);
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
        ionicToast.show(APP_CONFIG.MODE.DEFAULT + ' mode', 'middle', false, 1800);

        // Setting mode
        AppModeService.setMode($scope.mode);

        $scope.contactStatuses = VisitorStatusService.getNormalContactStatuses();

        $scope.filters = VisitorStatusService.getNormalContactStatusFilters();

        // Updating tabs and navbar color
        AppColorThemeService.setAppColorTheme(APP_CONFIG.THEME.BAR_DEFAULT, APP_CONFIG.THEME.TABS_DEFAULT);
      }

    };

    // Global timer in emergency mode
    $scope.sec = 0;
    $scope.timer = null;
    var updateTimer = function () {
      $scope.sec++;
      $scope.timer = $timeout(updateTimer, 1000);

      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});

      //console.log(TimerService.getTimer());
    };

    function clearTimer() {
      $timeout.cancel(TimerService.getTimer().timer);
      $scope.sec = 0;
      $scope.timer = null;
      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});
    }

    // For updating visitor status options
    $scope.defaultContactStatus = {
      status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED
    };

    function filterVisitorsByStatus(status) {
      if (status) {
        angular.forEach($scope.filters, function (filter) {
          if (filter.status.toLowerCase() === status.toLowerCase()) {
            filter.isChecked = true;
          } else {
            filter.isChecked = false;
          }
        });
      }
    }

    function getAllVisitors() {
      MaskFactory.loadingMask(true, 'Loading');

      VisitorsFactory.getAllVisitors().then(function (visitors) {
        var sortedVisitors = sortVisitorsByName(visitors);

        $scope.visitors = sortedVisitors;
        $scope.allVisitors = sortedVisitors;

        if (visitors && visitors.length) {
          groupVisitorsByHostName(sortedVisitors);
        }

        MaskFactory.loadingMask(false);
      }, function (err) {
        console.log(err);
        MaskFactory.loadingMask(false);
        MaskFactory.showMask(MaskFactory.error, 'Loading visitors failed');
      });
    }

    function groupVisitorsByHostName(visitors) {

      // Clear group list before adding again
      $scope.groups = [];

      // Lodash utility functions to group visitors
      var visitorGroups = _.chain(visitors)
        .groupBy('host_name')
        .toPairs()
        .map(function (currentItem) {
          return _.assign(_.zipObject(['name', 'visitors'], currentItem), {'isShown': true});
        })
        .value();

      $scope.groups = sortVisitorsByName(visitorGroups);

      console.log('Visitors after group by host name: ');
      console.log($scope.groups);
    }

    // Filtering visitor list depending on checkbox filter options
    watchFilterChanges();

    function watchFilterChanges() {
      $scope.$watch('filters', function (filters) {
        var filterVisitors = [];

        angular.forEach(filters, function (filter) {
          if (filter.isChecked) {
            angular.forEach($scope.allVisitors, function (visitor) {
              if (filter.status.toLowerCase() === visitor.contactStatus.toLowerCase()) {
                filterVisitors.push(visitor);
              }
            });
          }
        });

        $scope.groups = groupFilteredVisitors(sortVisitorsByName(filterVisitors));
      }, true);
    }

    function sortVisitorsByName(visitors) {

      var sortedVisitors = visitors.sort(function (visitor_1, visitor_2) {

        var name_1 = visitor_1.name.toLowerCase();

        var name_2 = visitor_2.name.toLowerCase();

        return (name_1 < name_2) ? -1 : (name_1 > name_2) ? 1 : 0;

      });

      return sortedVisitors;
    }

    $scope.goToItem = function (meetingID) {

    };

    $scope.voipServices = VisitorStatusService.getVoIPServices();

    $scope.defaultVoIPService = {
      type: APP_CONFIG.VOIP_SERVICE.JABBER
    };

    $scope.voip = function (visitor) {

      var url;

      if(localStorageService.get(APP_CONFIG.VOIP_SERVICE.SELECTED_SERVICE) === APP_CONFIG.VOIP_SERVICE.ANY) {

        var popup = $ionicPopup.show({
          templateUrl: 'templates/voip-popup.html',
          title: 'VoIP Call',
          subTitle: 'Please select your preferred VoIP app.',
          scope: $scope,
          buttons: [
            {
              text: 'Cancel',
              type: 'button-light',
              onTap: function (event) {
                return null;
              }
            },
            {
              text: 'OK',
              type: 'button-dark',
              onTap: function (event) {
                return $scope.defaultVoIPService.type;
              }
            }
          ]
        });

        popup.then(function (service) {
          if (service) {
             if((service === APP_CONFIG.VOIP_SERVICE.JABBER)) {
              url = APP_CONFIG.VOIP_SERVICE.JABBER_URL_SCHEME + encodeURI(visitor.contact_1);
            } else {
              url = APP_CONFIG.VOIP_SERVICE.SKYPE_URL_SCHEME + encodeURI(visitor.name + '?call') ;
            }

            $window.open(url, '_system', 'location=no');
          } else {
            popup.close();
          }

        });
      } else {
          if(localStorageService.get(APP_CONFIG.VOIP_SERVICE.SELECTED_SERVICE) === APP_CONFIG.VOIP_SERVICE.JABBER) {
            url = APP_CONFIG.VOIP_SERVICE.JABBER_URL_SCHEME + encodeURI(visitor.contact_1);
          } else {
            url = APP_CONFIG.VOIP_SERVICE.SKYPE_URL_SCHEME + encodeURI(visitor.name + '?call');
          }

          $window.open(url, '_system', 'location=no');
      }

    };

    $scope.checkout = function (visitor) {
      var confirmPopup = $ionicPopup.show({
        title: 'Checking out Visitor',
        buttons: [
          {text: 'Cancel'},
          {
            text: 'OK',
            type: 'button-dark',
            onTap: function () {
              return true;
            }
          }
        ],
        template: 'Are you sure you want to check out this visitor?'
      });

      confirmPopup.then(function (res) {
        if (res) {
          console.log('Visitor is checked out.');
        } else {
          console.log('User cancels.');
        }
      });
    };


    $scope.updateVisitorStatus = function () {

      console.log('Updating checked visitors status to ' + $scope.defaultContactStatus.status);

      angular.forEach($scope.visitors, function (visitor) {
        // $scope.defaultContactStatus.value is value from selected radio item
        if (visitor.isChecked) {
          visitor.contactStatus = $scope.defaultContactStatus.status;
        }
        // Update the visitor list
        watchFilterChanges();
      });

      $scope.modal.remove()
        .then(function () {
          $scope.modal = null;
      });

      // Unchecking all previous checked visitors after updating status
      angular.forEach($scope.visitors, function (visitor) {
        if (visitor.isChecked) {
          visitor.isChecked = false;
        }
      });

      // Firing this event to directive to close left checkbox list
      $rootScope.$broadcast('visitorStatusHasUpdated');
    };

    $scope.showFilterBar = function () {
      $ionicFilterBar.show({
        items: $scope.visitors,
        update: function (filteredItems) {
          $scope.groups = groupFilteredVisitors(sortVisitorsByName(filteredItems));

          // Show this text when no room is found
          if (!filteredItems.length) {
            $scope.searchResult = 'No Results';
          } else {
            $scope.searchResult = '';
          }
        },
        cancel: function () {
          if ($scope.visitors.length) {
            groupVisitorsByHostName(sortVisitorsByName($scope.visitors));
          }

          $scope.searchResult = '';
        }
      });
    };

    function groupFilteredVisitors(filteredItems) {

      if (filteredItems.length !== 0) {
        groupVisitorsByHostName(sortVisitorsByName(filteredItems));

        for (var i = $scope.groups.length - 1; i >= 0; i--) {
          if ($scope.groups[i].visitors.length === 0) {
            $scope.groups.splice(i, 1);
          }
        }

        return $scope.groups;
      } else {
        return $scope.groups = [];
      }

    }

    $ionicPopover.fromTemplateUrl('templates/popover.html', {
      scope: $scope,
    }).then(function (popover) {
      $scope.popover = popover;
    });


    $scope.getVisitorStatus = function (visitor) {
      if ($scope.mode === APP_CONFIG.MODE.DEFAULT) {
        return VisitorStatusService.getNormalVisitorStatusColour(visitor);
      } else {
        return VisitorStatusService.getEmergencyVisitorStatusColour(visitor);
      }

    };

    // Being called every time user switches tab
    $rootScope.$on('$stateChangeStart', function () {
      var uncontactedCount = 0;
      var noReplyCount = 0;
      var inBuildingCount = 0;
      var leftBuildingCount = 0;
      var vacatingCount = 0;
      var evacuatedCount = 0;

      angular.forEach($scope.visitors, function(visitor) {
          if(visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.UNCONTACTED) {
            uncontactedCount++;
            ContactStatusService.setUncontactedCount(uncontactedCount);
          }

          if(visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.NO_REPLY) {
            noReplyCount++;
            ContactStatusService.setNoReplyCount(noReplyCount);
          }

          if(visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.IN_BUILDING) {
            inBuildingCount++;
            ContactStatusService.setInBuildingCount(inBuildingCount);
          }

          if(visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING) {
            leftBuildingCount++;
            ContactStatusService.setLeftBuildingCount(leftBuildingCount);
          }

          if(visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.VACATING) {
            vacatingCount++;
            ContactStatusService.setVacatingCount(vacatingCount);
          }

          if(visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.EVACUATED) {
            evacuatedCount++;
            ContactStatusService.setEvacuatedCount(evacuatedCount);
          }
      });
    });

  })

  .controller('MeetingDetailCtrl', function ($scope, $state, $stateParams, Visitors, $ionicActionSheet,
                                             $ionicPopup, $ionicModal, VisitorStatusService,
                                             $window, CallService, SMSService, APP_CONFIG, AppModeService) {

    $scope.meetingDetail = Visitors.getMeetingDetail($stateParams.meetingID);

    console.log($scope.meetingDetail);

    if (AppModeService.getMode() === APP_CONFIG.MODE.DEFAULT) {
      $scope.contactStatuses = VisitorStatusService.getNormalContactStatuses();
    } else {
      $scope.contactStatuses = VisitorStatusService.getEmergencyContactStatuses();
    }

    $scope.defaultContactStatus = {
      status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED
    };

    $scope.getVisitorStatus = function (visitor) {

      if (AppModeService.getMode() === APP_CONFIG.MODE.DEFAULT) {
        return VisitorStatusService.getNormalVisitorStatusColour(visitor);
      } else {
        return VisitorStatusService.getEmergencyVisitorStatusColour(visitor);
      }

    };

    $scope.call = function (hostNumber) {
      // Show the action sheet
      $ionicActionSheet.show({
        buttons: [
          {text: 'Call Host'},
          {text: 'Message Host'}
        ],
        destructiveText: 'Emergency Call',
        titleText: '',
        cancelText: 'Cancel',
        cancel: function () {

        },
        buttonClicked: function (index) {
          switch (index) {
            case 0:
              CallService.callNow(hostNumber);
              break;
            case 1:
              SMSService.sendSMS(hostNumber);
              break;
            default:
              break;
          }
          ;
          return true;
        }
      });
    };

    $scope.updateVisitorStatus = function () {
      $scope.modal.remove()
        .then(function () {
          $scope.modal = null;
        });
    };

    $scope.voipServices = VisitorStatusService.getVoIPServices();

    $scope.defaultVoIPService = {
      type: APP_CONFIG.VOIP_SERVICE.SKYPE
    };

    $scope.updateStatus = function (visitor) {
      $ionicActionSheet.show({
        buttons: [
          {text: 'Call ' + visitor.name},
          {text: 'VoIP ' + visitor.name},
          {text: 'Update Status'},
          {text: 'Checkout ' + visitor.name}
        ],
        titleText: '',
        cancelText: 'Cancel',
        cancel: function () {

        },
        buttonClicked: function (index) {

          switch (index) {
            case 0:
              CallService.callNow(visitor.contact_1);
              break;
            case 1:
              var url;

              var popup = $ionicPopup.show({
                templateUrl: 'templates/voip-popup.html',
                title: 'VoIP Services',
                subTitle: 'Please select your favorite VoIP service.',
                scope: $scope,
                buttons: [
                  {
                    text: 'Cancel',
                    type: 'button-light',
                    onTap: function (event) {
                      return null;
                    }
                  },
                  {
                    text: 'OK',
                    type: 'button-dark',
                    onTap: function (event) {
                      return $scope.defaultVoIPService.type;
                    }
                  }
                ]
              });

              popup.then(function (service) {
                if (service) {
                  if (service === APP_CONFIG.VOIP_SERVICE.SKYPE) {
                    url = APP_CONFIG.VOIP_SERVICE.SKYPE_URL_SCHEME + encodeURI(visitor.name + '?call');
                  } else {
                    url = APP_CONFIG.VOIP_SERVICE.JABBER_URL_SCHEME + encodeURI(visitor.contact_1);
                  }

                  $window.open(url, '_system', 'location=no');
                } else {
                  popup.close();
                }

              });
              break;
            case 2:
              $ionicModal.fromTemplateUrl('templates/visitor-status-modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
              }).then(function (modal) {
                $scope.modal = modal;
                modal.show();
              });

              $scope.closeStatusModal = function () {
                $scope.modal.remove()
                  .then(function () {
                    $scope.modal = null;
                  });
              };
              break;
            case 3:
              var confirmPopup = $ionicPopup.show({
                title: 'Checking out Visitor',
                buttons: [
                  {text: 'Cancel'},
                  {
                    text: 'OK',
                    type: 'button-dark',
                    onTap: function () {
                      return true;
                    }
                  }
                ],
                template: 'Are you sure you want to check out this visitor?'
              });

              confirmPopup.then(function (res) {
                if (res) {
                  console.log('Visitor is checked out.');
                } else {
                  console.log('User cancels.');
                }
              });
              break;
            default:
              console.log('No action');
          }

          return true;
        }
      });
    };

  })

  .controller('SettingsCtrl', function ($scope, $state, $ionicHistory, localStorageService,
                                        $timeout, TimerService, AppModeService,
                                        ionicToast, $ionicPopup, APP_CONFIG,
                                        AppColorThemeService) {

    $scope.$on('$ionicView.beforeEnter', function (event, data) {

      if (!AppModeService.getMode()) {
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
      } else {
        $scope.mode = AppModeService.getMode();
      }

      console.log($scope.mode);
    });

    $scope.toggleMode = function () {

      if ($scope.mode === APP_CONFIG.MODE.DEFAULT) {

        var confirmPopup = $ionicPopup.show({
          title: 'Activating ' + APP_CONFIG.MODE.EMERGENCY + ' mode',
          buttons: [
            {text: 'Cancel'},
            {
              text: 'OK',
              type: 'button-dark',
              onTap: function () {
                return APP_CONFIG.MODE.EMERGENCY;
              }
            }
          ],
          template: 'Are you sure you want to activate ' + APP_CONFIG.MODE.EMERGENCY + ' mode?'
        });

        confirmPopup.then(function (res) {
          if (res) {
            // Update global timer sec
            updateTimer();

            console.log(APP_CONFIG.MODE.EMERGENCY);

            $scope.mode = APP_CONFIG.MODE.EMERGENCY
            ionicToast.show(APP_CONFIG.MODE.EMERGENCY + ' mode', 'middle', false, 1800);

            // Setting mode
            AppModeService.setMode($scope.mode);

            // Updating tabs and navbar color
            AppColorThemeService.setAppColorTheme(APP_CONFIG.THEME.BAR_EMERGENCY, APP_CONFIG.THEME.TABS_EMERGENCY);

          } else {
            // Clear sec and timer
            clearTimer(false);

            console.log('User cancels. ' + APP_CONFIG.MODE.DEFAULT);

            // Setting mode
            AppModeService.setMode($scope.mode);

            // Updating tabs and navbar color
            AppColorThemeService.setAppColorTheme(APP_CONFIG.THEME.BAR_DEFAULT, APP_CONFIG.THEME.TABS_DEFAULT);
          }
        });

      } else {
        // Clear sec and timer
        clearTimer(false);

        console.log(APP_CONFIG.MODE.DEFAULT);
        $scope.mode = APP_CONFIG.MODE.DEFAULT;
        ionicToast.show(APP_CONFIG.MODE.DEFAULT + ' mode', 'middle', false, 1800);

        // Setting mode
        AppModeService.setMode($scope.mode);

        // Updating tabs and navbar color
        AppColorThemeService.setAppColorTheme(APP_CONFIG.THEME.BAR_DEFAULT, APP_CONFIG.THEME.TABS_DEFAULT);
      }

    };

    // Global timer in emergency mode
    $scope.sec = 0;
    $scope.timer = null;
    var updateTimer = function () {
      $scope.sec++;

      $scope.timer = $timeout(updateTimer, 1000);

      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});

      //console.log(TimerService.getTimer());
    };


    $scope.logOut = function () {
      // Clear all navigation stack history
      $ionicHistory.clearHistory();

      // Clear all the cache views
      $ionicHistory.clearCache();

      // Clear all local storage
      localStorageService.clearAll();

      // Stop global timer
      clearTimer(true);

      // Reset tabs and navbar color to default
      AppColorThemeService.setAppColorTheme(APP_CONFIG.THEME.BAR_DEFAULT, APP_CONFIG.THEME.TABS_DEFAULT);

      // Reset mode to default
      AppModeService.setMode(APP_CONFIG.MODE.DEFAULT);

      // Go back to login view
      $state.go('login');
    };

    function clearTimer(hasLoggedOut) {
      $timeout.cancel(TimerService.getTimer().timer);
      $scope.sec = 0;
      $scope.timer = null;
      TimerService.setTimer({timer: $scope.timer, sec: $scope.sec});

      if (hasLoggedOut) {
        TimerService.setStoppage(0);
      }
    }

  })

  .controller('AppSettingsCtrl', function ($scope, $state, APP_CONFIG, VisitorStatusService,
                                           localStorageService, MaskFactory) {


    $scope.voipServices = VisitorStatusService.getVoIPServices();

    angular.forEach($scope.voipServices, function(service) {
      if(service.type === localStorageService.get(APP_CONFIG.VOIP_SERVICE.SELECTED_SERVICE)) {
        $scope.selectedVoIPService = service;
      }
    });

    $scope.smsServices = VisitorStatusService.getSMSServices();

    angular.forEach($scope.smsServices, function(service) {
      if(service.type === localStorageService.get(APP_CONFIG.SMS_SERVICE.SELECTED_SMS)) {
        $scope.selectedSMS = service;
      }
    });

    $scope.onSelectVoIPChange = function(selectedItem) {
      $scope.selectedVoIPService = selectedItem;
    };

    $scope.onSelectSMSChange = function(selectedItem) {
      $scope.selectedSMS = selectedItem;
    };

    $scope.saveSettings = function () {
      localStorageService.set(APP_CONFIG.VOIP_SERVICE.SELECTED_SERVICE, $scope.selectedVoIPService.type);
      localStorageService.set(APP_CONFIG.SMS_SERVICE.SELECTED_SMS, $scope.selectedSMS.type);

      MaskFactory.showMask(MaskFactory.success, 'Settings saved.');
    };

  })

  .controller('AccountSettingsCtrl', function ($scope, $state) {


  });
