angular.module('SMARTLobby.services', [])

  .service('VisitorStatusService', function (APP_CONFIG) {

    this.service_1 = APP_CONFIG.VOIP_SERVICE.ANY;
    this.service_2 = APP_CONFIG.VOIP_SERVICE.JABBER;
    this.service_3 = APP_CONFIG.VOIP_SERVICE.SKYPE;

    this.sms_service_1 = APP_CONFIG.SMS_SERVICE.ANY;
    this.sms_service_2 = APP_CONFIG.SMS_SERVICE.DEFAULT;
    this.sms_service_3 = APP_CONFIG.SMS_SERVICE.WHATSAPP;

    this.emergencyContactStatusFilters = [
      {
        status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED,
        isChecked: true
      },
      {
        status: APP_CONFIG.CONTACT_STATUS.NO_REPLY,
        isChecked: false
      },
      {
        status: APP_CONFIG.CONTACT_STATUS.VACATING,
        isChecked: false
      },
      {
        status: APP_CONFIG.CONTACT_STATUS.EVACUATED,
        isChecked: false
      }
    ];


    this.emergencyContactStatuses = [
      {status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED},
      {status: APP_CONFIG.CONTACT_STATUS.NO_REPLY},
      {status: APP_CONFIG.CONTACT_STATUS.VACATING},
      {status: APP_CONFIG.CONTACT_STATUS.EVACUATED}
    ];

    this.normalContactStatusFilters = [
      {
        status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED,
        isChecked: true
      },
      {
        status: APP_CONFIG.CONTACT_STATUS.NO_REPLY,
        isChecked: false
      },
      {
        status: APP_CONFIG.CONTACT_STATUS.IN_BUILDING,
        isChecked: false
      },
      {
        status: APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING,
        isChecked: false
      }
    ];

    this.normalContactStatuses = [
      {status: APP_CONFIG.CONTACT_STATUS.UNCONTACTED},
      {status: APP_CONFIG.CONTACT_STATUS.NO_REPLY},
      {status: APP_CONFIG.CONTACT_STATUS.IN_BUILDING},
      {status: APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING}
    ];

    this.voipServices = [
      {type: this.service_1},
      {type: this.service_2},
      {type: this.service_3}
    ];

    this.smsServices = [
      {type: this.sms_service_1},
      {type: this.sms_service_2},
      {type: this.sms_service_3}
    ];

    this.getVoIPServices = function () {
      return this.voipServices;
    };

    this.getSMSServices = function() {
      return this.smsServices;
    };

    this.getEmergencyContactStatusFilters = function () {
      return this.emergencyContactStatusFilters;
    };

    this.getEmergencyContactStatuses = function () {
      return this.emergencyContactStatuses;
    };

    this.getNormalContactStatusFilters = function () {
      return this.normalContactStatusFilters;
    };

    this.getNormalContactStatuses = function () {
      return this.normalContactStatuses;
    };

    this.getEmergencyVisitorStatusColour = function (visitor) {
      if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.UNCONTACTED) {
        //Gray
        return '#454242'
      } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.NO_REPLY) {
        //Red
        return '#FF0000';
      } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.VACATING) {
        //Amber
        return '#FFC200';
      } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.EVACUATED) {
        //Green
        return '#008000';
      } else {
        //Gray
        return '#736F6E'
      }
    };

    this.getNormalVisitorStatusColour = function (visitor) {
      if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.UNCONTACTED) {
        //Gray
        return '#454242'
      } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.NO_REPLY) {
        //Red
        return '#FF0000';
      } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.IN_BUILDING) {
        //Amber
        return '#FFC200';
      } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING) {
        //Green
        return '#008000';
      } else {
        //Gray
        return '#736F6E'
      }
    };
  })
  .service('CallService', function ($window) {
    this.callNow = function (number) {
      $window.open('tel:' + number, '_system', 'location=no');
    };
  })

  .service('SMSService', function () {
    this.sendSMS = function (numbers) {

      var message = '';

      //CONFIGURATION
      var options = {
        replaceLineBreaks: false,
        android: {
          intent: 'INTENT'
        }
      };

      sms.send(numbers, message, options);
    };
  })
  .service('ContactStatusService', function () {
    this.contactStatus = null;
    this.visitors = [];

    this.getContactStatus = function () {
      return this.contactStatus;
    };

    this.setContactStatus = function (contactStatus) {
      this.contactStatus = contactStatus;
    };

    this.getVisitors = function() {
      return this.visitors;
    };

    this.setVisitors = function(visitors) {
      this.visitors = visitors;
    };

  })
  .service('TimerService', function () {
    this.timer = {};
    this.stoppage = null;

    this.getStoppage = function () {
      return this.stoppage;
    };

    this.setStoppage = function (stoppage) {
      this.stoppage = stoppage;
    };

    this.getTimer = function () {
      return this.timer;
    };

    this.setTimer = function (ref) {
      this.timer = ref;
    };
  })
  .service('AppModeService', function () {
    this.mode = null;

    this.getMode = function () {
      return this.mode;
    };

    this.setMode = function (mode) {
      this.mode = mode;
    };
  })
  .service('AppColorThemeService', function () {

    this.setAppColorTheme = function (navColor, tabColor) {
      for (var i = 0; i < document.getElementsByTagName('ion-header-bar').length; i++) {
        var classNames = document.getElementsByTagName('ion-header-bar')[i].className;
        classNames = classNames.replace(/(bar-light|bar-stable|bar-positive|bar-calm|bar-balanced|bar-energized|bar-assertive|bar-royal|bar-dark)/g, navColor);
        document.getElementsByTagName('ion-header-bar')[i].className = classNames;
      }

      for (var i = 0; i < document.getElementsByTagName('ion-tabs').length; i++) {
        var classNames = document.getElementsByTagName('ion-tabs')[i].className;
        classNames = classNames.replace(/(tabs-light|tabs-stable|tabs-positive|tabs-calm|tabs-balanced|tabs-energized|tabs-assertive|tabs-royal|tabs-dark)/g, tabColor);
        document.getElementsByTagName('ion-tabs')[i].className = classNames;
      }
    };
  })





