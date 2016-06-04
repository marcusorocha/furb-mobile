function AmbienteGrafio( container )
{
    var self = this;
    var camera, renderer;
    var moving, moveX, moveY;
    var zooming;
    var log_enable = false;
    var width, height;

    var zoomStart = new THREE.Vector2();
    var zoomDelta = new THREE.Vector2();
    var zoomEnd = new THREE.Vector2();

    this.scene = null;

    init();
    animate();

    function init()
    {
        width = container.clientWidth;
        height = container.clientHeight;

        camera = new THREE.CombinedCamera( width / 2, height / 2, 70, 1, 1000, - 500, 1000 );
        camera.toOrthographic();
        camera.setZoom(8);

        self.scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(new THREE.Color(0xFFFFFF));
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.clear();

        container.appendChild( renderer.domElement );

        window.addEventListener('resize', onWindowResize, false);

        container.addEventListener('mousedown', onMouseDown, false);
        container.addEventListener('mousemove', onMouseMove, false);
        container.addEventListener('mouseup', onMouseUp, false);
        container.addEventListener('mousewheel', onMouseWheel, false );

        container.addEventListener('touchstart', onTouchStart, false);
        container.addEventListener('touchmove', onTouchMove, false);
        container.addEventListener('touchend', onTouchEnd, false);
    }

    function dispose()
	{
		cancelAnimationFrame( id );

		renderer.dispose();

		//Funcoes.destruirObjeto( scene );

		self.scene = null;
		plane = null;
		camera = null;
		objetos = null;
		renderer = null;

		// disparando os callbacks quando...
		container.removeEventListener( 'resize', self.onWindowResize ); //redimensionar a janela
		container.removeEventListener( 'mousedown', self.onMouseDown ); //clicar
		container.removeEventListener( 'mousemove', self.onMouseMove ); //mover o mouse
		container.removeEventListener( 'mouseup', self.onMouseUp ); //soltar o clique
        container.removeEventListener('mousewheel', self.onMouseWheel );

		container.removeEventListener( 'touchstart', self.onTouchStart );
		container.removeEventListener( 'touchmove', self.onTouchMove );
		container.removeEventListener( 'touchend', self.onTouchEnd );

		//quando o conteúdo html do renderer for selecionado
		container.removeEventListener('selectstart', this.callbacks.onSelectStart );
	}

    function onWindowResize()
    {
        width = container.clientWidth;
        height = container.clientHeight;

        camera.setSize( width, height );
        camera.updateProjectionMatrix();
        renderer.setSize( width, height );
    }

    function onMouseWheel( event )
    {
        self.handleZoom( event.wheelDelta );
    }

    function startZoom( dx, dy )
    {
        zooming = true;

        var distance = Math.sqrt( dx * dx + dy * dy );

        zoomStart.set( 0, distance );

        log("start zoom");
    }

    function handleZoom( dx, dy )
    {
        const minZoom = 1.0;
        const maxZoom = 20.0;

        var ratio = 0.98;
        var distance = Math.sqrt( dx * dx + dy * dy );
        var nextZoom = camera.zoom;

        zoomEnd.set( 0, distance );

        zoomDelta.subVectors( zoomEnd, zoomStart );

        nextZoom = ( zoomDelta.y > 0 ) ? camera.zoom / ratio : camera.zoom * ratio;
        
        if (camera.zoom != nextZoom)
        {
            var zoom = Math.max( minZoom, Math.min( maxZoom, nextZoom ) );        
            camera.setZoom(zoom);
        }

        zoomStart.copy( zoomEnd );
    }

    function stopZoom()
    {
        zooming = false;
        log("stop zoom");
    }

    function startMove( x, y )
    {
        moving = true;
        moveX = x;
        moveY = y;

        log("start move");
        log("move X = " + moveX);
        log("move Y = " + moveY);
    }

    function handleMove( x, y )
    {
        if (moving)
        {
            const deltaX = (x - moveX) / 2;
            const deltaY = (y - moveY) / 2;

            const ratio = ((width / height) / camera.zoom) * 3.0;
            const tranX = - (deltaX * ratio);
            const tranY = + (deltaY * ratio);

            camera.translateX(tranX);
            camera.translateY(tranY);

            moveX = x;
            moveY = y;

            log("handle move");
            log("translate X = " + tranX);
            log("translate Y = " + tranY);
        }
    }

    function stopMove()
    {
        moving = false;
        moveX = 0;
        moveY = 0;

        log("stop move");
    }

    function onMouseDown( event )
    {
        startMove( event.clientX, event.clientY );
    }

    function onMouseMove( event )
    {
        handleMove( event.clientX, event.clientY );
    }

    function onMouseUp( event )
    {
        stopMove();
    }

    function onTouchStart( event )
    {
        event.preventDefault();

        if ( event.touches.length == 1 )
        {
            var x = event.touches[ 0 ].pageX;
            var y = event.touches[ 0 ].pageY;

            startMove( x, y );
        }

        if (event.touches.length == 2)
        {
            var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

            startZoom( dx, dy );
        }
    }

    function onTouchMove( event )
    {
        if ( event.touches.length === 1 )
        {
            event.preventDefault();

            var x = event.touches[ 0 ].pageX;
            var y = event.touches[ 0 ].pageY;

            handleMove( x, y );
        }

        if (event.touches.length == 2)
        {
            var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
            var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

            handleZoom( dx, dy );
        }
    }

    function onTouchEnd( event )
    {
        stopMove();
        stopZoom();
    }

    function animate()
    {
        requestAnimationFrame( animate );
        render();
    }

    function render()
    {
        renderer.render( self.scene, camera );
    }

    function log( message )
    {
        if (log_enable) console.log( message );
    }
}
