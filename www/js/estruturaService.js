app.factory('EstruturaService', function($http)
{
  var url = api + "/estrutura";

  var service = { };

  service.obterEstrutura = function (q)
  {
    return $http.get(url + "/campus");
  };

  service.obterCampus = function (id)
  {
      return $http.get(url + "/campus/" + id);
  };

  service.obterBlocos = function (id)
  {
      return $http.get(url + "/campus/" + id + "/blocos");
  };

  service.obterBloco = function (id)
  {
      return $http.get(url + "/blocos/" + id);
  };

  return service;
});
