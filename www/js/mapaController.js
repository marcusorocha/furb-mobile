/* Controller da tela de Mapas */
strCtrlModule.controller('MapaCtrl', function($scope, $ionicPlatform, $cordovaGeolocation, $ionicLoading) 
{
    $ionicPlatform.ready(function() 
    {
        /*
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Buscando localização!'
        });
        */

        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };
        
        var origem;
        
        var mostrarPosicaoMapa = function (latitude, longitude) 
        {            
            var posicao = new google.maps.LatLng(latitude, longitude);

            var mapOptions = {
                center: posicao,
                zoom: 17,
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                mapTypeControl: true,
                streetViewControl: false
            };

            var map = new google.maps.Map(document.getElementById("map"), mapOptions);
            
            map.addListener('click', function(e) 
            {
                console.log(e);
                adicionarMarcaPosicao(e.latLng, "click");
            });            
            
            //keep a reference to the original setPosition-function
            //var fxPosition = google.maps.InfoWindow.prototype.setPosition;
            //var fxOpen = google.maps.InfoWindow.prototype.open;
            /*
            var fnSet = google.maps.InfoWindow.prototype.set;
            google.maps.InfoWindow.prototype.set = function () 
            {
                //if(this.get('isCustomInfoWindow'))
                //fnSet.apply(this, arguments);
                
                console.log(arguments);
                
                if (arguments[0] == 'position')
                {
                    var posicao = arguments[1];
                    
                    //var destino = adicionarMarcaPosicao(posicao, "place");
                    
                    //criarRota(origem.position, destino.position);
                    
                    //buscarEndereco(posicao);
                }
            };
            */
            
            $scope.map = map;
        }
        
        var adicionarMarca = function (latitude, longitude, rotulo) 
        {
            var posicao = new google.maps.LatLng(latitude, longitude);
            
            return adicionarMarcaPosicao(posicao, rotulo);
        };
        
        var adicionarMarcaPosicao = function (posicao, rotulo) 
        {
            var marker = new google.maps.Marker({
                position: posicao,
                map: $scope.map,
                title: rotulo
            });    
            
            return marker;
        }
        
        var criarRota = function (origem, destino) 
        {                
            var directionsDisplay = new google.maps.DirectionsRenderer({ map: $scope.map });

            // Set destination, origin and travel mode.
            var request = {
                destination: destino,
                origin: origem,
                travelMode: google.maps.TravelMode.WALKING
            };

            // Pass the directions request to the directions service.
            var directionsService = new google.maps.DirectionsService();
            directionsService.route(request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                }
            });
        } 

        var buscarEndereco = function (posicao) 
        {
            var geocoder = new google.maps.Geocoder;
            //var infowindow = new google.maps.InfoWindow;
            
            console.log("Iniciou busca de endereço pela posicao");
            
            geocoder.geocode({'location': posicao}, function(results, status) 
            {
                if (status === google.maps.GeocoderStatus.OK) 
                {                                        
                    console.log("Buscar retornou com sucesso");
                    console.log(results);
                    
                    var localizacao = results[1];
                    
                    if (localizacao) 
                    {
                        //$scope.map.setZoom(11);
                        
                        /*
                        console.log("Endereço localizado");
                        console.log("Place ID: " + localizacao.place_id);
                        console.log("Endereço: " + localizacao.formatted_address);
                        console.log("Nome: " + localizacao.address_components.long_name);
                        */                        
                        //adicionarMarcaPosicao(localizacao.geometry.location, localizacao.address_components.long_name);
                        
                        //infowindow.setContent(results[1].formatted_address);
                        //infowindow.open(map, marker);
                    } 
                    else 
                    {
                        window.alert('No results found');
                    }
                } 
                else 
                {
                    window.alert('Geocoder failed due to: ' + status);
                }
            });
        }
        
        var mostrarInformacoesLugar = function (place_id, onSucesso)
        {
            
            var infowindow = new google.maps.InfoWindow();
            var placeService = new google.maps.places.PlacesService($scope.map);

            placeService.getDetails({ placeId: place_id }, function(place, status) 
            {
                if (status === google.maps.places.PlacesServiceStatus.OK) 
                {
                    var marker = new google.maps.Marker({
                        map: $scope.map,
                        position: place.geometry.location
                    });
                    
                    google.maps.event.addListener(marker, 'click', function() {
                        infowindow.setContent(place.name);
                        infowindow.open($scope.map, this);
                    });
                    
                    if (onSucesso) onSucesso(place);
                }
            });
        }
        
        var desenharAndares = function () 
        {
            var imageBounds = {
                north: -26.885500,
                south: -26.887800,                
                east: -49.067700,
                west: -49.069400
            };
            
            var srcAndar1 = "../img/andar-1.png";
            var srcAndar2 = "../img/andar-2.png";

            var andar1 = new google.maps.GroundOverlay(srcAndar1, imageBounds);
            andar1.setMap($scope.map);
            
            var andar2 = new google.maps.GroundOverlay(srcAndar2, imageBounds);
            andar2.setMap($scope.map);
            
            $scope.andares = [andar1, andar2];            
            
            var mostrarAndar = function (indice) 
            {
                angular.forEach($scope.andares, function(a, i) {
                    a.setOpacity(i != indice ? 0 : 1);
                }, this);
                
                $scope.andarAtivo = indice;
            }            
            
            var onClickAndar = function (e) 
            {
                console.log("trocou andar");
                
                var i = (($scope.andarAtivo + 1) % $scope.andares.length);
                
                mostrarAndar(i);             
            }
            
            angular.forEach($scope.andares, function(a, i) {
                a.addListener('click', onClickAndar);
            }, this);
            
            mostrarAndar(0);
        }
        
        // Loja Adventure Shopping
        mostrarPosicaoMapa(-26.8873437, -49.0689346);
        
        desenharAndares();
        
        //origem = adicionarMarca(-26.887232, -49.069152, "A Colorida");
        //origem = adicionarMarca(-26.887334, -49.068959, "Plataforma Adventure");
        
        // Places ID
        var chocolatesOriom = "ChIJg0CbYDwf35QRWhML19wPF3g";
        var magazzinoItaliano = "ChIJ9TZ-Qjwf35QRMTZC5kxoqNA";
        
        //criarRota({ placeId: chocolatesOriom }, { placeId: magazzinoItaliano });
        
        /*
        $scope.place_ChocolatesOriom = null;
        $scope.place_MagazzinoItaliano = null;
        
        var tentarCriarRota = function () 
        {
            if (($scope.place_ChocolatesOriom) && ($scope.place_MagazzinoItaliano))
            {
                criarRota($scope.place_ChocolatesOriom, $scope.place_MagazzinoItaliano);
            }
        }
        
        mostrarInformacoesLugar(chocolatesOriom, function(place) {
            $scope.place_ChocolatesOriom = place;
            tentarCriarRota();
        });
        
        mostrarInformacoesLugar(magazzinoItaliano, function(place) {
            $scope.place_MagazzinoItaliano = place;
            tentarCriarRota();
        });
        */
        
        /*
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) 
        {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            mostrarPosicaoMapa(latitude, longitude);
            
            $ionicLoading.hide();

        }, function(err) {
            $ionicLoading.hide();
            console.log(err);
        });
        */
    });
});