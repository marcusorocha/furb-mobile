app.factory('EstruturaService', function($http)
{
  var url = api + "/estrutura";

  var service = { };

  service.obterEstrutura = function (q)
  {
    var promise = $http.get(url + "/campus");
    promise.success(function(data) {
      return data;
    });
    return promise;
  };

  service.obterCampus = function (id)
  {
      var promise = $http.get(url + "/campus/" + id);
      promise.success(function(data) {
        return data;
      });
      return promise;
  };

  service.obterBlocos = function (id)
  {
      var promise = $http.get(url + "/campus/" + id + "/blocos");
      promise.success(function(data) {
        return data;
      });
      return promise;
  };

  service.obterBloco = function (id)
  {
      var promise = $http.get(url + "/blocos/" + id);
      promise.success(function(data) {
        return data;
      });
      return promise;
  };

  return service;
});
