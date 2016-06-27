var Vertice = function()
{
    THREE.Mesh.call( this );
    
    this.sid = 0;
    this.tipo = 1;
    this.descricao = "";
    
    this.type = "Vertice";
    this.arestas = [];
    this.geometry = new THREE.CircleGeometry( 1.3, 32 );
    this.material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    this.selecionavel = true;

    // User isso se for usar icones
    //this.material = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture("crate.gif") });

    this.borda = new THREE.Line();
    this.borda.geometry = new THREE.CircleGeometry( 1.3, 32 );
    this.borda.material = new THREE.LineBasicMaterial( { color: 0x000000 } );
    this.borda.visible = false;
    // Remover o vertice do centro.
    this.borda.geometry.vertices.shift();

    this.alvo = new THREE.Line();
    this.alvo.geometry = new THREE.CircleGeometry( 1.7, 32 );
    this.alvo.material = new THREE.LineBasicMaterial( { color: 0x000000 } );
    this.alvo.visible = false;
    // Remover o vertice do centro.
    this.alvo.geometry.vertices.shift();
    
    this.add( this.borda );
    this.add( this.alvo );
    
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
    this.borda.visible = valor;
    this.alvo.visible = valor;
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