strCtrlModule.controller('IndoorCtrl', function($scope, $ionicPopover, $ionicPlatform, $ionicLoading, $ionicPopup, IndoorService, GrafoService, RotaService, bloco)
{
    $scope.pavimento = { };
    $scope.bloco = bloco.data;
    $scope.ambiente = null;
    $scope.grafo = { };
    $scope.lugares = null;
    $scope.rota = null;
    
    // Variáveis para definição de rotas
    $scope.origem = null;
    $scope.destino = null;

    $scope.init = function()
    {
        var mapa = document.getElementById('mapa');
        var rota = document.getElementById('rota');
        var alturaMapa = window.innerHeight - rota.offsetHeight - 44;

        mapa.style.height = alturaMapa + "px";

        $scope.pavimento = $scope.bloco.pavimentos[0];

        $scope.ambiente = new AmbienteGrafico(mapa);
        $scope.ambiente.onClickObject = function(obj, event) 
        {
            if (obj instanceof Vertice)
            {
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
                            obj.desmarcar();
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
                                obj.desmarcar();
                            });
                        }
                        else
                        {
                            var titulo = 'Destino';
                            var msg = 'Deseja marcar o(a) ' + obj.descricao + ' como destino de sua rota ?';
                            
                            $scope.showConfirm(titulo, msg, function() 
                            {
                                // Limpar o destino atual caso existir
                                $scope.limparDestino();

                                // Somente entra quando for "Sim" 
                                $scope.destino = obj.toJSON();
                                obj.marcar();
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
                        obj.marcar();
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
            $scope.mostrarRota();
        }
    }
    
    $scope.mostrarLugares = function()
    {
        if ($scope.lugares)
            $scope.ambiente.scene.remove($scope.lugares);

        $scope.lugares = new THREE.Object3D;

        $scope.grafo.vertices.forEach(function(value) 
        {
            if (value.idPavimento == $scope.pavimento.id)
            {
                var isLugar = (value.tipo == 2 || value.tipo == 3);                
                var marcado = $scope.isOrigemOrDestino( value );

                var vertice = new Vertice();
                vertice.fromJSON( value );
                vertice.alterarCor(0xb00b1e);
                vertice.setMarcado( marcado );
                vertice.visible = isLugar; 

                $scope.lugares.add( vertice );
            }
        });

        $scope.ambiente.scene.add( $scope.lugares );
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
            if (res) {
                console.log('Sim');
                if (fnSim) fnSim();
            } else {
                console.log('Não');
            }
        });
    };

    $scope.calcularRota = function() 
    {
        if ($scope.rota)
        {
            RotaService.limpar();
            $scope.limparOrigem();
            $scope.limparDestino();
            $scope.mostrarRota();
        }
        else if (($scope.origem) && ($scope.destino))
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
        if ($scope.rota)
        {
            $scope.ambiente.scene.remove($scope.rota);
            $scope.rota = null;
        }

        if (RotaService.calculado)
        {
            $scope.rota = new THREE.Object3D;

            var caminho = angular.copy(RotaService.caminho); 

            for (var i = 1; i < caminho.length; i++) 
            {
                var vA = caminho[i - 1];
                var vB = caminho[i];

                var pontoA = $scope.obterPontoDoMapa( vA );
                var pontoB = $scope.obterPontoDoMapa( vB );

                if ((pontoA) && (pontoB))
                {
                    var posicaoA = pontoA.obterPosicao();
                    var posicaoB = pontoB.obterPosicao();

                    posicaoA.z -= 0.1;
                    posicaoB.z -= 0.1;

                    var linha = $scope.desenhaLinhaPontilhada(0xffaa00, posicaoA, posicaoB );

                    $scope.rota.add( linha );
                }
            };

            $scope.ambiente.scene.add( $scope.rota );
        }
        $scope.atualizarRotuloBotaoRota();
    }

    $scope.isOrigemOrDestino = function( vertice )
    {
        if ($scope.origem)
            if (vertice.id == $scope.origem.id)
                return true; 
        
        if ($scope.destino)
            if (vertice.id == $scope.destino.id)
                return true;

        return false;
    }

    $scope.obterPontoDoMapa = function( vertice )
    {
        for (var i in $scope.lugares.children) 
        {
            var ponto = $scope.lugares.children[i];

            if (ponto.sid == vertice.id)
                return ponto;
        }
        return undefined;
    }

    // Desenha uma linha pontilhada
	$scope.desenhaLinhaPontilhada = function( cor, pontoA, pontoB )
	{
        var material_linha = new THREE.LineDashedMaterial({ color: cor, dashSize: 0.5, gapSize: 0.5, linewidth: 3 });
		var geometry_linha = new THREE.Geometry();

		geometry_linha.vertices.push(pontoA, pontoB);
        geometry_linha.computeLineDistances();

		var linha_pontilhada = new THREE.Line( geometry_linha, material_linha );

		return linha_pontilhada;
	}

    $scope.atualizarRotuloBotaoRota = function() 
    {        
        if ($scope.rota)
            $scope.rotuloBotaoRota = 'Limpar Rota';
        else
            $scope.rotuloBotaoRota = 'Calcular Rota';        
    }
    
    $scope.limparOrigem = function() 
    {
        if ($scope.origem)
        {
            var pOrigem = $scope.obterPontoDoMapa($scope.origem);
            pOrigem.desmarcar();
            $scope.origem = null;
        }    
    }

    $scope.limparDestino = function() 
    {
        if ($scope.destino)
        {
            var pDestino = $scope.obterPontoDoMapa($scope.destino);
            pDestino.desmarcar();
            $scope.destino = null;
        } 
    }

    $ionicPlatform.ready($scope.init);
});