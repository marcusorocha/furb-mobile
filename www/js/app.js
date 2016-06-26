// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova']);

var api = 'http://indoor-furbmobile2016.rhcloud.com/api';

app.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
});

app.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })

    .state('app.mapa', {
        url: '/mapa',
        views: {
            'menuContent': {
                templateUrl: 'templates/mapa.html',
                controller: 'MapaCtrl'
            }
        }
    })

    .state('app.geolocation', {
        url: '/geolocation',
        views: {
            'menuContent': {
                templateUrl: 'templates/geolocation.html',
                controller: 'GeolocationCtrl'
            }
        }
    })

    .state('app.indoor', {
        url: '/indoor',
        views: {
            'menuContent': {
                templateUrl: 'templates/indoor.html',
                controller: 'IndoorCtrl'
            }
        }
    })  

    /*
    .state('app.indoor', {
        url: '/indoor/:blocoId',
        views: {
            'menuContent': {
                templateUrl: 'templates/indoor.html',
                controller: 'IndoorCtrl'
            }
        }
    })*/;

    // if none of the above states are matched, use this as the fallback    
    $urlRouterProvider.otherwise('/app/indoor');
});
