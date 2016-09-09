// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in factories.js
// 'starter.controllers' is found in controllers.js
angular.module('SMARTLobby', ['ionic', 'ngCordova','ionic-toast', 'jett.ionic.filter.bar', 'LocalStorageModule',
  'SMARTLobby.controllers', 'SMARTLobby.factories', 'SMARTLobby.services',
  'SMARTLobby.directives', 'SMARTLobby.constants'])

.run(function($ionicPlatform, $rootScope, $state, $cordovaNetwork, $ionicPopup, APP_CONFIG,
              localStorageService, VisitorsStorageFactory) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    // Allow android hardware back button only when current state is not login.
    // Otherwise exit app upon back button click.
    $ionicPlatform.registerBackButtonAction(function(event){
      if($state.current.name === 'login') {
        ionic.Platform.exitApp();
      } else {
        navigator.app.backHistory();
      }
    }, 100);


    // Init App
    initApp();

    function initApp() {
      // Initialize pouchdb
      VisitorsStorageFactory.initDB();

      if(!localStorageService.get(APP_CONFIG.VOIP_SERVICE.SELECTED_SERVICE) && !localStorageService.get(APP_CONFIG.SMS_SERVICE.SELECTED_SERVICE))  {
        localStorageService.set(APP_CONFIG.VOIP_SERVICE.SELECTED_SERVICE, APP_CONFIG.VOIP_SERVICE.ANY);
        localStorageService.set(APP_CONFIG.SMS_SERVICE.SELECTED_SMS, APP_CONFIG.SMS_SERVICE.ANY);
        console.log('localStorageService init');
      }

      console.log('initApp ready');
    }

    document.addEventListener('deviceready', function () {

      // listen for Offline event
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        $ionicPopup.show({
          title: 'Connection Error',
          template: 'Unable to connect to server. Please check your internet connection or VPN and try again.',
          buttons: [
            {
              text: 'OK',
              type: 'button-dark'
            }
          ]
        });
      });

    }, false);

  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider,
                 $ionicFilterBarConfigProvider, localStorageServiceProvider) {


  // Global local storage settings
  localStorageServiceProvider
    .setPrefix('SMARTLobby')
    .setStorageType('localStorage')
    .setNotify(true, true);

  // Disable iOS swipe back
  $ionicConfigProvider.views.swipeBackEnabled(false);

  // Tabs position bottom for both iOS and android
  $ionicConfigProvider.tabs.position('bottom');

  // Enable native scrolling in android as well as removing scrollbar indicator
  $ionicConfigProvider.scrolling.jsScrolling(true);

  // Overlay visitor list
  $ionicFilterBarConfigProvider.backdrop(true);

  // Search bar transition horizontally from right to left
  $ionicFilterBarConfigProvider.transition('horizontal');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    .state('login', {
      url: '/login',
      cache: false,
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:
  .state('tab.dash', {
    url: '/dash',
    cache: false,
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.visitors', {
      url: '/visitors',
      cache: false,
      views: {
        'tab-visitors': {
          templateUrl: 'templates/tab-visitors.html',
          controller: 'VisitorsCtrl'
        }
      }
    })
    .state('tab.meeting-detail', {
      url: '/visitors/:meetingID',
      cache: false,
      views: {
        'tab-visitors': {
          templateUrl: 'templates/meeting-detail.html',
          controller: 'MeetingDetailCtrl'
        }
      }
    })

  .state('tab.settings', {
    url: '/settings',
    cache: false,
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('tab.app-settings',{
    url: '/app-settings',
    cache:false,
    views:{
      'tab-settings': {
        templateUrl: 'templates/app-settings.html',
        controller: 'AppSettingsCtrl'
      }
    }
  })

  .state('tab.account-settings', {
    url: '/account-settings',
      cache: false,
      views: {
        'tab-settings': {
          templateUrl: 'templates/account-settings.html',
          controller: 'AccountSettingsCtrl'
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
