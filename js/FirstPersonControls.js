/**
 * @author mrdoob / http://mrdoob.com/
 */

//debug.enable();

THREE.FirstPersonControls = function ( camera ) {
	var scope = this;

	camera.rotation.set( 0, 0, 0 );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;
	
	var onMouseMove = function ( event ) {
		if ( scope.enabled === false ) return;
		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
		player.yawObject.rotation.y -= movementX * 0.002;
		// TODO: up and down mouse look doesn't really work that well
		player.pitchObject.rotation.x -= movementY * 0.002;
        player.pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, player.pitchObject.rotation.x ) );
	};

	var onKeyDown = function ( event ) {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true; break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
				break;
            case 84:
                tank.rotateBarrel(1);
                break;
            case 71:
                tank.rotateBarrel(-1);
                break;

            case 85: // u
                CANNONS.aitank.bodyMesh.rotation.y += d2r;
                debug.log(CANNONS.aitank.barrelMesh.rotation);
                break;
            case 73: // i
                CANNONS.aitank.speed += 0.1;
                break;
            case 79: // o
                CANNONS.aitank.bodyMesh.rotation.y -= d2r;
                debug.log(CANNONS.aitank.barrelMesh.rotation);
                break;
            case 75: // k
                CANNONS.aitank.speed -= 0.1;
                break;
            case 76: // k
                CANNONS.aitank.shoot();
                break;

            case 190: // .
                CANNONS.aitank.barrelMesh.rotation.x += 5 * d2r;
                debug.log(CANNONS.aitank.barrelMesh.rotation);
                break;

            case 188: // ,
                CANNONS.aitank.barrelMesh.rotation.x -= 5 * d2r;
                debug.log(CANNONS.aitank.barrelMesh.rotation);
                break;
		}
	};

	var onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
			case 186: // ;
				debug.toggle();
				break;
		}
	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getDirection = function() {
		// assumes the camera itself is not rotated
		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );
		return function( v ) {
			rotation.set( player.pitchObject.rotation.x, 0, 0 );
			v.copy( direction ).applyEuler( rotation );
			return v;
		}
	}();

	this.moveSpeed = 100;
	this.velocityInc = 8.0;

	this.update = function ( delta ) {
		if ( scope.enabled === false ) return;
		//delta *= 0.1;
		velocity.x += ( - velocity.x ) * this.velocityInc * delta;
		velocity.z += ( - velocity.z ) * this.velocityInc * delta;
		velocity.y -= 0.25 * delta;
		if ( moveForward ) velocity.z -= this.moveSpeed * delta;
		if ( moveBackward ) velocity.z += this.moveSpeed * delta;
		if ( moveLeft ) velocity.x -= this.moveSpeed * delta;
		if ( moveRight ) velocity.x += this.moveSpeed * delta;
        player.yawObject.translateX( velocity.x );
        player.yawObject.translateY( velocity.y );
        player.yawObject.translateZ( velocity.z );
		
		// stick player to the ground
		var playerObject = player.yawObject;
		var px = w(playerObject.position.x);
		var pz = w(playerObject.position.z);
		//debug.msg(px + ', ' + pz + ', ' + world.getY(px, pz));
        playerObject.position.y = world.getY(px, pz) * 100 + 200;
	};
	
	this.enable = function() {
		this.enabled = true;
	};
	
	this.disable = function() {
		this.enabled = false;
	};
};