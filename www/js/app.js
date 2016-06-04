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

        /*
        .state('welcome', {
            url: '/welcome',
            templateUrl: "templates/welcome.html",
            controller: 'WelcomeCtrl'
        })
        */
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl'
        })

        .state('app.home', {
            url: '/home',
            views: {
                'menuContent': {
                    templateUrl: 'templates/home.html',
                    controller: 'HomeCtrl'
                }
            }
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
        /*
        .state('app.indoor', {
            url: '/indoor',
            views: {
                'menuContent': {
                    templateUrl: 'templates/indoor.html',
                    controller: 'IndoorCtrl'
                }
            }
        })
        */
        .state('app.geolocation', {
            url: '/geolocation',
            views: {
                'menuContent': {
                    templateUrl: 'templates/geolocation.html',
                    controller: 'GeolocationCtrl'
                }
            }
        })

        .state('app.playlists', {
            url: '/playlists',
            views: {
                'menuContent': {
                    templateUrl: 'templates/playlists.html',
                    controller: 'PlaylistsCtrl',
                    resolve: {
                        playlists: function(PlaylistService) {
                            return PlaylistService.getPlaylists()
                        }
                    }
                }
            }
        })

        .state('app.single', {
            url: '/playlists/:playlistId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/playlist.html',
                    controller: 'PlaylistCtrl',
                    resolve: {
                        playlist: function($stateParams, PlaylistService) {
                            return PlaylistService.getPlaylist($stateParams.playlistId)
                        }
                    }
                }
            }
        })

        .state('app.campuses', {
            url: '/indoor',
            views: {
                'menuContent': {
                    templateUrl: 'templates/campuses.html',
                    controller: 'CampusesCtrl'
                }
            }
        })

        .state('app.blocos', {
            url: '/indoor/:campusId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/blocos.html',
                    controller: 'BlocosCtrl',
                    resolve: {
                        campusId: function($stateParams) {
                            return $stateParams.campusId;
                        }
                    }
                }
            }
        })

        .state('app.indoor', {
            url: '/indoor/blocos/:blocoId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/indoor.html',
                    controller: 'IndoorCtrl',
                    resolve: {
                        bloco: function($stateParams, EstruturaService) {
                            return EstruturaService.obterBloco($stateParams.blocoId);
                        }
                    }
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    //$urlRouterProvider.otherwise('/welcome');
    $urlRouterProvider.otherwise('/app/playlists');
});
