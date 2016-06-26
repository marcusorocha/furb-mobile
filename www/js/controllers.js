/* global ionic */
var strCtrlModule = angular.module('starter.controllers', []);

strCtrlModule.controller('AppCtrl', function($scope, $filter, $state, $ionicModal, $ionicLoading, $ionicPopup, $timeout, EstruturaService) 
{
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.opcoes = [];

    $ionicLoading.show({ template: 'Carregando estrutura...' });
  
    EstruturaService.obterEstrutura().then(function(response) 
    {
        var campuses = $filter('orderBy')(response.data, 'nome');

        for (var c in campuses)
        {
            var campus = campuses[c];

            $scope.opcoes.push({ id: 0, rotulo: campus.nome, divisor: true });

            campus.edificios = $filter('orderBy')(campus.edificios, 'nome');

            for (var b in campus.edificios)
            {
                var bloco = campus.edificios[b];

                $scope.opcoes.push({ id: bloco.id, rotulo: bloco.nome, divisor: false });
            }
        }

        $ionicLoading.hide();
    },
    function() 
    {        
        $ionicLoading.hide();
        $scope.showAlert("Houve um erro ao carregar a lista de campus. Infelizmente o servidor parece estar indisponível.")
    });

    $scope.showAlert = function(msg)
    {
        var alertConfig = {
            title: 'Atenção!',
            template: msg
        };

        $ionicPopup.alert(alertConfig);
    }

    $scope.go = function(opcao)
    {
        if (opcao.id != 0)
        {
            //$state.go('app.indoor', { blocoId: opcao.id });
            $state.go('app.indoor');
            $scope.$broadcast('mostrarBloco', { blocoId: opcao.id });
        }
    }
});