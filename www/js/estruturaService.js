app.factory('EstruturaService', function ($http) 
{
    var url = api + "/estrutura";

    var service = {};

    service.obterEstrutura = function () 
    {
        return $http.get(url + '/obter');
    };

    service.obterCampuses = function (q) 
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

    service.obterLugares = function (q) 
    {
        return $http.get(url + "/lugares");
    };

    service.obterPorCoordenadas = function (latitude, longitude) 
    {
        return $http.get(url + "/coordenadas/" + latitude + "/" + longitude);
    };

    return service;
});
