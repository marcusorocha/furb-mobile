strCtrlModule.controller('IndoorCtrl', function($scope, $ionicPlatform, $ionicLoading, $ionicPopup, IndoorService, bloco)
{
    $scope.pavimento = { };
    $scope.bloco = bloco.data;
    $scope.ambiente = null;
    $scope.grafo = { };

    $scope.init = function()
    {
        var container = document.getElementById('container');

        $scope.pavimento = $scope.bloco.pavimentos[0];

        $scope.ambiente = new AmbienteGrafio(container);
        $scope.ambiente.onClickObject = function(obj) 
        {
            if (obj instanceof Vertice)
            {
                alert(obj.descricao);
            }
        }

        $scope.carregarGrafo();
    }
    
    $scope.carregarGrafo = function() 
    {
        IndoorService.obterGrafoEdificio($scope.bloco.id).then
        (
            function(response) // Sucesso 
            {
                $scope.grafo = response.data;
                $scope.mudarNivel(0);                
            },
            function(response) // Erro 
            {
                $scope.showAlert("Ocorreu um erro ao carregas as informações do bloco");
            }         
        );
    }

    $scope.carregarPlanta = function()
    {
        $ionicLoading.show({
           template: 'Carregando planta...'
        });

        var onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                log( Math.round(percentComplete, 2) + '% downloaded' );
            }
        };

        var onError = function ( xhr ) { $ionicLoading.hide(); };
        var baseURL = api + "/plantas/obter/";
        var params = $scope.bloco.id + '/' + $scope.pavimento.id + '/';

        var planta = new Planta();
        planta.carregaPlanta(baseURL, params, function ( obj )
        {
            obj.copiarDoServidor( $scope.pavimento.planta );

            $scope.ambiente.scene.add( obj );

            $scope.pavimento.obj = obj;

            $ionicLoading.hide();

        }, onProgress, onError);
    }

    $scope.mudarNivel = function(op)
    {
        var andares = $scope.bloco.pavimentos.length;
        var origem  = $scope.pavimento.indice - 1;
        var destino = origem + op;

        if (destino >= 0 && destino < andares)
        {
            //if ( $scope.pavimento.obj )
            //    $scope.ambiente.scene.remove( $scope.pavimento.obj );
            
            $scope.ambiente.limpar();

            $scope.pavimento = $scope.bloco.pavimentos[destino];

            if ( $scope.pavimento.obj ) {
                $scope.ambiente.scene.add( $scope.pavimento.obj );
            } else {
                $scope.carregarPlanta();
            }
            
            $scope.mostrarLugares();
        }
    }
    
    $scope.mostrarLugares = function()
    {
        $scope.grafo.vertices.forEach(function(value) 
        {
            if (value.idPavimento == $scope.pavimento.id)
            {
                if (value.tipo == 2 || value.tipo == 3)
                {
                    var vertice = new Vertice();
                    vertice.fromJSON( value );
                    $scope.ambiente.scene.add( vertice );                
                }            
            }
        });
    }
    
    $scope.showAlert = function(msg)
    {
        var alertConfig = {
            title: 'Atenção!',
            template: msg
        };

        $ionicPopup.alert(alertConfig);
    }

    $ionicPlatform.ready($scope.init);
});
