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
  });
    
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
