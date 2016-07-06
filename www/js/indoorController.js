strCtrlModule.controller('IndoorCtrl', function($scope, $filter, $stateParams, $ionicPopover, $ionicActionSheet, $ionicModal, $ionicPlatform, $ionicLoading, $ionicPopup, $cordovaGeolocation, IndoorService, GrafoService, RotaService, EstruturaService)
{
    $scope.pavimento = { }; 
    $scope.ambiente = null;
    $scope.grafo = { };
    $scope.lugares = null;
    $scope.rota = null;
    $scope.posicao = null;
    $scope.pontosRelevantes = null;
    
    // Variáveis para definição de rotas
    $scope.origem = null;
    $scope.destino = null;

    $ionicModal.fromTemplateUrl('pesquisa-modal.html', 
    {
        scope: $scope,
        animation: 'slide-in-up'
    })
    .then(function(modal) 
    {
        $scope.modal = modal;
    });

    $scope.openModal = function() 
    {
        $scope.pesquisa = {};
        $scope.modal.show();
    }

    $scope.closeModal = function() 
    {
        $scope.modal.hide();
    }

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() 
    {
        $scope.modal.remove();
    });

    $scope.$on('mostrarBloco', function (event, args) 
    {
        $scope.carregarBloco(args.blocoId);
    });

    $scope.init = function()
    {
        var mapa = document.getElementById('mapa');
        //var rota = document.getElementById('rota');
        //var alturaMapa = window.innerHeight - rota.offsetHeight - 44;
        var alturaMapa = window.innerHeight - 88;

        mapa.style.height = alturaMapa + "px"; 

        $scope.ambiente = new AmbienteGrafico(mapa);
        $scope.ambiente.onClickObject = function(obj, event) 
        {
            if (obj instanceof Vertice)
            {
                $scope.mostrarAcoesVertice(obj);                
            }
        }

        $scope.carregarBloco($stateParams.blocoId);
    }

    $scope.pesquisar = function()
    {
        $scope.openModal();
        $scope.carregarLugares();
    }

    $scope.mostrarLugar = function(lugar)
    {
        $scope.closeModal();

        if ($scope.bloco.id != lugar.idEdificio)
        {
            $scope.carregarBloco(lugar.idEdificio, lugar.idPavimento, lugar.id);
        }
        else
        {
            $scope.carregarPavimento(lugar.idPavimento, lugar.id);
        }
    }

    $scope.carregarBloco = function(blocoId, pavimentoId, verticeId)
    {
        if ((blocoId) && (blocoId != 0))
        {
            EstruturaService.obterBloco(blocoId).then
            (
                function(response) // Sucesso
                {
                    $scope.bloco = response.data;
                    $scope.bloco.pavimentos = $filter('orderBy')($scope.bloco.pavimentos, 'indice');

                    $scope.carregarGrafo(blocoId, pavimentoId, verticeId);                
                },
                function(response)
                {
                    $scope.showAlert("Ocorreu um erro ao carregas as informações do bloco");
                }
            );
        }
        else
        {
            EstruturaService.obterEstrutura().then
            (
                function(response) // Sucesso
                {
                    var estrutura = response.data;
                    estrutura = $filter('orderBy')(estrutura, 'nome');
                    var blocos = estrutura[0].edificios;
                    blocos = $filter('orderBy')(blocos, 'nome');
                    
                    $scope.bloco = blocos[0];
                    $scope.bloco.pavimentos = $filter('orderBy')($scope.bloco.pavimentos, 'indice');

                    $scope.carregarGrafo($scope.bloco.id);
                },
                function(response)
                {
                    $scope.showAlert("Ocorreu um erro ao carregas as informações do bloco");
                }
            );
        }
    }    
    
    $scope.carregarGrafo = function(blocoId, pavimentoId, verticeId)
    {
        $scope.grafo = GrafoService.getGrafo(blocoId);

        if ($scope.grafo == undefined)
        {
            IndoorService.obterGrafoEdificio(blocoId).then
            (
                function(response) // Sucesso 
                {
                    $scope.grafo = response.data;                    
                    $scope.grafo.id = blocoId;
                    GrafoService.putGrafo($scope.grafo);

                    console.log('Grafo -> Vertices = ' + $scope.grafo.vertices.length);                    
                    console.log('Grafo -> Arestas = ' + $scope.grafo.arestas.length);

                    $scope.carregarPavimento(pavimentoId, verticeId);
                },
                function(response) // Erro 
                {
                    $scope.showAlert("Ocorreu um erro ao carregas as informações do bloco");
                }
            );
        }
        else
        {
            $scope.carregarPavimento(pavimentoId, verticeId);            
        }
    }

    $scope.carregarPavimento = function(pavimentoId, verticeId) 
    {
        var indice = 0;

        if (pavimentoId)
        {
            var pavimento = $scope.bloco.pavimentos.find(function(p) { return p.id == this; }, pavimentoId);
            if (pavimento)
            {
                indice = pavimento.indice - 1;
            }
        }

        if (verticeId)
        {
            $scope.destino = $scope.grafo.vertices.find(function(v) { return v.id == this; }, verticeId);
        }

        $scope.mostrarNivel( indice );
    }

    $scope.carregarPlanta = function()
    {
        $ionicLoading.show({
           template: 'Carregando planta...'
        });

        var onProgress = function ( xhr ) {
            if ( xhr.lengthComputable ) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log( Math.round(percentComplete, 2) + '% downloaded' );
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

    $scope.carregarLugares = function() 
    {
        $ionicLoading.show({
           template: 'Carregando lugares...'
        });

        EstruturaService.obterLugares().then(function(response) 
        {
            $scope.lugares = response.data;
            $ionicLoading.hide();
        },
        function() 
        {        
            $ionicLoading.hide();
            $scope.showAlert("Houve um erro ao carregar a lista de campus. Infelizmente o servidor parece estar indisponível.")
        });        
    }

    $scope.mudarNivel = function(op)
    {
        var andares = $scope.bloco.pavimentos.length;
        var origem  = $scope.pavimento.indice - 1;
        var destino = origem + op;

        if (destino >= 0 && destino < andares)
        {            
            $scope.mostrarNivel( destino );
        }
    }

    $scope.mostrarNivel = function( indice )
    {
        $scope.ambiente.limpar();

        $scope.pavimento = $scope.bloco.pavimentos[indice];

        if ( $scope.pavimento.obj ) {
            $scope.ambiente.scene.add( $scope.pavimento.obj );
        } else {
            $scope.carregarPlanta();
        }
        
        $scope.mostrarPontosRelevantes();
        $scope.mostrarRota();
    }
    
    $scope.mostrarPontosRelevantes = function()
    {
        if ($scope.pontosRelevantes)
            $scope.ambiente.scene.remove($scope.pontosRelevantes);

        $scope.pontosRelevantes = new THREE.Object3D;

        console.time('carga-grafo');
        $scope.grafo.vertices.forEach(function(value) 
        {
            if (value.idPavimento == $scope.pavimento.id)
            {
                var isLugar = (value.tipo == 2 || value.tipo == 3);                
                var marcado = $scope.isOrigemOrDestino( value.id );

                var vertice = new Vertice();
                vertice.fromJSON( value );
                vertice.alterarCor(0xb00b1e);
                vertice.setMarcado( marcado );
                vertice.visible = isLugar; 

                $scope.pontosRelevantes.add( vertice );
            }
        });        

        $scope.ambiente.scene.add( $scope.pontosRelevantes );
        console.timeEnd('carga-grafo');
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
            $scope.limparRota(true);
        }
        else if (($scope.origem) && ($scope.destino))
        {
            console.time('calculo-rota');
            RotaService.putGrafo($scope.grafo);
            RotaService.calcularCaminho($scope.origem, $scope.destino);
                        
            $scope.posicao = RotaService.getVerticePosicao();
            $scope.mostrarRota();
            console.timeEnd('calculo-rota');

            $scope.mostrarPavimentoPosicaoNavegacao();
        }
        else {
            $scope.showAlert('Ponto de origem e destino não informados');
        }
    }

    $scope.limparRota = function( limparMarcacoes ) 
    {        
        $scope.restaurarPontoNavegado();
        $scope.posicao = null;        
        if (limparMarcacoes)
        {
            $scope.limparOrigem();
            $scope.limparDestino();
        }
        RotaService.limpar();
        $scope.mostrarRota();        
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

            var caminho = RotaService.obterCaminho(); 

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
            $scope.mostrarPosicaoNavegacao();
        }
    }

    $scope.isOrigemOrDestino = function( verticeId )
    {
        return ($scope.getOrigemOrDestino( verticeId ) > 0);
    }

    $scope.getOrigemOrDestino = function( verticeId )
    {
        if ($scope.origem)
            if (verticeId == $scope.origem.id)
                return 1; 
        
        if ($scope.destino)
            if (verticeId == $scope.destino.id)
                return 2;

        return 0;
    }

    $scope.obterPontoDoMapa = function( vertice )
    {
        for (var i in $scope.pontosRelevantes.children) 
        {
            var ponto = $scope.pontosRelevantes.children[i];

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
    
    $scope.limparOrigem = function() 
    {
        if ($scope.origem)
        {
            var pOrigem = $scope.obterPontoDoMapa($scope.origem);
            if (pOrigem) pOrigem.desmarcar();
            $scope.origem = null;
        }    
    }

    $scope.limparDestino = function() 
    {
        if ($scope.destino)
        {
            var pDestino = $scope.obterPontoDoMapa($scope.destino);
            if (pDestino) pDestino.desmarcar();
            $scope.destino = null;
        } 
    }

    $scope.mostrarAcoesVertice = function( vertice ) 
    {
        if ($scope.isOrigemOrDestino(vertice.sid))
        {
            $ionicActionSheet.show(
            {
                buttons: [ { text: 'Desmarcar' } ],
                titleText: 'Ações',
                cancelText: 'Cancelar',
                cancel: function() { },
                buttonClicked: function(index) 
                {
                    if (index == 0)
                    {                
                        $scope.limparRota(false);

                        if ($scope.getOrigemOrDestino( vertice.sid ) == 1)
                            $scope.limparOrigem();
                        else
                            $scope.limparDestino();
                    }
                    return true;
                }
            });
        } else {
            $ionicActionSheet.show(
            {
                buttons: [
                    { text: 'Marcar como Origem' },
                    { text: 'Marcar como Destino' }
                ],
                titleText: 'Ações',
                cancelText: 'Cancelar',
                cancel: function() { },
                buttonClicked: function(index) 
                {
                    switch (index)
                    {
                        case 0:
                        {
                            $scope.selecionarOrigem(vertice);
                            break;
                        }
                        case 1: 
                        {
                            $scope.selecionarDestino(vertice);
                            break;
                        }
                    }
                    return true;
                }
            });
        }
    };

    $scope.selecionarOrigem = function( vertice ) 
    {   
        $scope.limparOrigem();      
        $scope.origem = vertice.toJSON();
        vertice.marcar();  
    };

    $scope.selecionarDestino = function( vertice ) 
    { 
        $scope.limparDestino();        
        $scope.destino = vertice.toJSON();
        vertice.marcar();  
    };

    $scope.navegar = function( fator )
    {
        $scope.restaurarPontoNavegado();
        $scope.posicao = RotaService.navegar( fator );        
        $scope.mostrarPavimentoPosicaoNavegacao();

        console.log("Posicao: " + RotaService.posicao);
    }

    $scope.restaurarPontoNavegado = function()
    {
        if ($scope.posicao)
        {
            var ponto = $scope.obterPontoDoMapa( $scope.posicao );
            if (ponto) 
            {
                if ($scope.isOrigemOrDestino($scope.posicao.id)) {
                    ponto.alterarCor(0xb00b1e);
                } else {
                    ponto.visible = false;
                }
            }
        }
    }

    $scope.mostrarPavimentoPosicaoNavegacao = function() 
    {
        if ($scope.posicao.idEdificio != $scope.bloco.id) 
        {
            $scope.carregarBloco($scope.posicao.idEdificio, $scope.posicao.idPavimento);
        } 
        else if ($scope.posicao.idPavimento != $scope.pavimento.id) 
        {
            $scope.carregarPavimento($scope.posicao.idPavimento);
        } 
        else 
        {
            $scope.mostrarPosicaoNavegacao();
        }        
    }

    $scope.mostrarPosicaoNavegacao = function()
    {
        if ($scope.posicao)
        {
            var pontoP = $scope.obterPontoDoMapa( $scope.posicao );
            if (pontoP)
            {
                pontoP.alterarCor( 0x000000 );
                pontoP.visible = true;
            }
        }
    }

    $scope.temAnteriorRota = function()
    {
        return RotaService.temAnterior();
    }

    $scope.temProximoRota = function()
    {
        return RotaService.temProximo();
    }

    $scope.temOrigemDestino = function()
    {
        return (($scope.origem) && ($scope.destino));
    }

    $scope.localizar = function()
    {
        $ionicLoading.show({ template: 'Buscando localização...' });

        var posOptions = {timeout: 10000, enableHighAccuracy: true};

        $cordovaGeolocation.getCurrentPosition(posOptions).then($scope.onObterPosicao, $scope.onErroPosicao);
    }

    $scope.onObterPosicao = function(position)
    {
        // Aqui processar a posicao
        //$scope.showAlert('Latitude: ' + $scope.geo.latitude + ' <br/> '
        //                +'Longitude: ' + $scope.geo.longitude);

        /*
        var latitude = -26.905734;
        var longitude = -49.079959;
        /*/
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        //*/

        EstruturaService.obterPorCoordenadas(latitude, longitude).then
        (
            function(response) // Sucesso 
            {
                var bloco = response.data;                

                $scope.carregarBloco(bloco.id);
                $ionicLoading.hide();

                $scope.showAlert("Você está em " + bloco.nome);
                
                /*
                IndoorService.obterVerticesEdificio(bloco.id).then
                (
                    function(response) // Sucesso 
                    {
                        var vertices = response.data;
                        
                        // aqui filtrar somente os vertices do 1 pavimento ou o atual (decidir);
                        
                        for (var v in vertices)
                        {
                            //
                        }

                        //this.custo = new THREE.Line3(posA, posB).distance();                        

                        $scope.carregarBloco(bloco.id);
                        $ionicLoading.hide();
                    },
                    function(response) // Erro 
                    {
                        $scope.carregarBloco(bloco.id);
                        $ionicLoading.hide();                        
                    }
                );     
                */           
            },
            function(response) // Erro 
            {
                $scope.showAlert(response.data.mensagem);
                $ionicLoading.hide();
            }            
        );        
    };

    $scope.onErroPosicao = function(erro)
    {
        console.log(erro);
        $scope.showAlert('Ocorreu um erro ao buscar a posição do GSP \n Tente novamente !');
        $ionicLoading.hide();
    };

    $ionicPlatform.ready($scope.init);
});