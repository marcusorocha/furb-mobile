strCtrlModule.controller('IndoorCtrl', function($scope, $ionicPlatform, bloco)
{
    $scope.pavimento = { };
    $scope.bloco = bloco.data;
    

    $scope.init = function()
    {
        $scope.pavimento = $scope.bloco.pavimentos[0];

        var container, camera, scene, renderer;
        var moving, moveX, moveY;
        var zooming;
        var mapa;
        var log_enable = false;
        var width, height;

        var zoomStart = new THREE.Vector2();
        var zoomDelta = new THREE.Vector2();
        var zoomEnd = new THREE.Vector2();

        init();
        animate();

        function init()
        {
            container = document.getElementById( 'container' );

            width = window.innerWidth;
            height = window.innerHeight;

            camera = new THREE.CombinedCamera( width / 2, height / 2, 70, 1, 1000, - 500, 1000 );
            camera.toOrthographic();
            camera.setZoom(8);

            scene = new THREE.Scene();

            var onProgress = function ( xhr ) {
                if ( xhr.lengthComputable ) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    log( Math.round(percentComplete, 2) + '% downloaded' );
                }
            };

            var onError = function ( xhr ) { };
            var baseURL = "http://indoor-furbmobile2016.rhcloud.com/api/plantas/obter/";
            var params = $scope.bloco.id + '/' + $scope.pavimento.id + '/';

            var planta = new Planta();
            planta.carregaPlanta(baseURL, params, function (planta)
            {
                planta.copiarDoServidor( $scope.pavimento.planta );

                scene.add( planta );

            }, onProgress, onError);

            //renderer = new THREE.CanvasRenderer();
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setClearColor(new THREE.Color(0xFFFFFF));
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.clear();

            container.appendChild( renderer.domElement );

            window.addEventListener('resize', onWindowResize, false);

            document.addEventListener('mousedown', onMouseDown, false);
            document.addEventListener('mousemove', onMouseMove, false);
            document.addEventListener('mouseup', onMouseUp, false);
            document.addEventListener('mousewheel', onMouseWheel, false );

            document.addEventListener('touchstart', onTouchStart, false);
            document.addEventListener('touchmove', onTouchMove, false);
            document.addEventListener('touchend', onTouchEnd, false);
        }

        function onWindowResize()
        {
            camera.setSize( window.innerWidth, window.innerHeight );
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function onMouseWheel ( event )
        {
            handleZoom( event.wheelDelta );
        }

        function startZoom( dx, dy )
        {
            zooming = true;

            var distance = Math.sqrt( dx * dx + dy * dy );

    		zoomStart.set( 0, distance );

            log("start zoom");
        }

        function handleZoom ( dx, dy )
        {
            const minZoom = 0.3;
            const maxZoom = 3.0;

            var ratio = Math.pow( 0.95, 1 );

            var distance = Math.sqrt( dx * dx + dy * dy );

    		zoomEnd.set( 0, distance );

    		zoomDelta.subVectors( zoomEnd, zoomStart );

            if ( zoomDelta.y > 0 )
            {
                var zoom = Math.max( minZoom, Math.min( maxZoom, camera.zoom / ratio ) );
                camera.setZoom(zoom);
            }
            else if ( zoomDelta.y < 0 )
            {
                var zoom = Math.max( minZoom, Math.min( maxZoom, camera.zoom * ratio ) );
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

                const ratio = ((window.innerWidth / window.innerHeight) / camera.zoom) * 5.9;
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
            renderer.render( scene, camera );
        }

        function log( message )
        {
            if (log_enable) console.log( message );
        }
    }

    $scope.mudarNivel = function(op)
    {
        var andares = $scope.bloco.pavimentos.length;
        var origem  = $scope.pavimento.indice - 1;
        var destino = origem + op;

        if (destino >= 0 && destino < andares)
        {
            $scope.pavimento = $scope.bloco.pavimentos[destino];
        }
    }

    $ionicPlatform.ready($scope.init);
});
