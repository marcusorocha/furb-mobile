strCtrlModule.controller('CampusesCtrl', function($scope, $ionicLoading, EstruturaService) 
{  
  $scope.campuses = { };
  
  $ionicLoading.show({ template: 'Carregando campuses...' });
  
  EstruturaService.obterEstrutura().then(function(response) 
  {
    $scope.campuses = response.data;
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
    
});

strCtrlModule.controller('BlocosCtrl', function($scope, $ionicLoading, EstruturaService, campusId)
{
  $scope.blocos = { };
  
  $ionicLoading.show({ template: 'Carregando blocos...' });
  
  EstruturaService.obterBlocos(campusId).then(function(response) 
  {
      $scope.blocos = response.data;
      $ionicLoading.hide();
  },
  function() 
  {
      $ionicLoading.hide();
  });
    
});
