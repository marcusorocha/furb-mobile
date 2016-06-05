app.factory('IndoorService', function($http)
{  
  var service = { };

  service.obterGrafoEdificio = function (id)
  {
    return $http.get(api + "/grafo/edificio/" + id);
  };

  return service;
});