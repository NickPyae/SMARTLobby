// Global app configuration
var APP_CONFIG =
{
  CONTACT_STATUS: {
    UNCONTACTED: 'Uncontacted',
    NO_REPLY: 'No Reply',
    VACATING: 'Vacating',
    EVACUATED: ' Evacuated',
    IN_BUILDING: 'In Building',
    LEFT_BUILDING: 'Left Building'
  },
  MODE: {
    DEFAULT: 'Normal',
    EMERGENCY: 'Emergency'
  },
  THEME: {
    BAR_DEFAULT: 'bar-dark',
    TABS_DEFAULT: 'tabs-dark',
    BAR_EMERGENCY: 'bar-assertive',
    TABS_EMERGENCY: 'tabs-assertive'
  },
  VOIP_SERVICE: {
    SKYPE: 'Skype',
    JABBER: 'Cisco Jabber',
    SKYPE_URL_SCHEME: 'skype:live:skype.',
    JABBER_URL_SCHEME: 'ciscotel://',
    SELECTED_SERVICE: 'SELECTED_SERVICE',
    ANY: 'Any'
  },
  SMS_SERVICE: {
    DEFAULT: 'Default Messaging',
    WHATSAPP: 'WhatsApp',
    SELECTED_SMS: 'SELECTED_SMS',
    ANY: 'Any'
  },
  BASE_URI: 'http://192.168.1.179:9999/',
  GET_VISITORS: 'API/WebAPI.aspx?m=mhello',
  GET_STATS: 'API/WebApi.aspx?m=mhello_dash'
};

angular.module('SMARTLobby.constants', []).
constant('APP_CONFIG', APP_CONFIG);
