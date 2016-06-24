strCtrlModule.controller('IndoorCtrl', function($scope, $ionicPopover, $ionicPlatform, $ionicLoading, $ionicPopup, IndoorService, GrafoService, RotaService, bloco)
{
    $scope.pavimento = { };
    $scope.bloco = bloco.data;
    $scope.ambiente = null;
    $scope.grafo = { };
    
    // Variáveis para definição de rotas
    $scope.origem = null;
    $scope.destino = null;

    $scope.init = function()
    {
        var container = document.getElementById('container');

        $scope.pavimento = $scope.bloco.pavimentos[0];

        $scope.ambiente = new AmbienteGrafio(container);
        $scope.ambiente.onClickObject = function(obj, event) 
        {
            if (obj instanceof Vertice)
            {
                //alert(obj.descricao);
                
                if ($scope.origem)
                {
                    if (obj.sid == $scope.origem.id)
                    {
                        var titulo = 'Origem';
                        var msg = 'Deseja desmarcar o(a) ' + obj.descricao + ' como origem de sua rota ?';
                        
                        $scope.showConfirm(titulo, msg, function() 
                        {
                            // Somente entra quando for "Sim" 
                            $scope.origem = null;
                        });
                    } 
                    else 
                    {
                        if (($scope.destino) && (obj.sid == $scope.origem.id))
                        {
                            var titulo = 'Destino';
                            var msg = 'Deseja desmarcar o(a) ' + obj.descricao + ' como destino de sua rota ?';
                            
                            $scope.showConfirm(titulo, msg, function() 
                            {
                                // Somente entra quando for "Sim" 
                                $scope.destino = null;       
                            });
                        }
                        else
                        {
                            var titulo = 'Destino';
                            var msg = 'Deseja marcar o(a) ' + obj.descricao + ' como destino de sua rota ?';
                            
                            $scope.showConfirm(titulo, msg, function() 
                            {
                                // Somente entra quando for "Sim" 
                                $scope.destino = obj.toJSON();       
                            });
                        }
                    }
                }
                else
                {
                    var titulo = 'Origem';
                    var msg = 'Deseja marcar o(a) ' + obj.descricao + ' como origem de sua rota ?';
                    
                    $scope.showConfirm(titulo, msg, function() 
                    {
                        // Somente entra quando for "Sim" 
                        $scope.origem = obj.toJSON();       
                    });
                }
            }
        }

        $scope.carregarGrafo();
    }
    
    $scope.carregarGrafo = function() 
    {
        $scope.grafo = GrafoService.getGrafo($scope.bloco.id);

        if ($scope.grafo == undefined)
        {
            IndoorService.obterGrafoEdificio($scope.bloco.id).then
            (
                function(response) // Sucesso 
                {
                    $scope.grafo = response.data;         
                    $scope.mudarNivel(0);
                    
                    $scope.grafo.id = $scope.bloco.id;
                    GrafoService.putGrafo($scope.grafo);
                },
                function(response) // Erro 
                {
                    $scope.showAlert("Ocorreu um erro ao carregas as informações do bloco");
                }
            );
        }
        else
        {
            $scope.mudarNivel(0);
        }
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
                var visivel = (value.tipo == 2 || value.tipo == 3);                                 
                {
                    var vertice = new Vertice();
                    vertice.fromJSON( value );
                    vertice.visible = visivel;
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
    
    $scope.showConfirm = function(titulo, mensagem, fnSim) 
    {
        var confirmPopup = $ionicPopup.confirm({
            title: titulo,
            template: mensagem,
            cancelText: 'Não', 
            okText: 'Sim'
        });

        confirmPopup.then(function(res) 
        {
            if(res) {
                console.log('Sim');
                if (fnSim) fnSim();
            } else {
                console.log('Não');
            }
        });
    };

    $scope.calcularRota = function() 
    {
        if (($scope.origem) && ($scope.destino))
        {
            RotaService.putGrafo($scope.grafo);
            RotaService.calcularCaminho($scope.origem, $scope.destino);
            
            $scope.mostrarRota();
        }
        else {
            $scope.showAlert('Ponto de origem e destino não informados');
        } 
    }
    
    $scope.mostrarRota = function()
    {
        $scope.ambiente.scene.children.forEach(function(obj) 
        {
            if (obj instanceof Vertice)
            {
                if (RotaService.temVertice(obj.sid))
                {            
                    obj.visible = true;          
                    obj.alterarCor(0xb00b1e);
                }
            }
        });
    }

    $ionicPlatform.ready($scope.init);
});