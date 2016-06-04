strCtrlModule.controller('GeolocationCtrl', function($scope, $ionicPlatform, $ionicLoading, $ionicPopup, $cordovaGeolocation)
{
  $scope.geo = { latitude: 0.0, longitude: 0.0 };

  /*
  var watchOptions = {timeout : 3000, enableHighAccuracy: false};
  var watch = $cordovaGeolocation.watchPosition(watchOptions);

  watch.then(
  null,

  function(err) {
   console.log(err)
  },

  function(position) {
   var lat  = position.coords.latitude
   var long = position.coords.longitude
   console.log(lat + '' + long)

   $scope.geo = position.coords;
  }
  );

  watch.clearWatch();
  */

  $scope.atualizaPosicao = function()
  {
    $scope.obterPosicao();
  };

  $scope.obterPosicao = function()
  {
    $ionicLoading.show({
       template: 'Buscando posição...'
    });

    var posOptions = {timeout: 10000, enableHighAccuracy: false};

    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then($scope.onObterPosicao, $scope.onErroPosicao);
  };

  $scope.onObterPosicao = function(position)
  {
    //var lat  = position.coords.latitude;
    //var long = position.coords.longitude;
    //console.log(lat + '   ' + long);

    $scope.geo = position.coords;

    if (!$scope.map) {
      $scope.inicializarMapa();
    } else {
      $scope.atualizaMapa();
    }

    $ionicLoading.hide();
  };

  $scope.onErroPosicao = function(erro)
  {
    console.log(erro);
    $scope.showAlert('Ocorreu um erro ao buscar a posição do GSP \n Tente novamente !');
    $ionicLoading.hide();
  };

  $scope.inicializarMapa = function()
  {
    var posicao = new google.maps.LatLng($scope.geo.latitude, $scope.geo.longitude);

    var mapOptions = {
        center: posicao,
        zoom: 17,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        mapTypeControl: true,
        streetViewControl: false
    };

    $scope.map = new google.maps.Map(document.getElementById("google-map"), mapOptions);

    $scope.marker = new google.maps.Marker({
      position: posicao,
      map: $scope.map,
      title: 'Minha localização'
    });
  };

  $scope.atualizaMapa = function()
  {
    var posicao = new google.maps.LatLng($scope.geo.latitude, $scope.geo.longitude);

    $scope.map.setCenter(posicao);
    $scope.marker.setPosition(posicao);
  };

  $scope.showAlert = function(msg)
  {
    var alertConfig = {
       title: 'Atenção!',
       template: msg
    };

    $ionicPopup.alert(alertConfig);
  };

  $scope.init = function()
  {
    $scope.obterPosicao();
  };

  $ionicPlatform.ready($scope.init);
});
