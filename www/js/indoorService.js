app.factory('IndoorService', function($http)
{  
  var service = { };

  service.obterGrafoEdificio = function (id)
  {
    return $http.get(api + "/grafo/edificio/" + id);
  };

  service.obterVerticesEdificio = function (id)
  {
    return $http.get(api + "/vertice/edificio/" + id);
  };

  return service;
});

app.factory('GrafoService', function($http)
{
  return {
    grafos: [ ],

    getGrafo: function (id)
    {
        var index = this.getGrafoIndex(id);

        if (index > -1)
            return angular.copy(this.grafos[index]);
        else
            return undefined;
    },

    getGrafoIndex: function (id)
    {
      var index = -1;

      for (var i in this.grafos)
      {
          if (this.grafos[i].id == id)
          {
              index = i;
          }
      }
      return index;
    },

    putGrafo: function (grafo)
    {
      this.grafos.push(angular.copy(grafo));     
    }
  }
});

app.factory('RotaService', function(DijkstraService)
{
  return {
    grafo: { },
    caminho: [],
    origem: { },
    destino: { },
    posicao: 0,
    calculado: false,

    getGrafo: function ()
    {
      return this.grafo;
    },

    putGrafo: function (grafo)
    {
      this.grafo = angular.copy(grafo);
    },

    temVertice: function (id)
    {
        return (this.getIndexVertice(id) > -1) ? true : false;        
    },

    getIndexVertice: function (id)
    {
      var index = -1;

      for (var i in this.caminho)
      {
          if (this.caminho[i].id == id)
          {
              index = i;
          }
      }
      return index;
    },

    getVerticePosicao: function()
    {
      return this.caminho[this.posicao];
    },

    goAnterior: function()
    {
      if (this.temAnterior())
      {
        this.posicao--;
        return this.getVerticePosicao();
      }
    },

    goProximo: function()
    {
      if (this.temProximo())
      {
        this.posicao++;
        return this.getVerticePosicao();
      }
    },

    temAnterior: function()
    {
      return this.posicao > 0;
    },

    temProximo: function()
    {
      return ((this.caminho.length - 1) > this.posicao);
    },

    navegar: function( op )
    {
      return (op > 0) ? this.goProximo() : this.goAnterior();
    },

    obterCaminho: function()
    {
      return angular.copy(this.caminho);
    },

    calcularCaminho: function(origem, destino) 
    {
      this.origem = angular.copy(origem);      
      this.destino = angular.copy(destino);
      this.caminho = DijkstraService.menorCaminhoGrafo(this.grafo, destino.id, origem.id);
      this.calculado = true;
    },

    limpar: function()
    {
      this.origem = { },
      this.destino = { },
      this.caminho = [];
      this.posicao = 0;
      this.calculado = false;
    }
  }
});

app.factory('DijkstraService', function() {

  var service = { };
 
	service.menorCaminhoGrafo = function(grafo, idOrigem, idDestino)
	{ 
    var d = [];
    var p = [];
		d.length = grafo.vertices.length;
		p.length = d.length;
		
    
		var idxOrigem = service.getVerticeIndex(grafo, idOrigem);
		var idxDestino = service.getVerticeIndex(grafo, idDestino);
		
		service.calcularCaminhos(grafo, idxOrigem, d, p);
		
		var caminho = [];    
		
		var custo = d[idxDestino];
		var vPai = idxDestino;
		
		do {
      var v = grafo.vertices[vPai];
			caminho.push(v);
			vPai = p[vPai];
		} 
		while (vPai > -1);
    
    var rota = angular.copy(caminho);
		
    var saida = '';
		while (rota.length != 0)
		{
			var v = rota.pop();
			saida += v.id;
			
			if (rota.length != 0)
			  saida += " -> ";
		}
		
		console.log("Caminho mínimo: " + saida);
		console.log("Custo: " + custo);
    
    return caminho;
	}

  service.getVertice = function (grafo, id)
  {
      var index = service.getVerticeIndex(grafo, id);

      if (index > -1)
          return angular.copy(grafo.vertices[index]);
      else
          return undefined;
  },
  
  service.getVerticeIndex = function (grafo, id)
  {
    var index = -1;

    for (var i in grafo.vertices)
    {
      if (grafo.vertices[i].id == id)
      {
        index = i;
      }
    }
    return index;
  },

  service.getAdjacenciasVertice = function(grafo, v) // Array
  {
    var adjacencias = [];

    for (var i in grafo.arestas)
    {
      var aresta = grafo.arestas[i];
      var vID = undefined;
      
      if (aresta.idVerticeA == v.id) {
        vID = aresta.idVerticeB;
      } else if (aresta.idVerticeB == v.id) {
        vID = aresta.idVerticeA;
      }

      if (vID)
      {
        var va = service.getVertice(grafo, vID);
        if (va) { 
          adjacencias.push(angular.copy(va)); 
        }
      }    
    }

    return adjacencias;
  }

  service.getAdjacenciaComVertice = function(grafo, u, v)
  {
    for (var i in grafo.arestas)
    {
      var aresta = grafo.arestas[i];

      if ((aresta.idVerticeA == u.id && aresta.idVerticeB == v.id) ||
          (aresta.idVerticeB == u.id && aresta.idVerticeA == v.id))
      {
        return angular.copy(aresta);
      }      
    }

    return undefined;
  }
	
	service.calcularCaminhos = function(grafo, vOrigem, d, p)
	{	
		var av = angular.copy(grafo.vertices);
		
		for (var i = 0; i < av.length; i++)
		{
			d[i] = Infinity;
			p[i] = -1;
		}
		
		d[vOrigem] = 0;
		
		var u = service.retiraVerticeMinimo(av, d);
		
		while (u != undefined)
		{
      var adjacencias = service.getAdjacenciasVertice(grafo, u);

			for (var i in adjacencias)
      {
        var v = adjacencias[i];

				service.relaxamento(grafo, d, p, u, v);
      }			
			u = service.retiraVerticeMinimo(av, d);
		}
	}
	
	service.relaxamento = function(grafo, d, p, u, v)
	{
		var a = service.getAdjacenciaComVertice(grafo, u, v);
		if (a)
		{	
			var indexU = service.getVerticeIndex(grafo, u.id);
			var indexV = service.getVerticeIndex(grafo, v.id);
		
			var distanciaUV = d[indexU] + a.custo;
		
			if (d[indexV] > distanciaUV)
			{
				d[indexV] = distanciaUV;
				p[indexV] = indexU;
			}
		}
	}
	
	service.retiraVerticeMinimo = function(av, d) // Vertice
	{
		var m = Infinity;
		var v = -1;
		for (var i = 0; i < av.length; i++)
    {
			if (av[i] != undefined)
      {
				if (d[i] < m)
				{
					m = d[i];
					v = i;
				}
      }
    }
		var aux = undefined;
		if (v > -1)
		{
			aux = av[v];
			av[v] = undefined;
		}
		
		return aux;
	}

  return service;
});