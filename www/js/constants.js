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
  SITE: {
    SELECTED_SITE: 'SELECTED_SITE',
    ANY: 'Any',
    ALL: 'ALL_SITE'
  },
  BASE_URI: 'http://demo.nexlabs.com/',
  BASE_IP: 'BASE_IP',
  PORT: ':8001',
  IS_HTTPS: 'IS_HTTPS',
  GET_VISITORS: 'nexlabs/api/webapi.aspx?m=mhello',
  GET_STATS: 'nexlabs/api/webapi.aspx?m=mhello_dash',
  CHECK_OUT: 'nexlabs/api/webapi.aspx?m=mhello_checkout',
  UPDATE_CONTACT_STATUS: 'nexlabs/api/webapi.aspx?m=mhello_update',
  PHOTO_DIR: 'nexlabs/Res/'
};

angular.module('SMARTLobby.constants', []).
constant('APP_CONFIG', APP_CONFIG);
