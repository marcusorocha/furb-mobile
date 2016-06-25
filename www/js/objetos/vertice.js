var Vertice = function()
{
    THREE.Mesh.call( this );
    
    this.sid = 0;
    this.tipo = 1;
    this.descricao = "";
    
    this.type = "Vertice";
    this.arestas = [];
    this.geometry = new THREE.CircleGeometry( 1, 32 );
    this.material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    this.selecionavel = true;

    this.marcacao = new THREE.Line();
    this.marcacao.geometry = new THREE.CircleGeometry( 1.2, 32 );
    this.marcacao.material = new THREE.LineBasicMaterial( { color: 0x000000 } );
    this.marcacao.visible = false;
    // Remover o vertice do centro.
    this.marcacao.geometry.vertices.shift();
    
    this.add( this.marcacao );
    
    console.log("vertice criado");    
};

Vertice.prototype = Object.create( THREE.Mesh.prototype );
Vertice.prototype.constructor = Vertice;

Vertice.prototype.alterarCor = function( cor ) 
{
    this.material = new THREE.MeshBasicMaterial( { color: cor } );
};

Vertice.prototype.restaurarCor = function() 
{
    this.material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
};

Vertice.prototype.setMarcado = function( valor ) 
{
    this.marcacao.visible = valor;
};

Vertice.prototype.marcar = function() 
{
    this.setMarcado(true);
};

Vertice.prototype.desmarcar = function() 
{
    this.setMarcado(false);
};

Vertice.prototype.addAresta = function( aresta ) 
{
    this.arestas.push( aresta );
};

Vertice.prototype.removeAresta = function( aresta )
{
    var idx = this.arestas.indexOf( aresta );
    this.arestas.splice( idx, 1 );
};

Vertice.prototype.atualizarArestas = function() 
{
    this.arestas.forEach(function(a) { a.atualizar(); }, this);
};

Vertice.prototype.obterPosicao = function() 
{
    return this.position;
};

Vertice.prototype.alterarPosicao = function( posicao )
{
    this.position.copy( posicao );    
    
    this.atualizarArestas();
};

Vertice.prototype.toJSON = function() 
{    
    var posicao = {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z
    }
    
    var json = {
        id: this.sid,
        descricao: this.descricao,
        tipo: this.tipo,
        posicao: posicao,
    };
    
    return json;
};

Vertice.prototype.fromJSON = function(json) 
{        
    this.position.x = json.posicao.x;
    this.position.y = json.posicao.y;
    this.position.z = json.posicao.z;
    
    this.sid = json.id;
    this.descricao = json.descricao;
    this.tipo = json.tipo;
};