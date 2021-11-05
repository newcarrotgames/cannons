/**
 * Handles all the gui elements
 * TODO: this is a singleton, but still belongs in the CANNONS "namespace"
 * @type {{ch: null, healthBar: null, healthBarContainer: null, powerBar: null, PowerBarContainer: null, visible: boolean, currentPerspective: string, turnButtons: null, init: init, show: show, hide: hide, update: update, setPerspective: setPerspective, showTankControls: showTankControls, showFirstPersonControls: showFirstPersonControls, showTurnButtons: showTurnButtons}}
 */
var gui = {
	info : null,
    tankCh : null,
    playerCh : null,
    healthBar : null,
    healthBarContainer : null,
    powerBar : null,
    PowerBarContainer : null,
    visible: false,
    currentPerspective: 'fps',
    turnButtons : null,
    turnMove : null,
    turnShoot : null,
    moveClock : null,
    radar : null,
    init : function() {
    	this.info = document.getElementById('info');
        this.tankCh = document.getElementById('tank-ch');
        this.playerCh = document.getElementById('player-ch');
        this.healthBar = document.getElementById('health-bar');
        this.healthBar.fullWidth = 300;
        this.healthBarContainer = document.getElementById('health-bar-container');
        this.powerBar = document.getElementById('power-bar');
        this.PowerBarContainer = document.getElementById('power-bar-container');
        this.turnButtons = document.getElementById('turn-buttons');
        this.turnMove = document.getElementById('turn-button-move');
        this.turnShoot = document.getElementById('turn-button-shoot');
        this.moveClock = document.getElementById('turn-clock');
        this.radar = document.getElementById('radar').getContext('2d');
        this.getPointerLock = document.getElementById('get-pointer-lock');
    },
    /*show : function() {
        if (this.currentPerspective == 'tank')
        	this.showTankControls();
        else
        	this.showFirstPersonControls();
    },*/
    hideControls : function() {
        this.playerCh.style.display =
            this.tankCh.style.display =
                this.healthBarContainer.style.display =
                    this.healthBar.style.display =
                        this.PowerBarContainer.style.display =
                            this.powerBar.style.display = 'none';
        this.visible = false;
    },
    update : function() {
        this.powerBar.style.top = (this.PowerBarContainer.offsetHeight - player.muzzleVelocity * 5) - 2 + 'px';
        this.powerBar.style.height = player.muzzleVelocity * 5 - 2 + 'px';
        this.healthBar.style.width = this.healthBar.fullWidth * (player.health / 100) + 'px';
    },
    setPerspective : function(per) {
    	this.currentPerspective = per;
    },
    showTankControls : function() {
        this.tankCh.style.display =
            this.healthBarContainer.style.display =
                this.healthBar.style.display =
                    this.PowerBarContainer.style.display =
                        this.powerBar.style.display = 'block';
    },
    showFirstPersonControls : function() {
    	this.powerBar.style.display = this.PowerBarContainer.style.display = this.tankCh.style.display = 'none';
    	this.healthBarContainer.style.display = this.healthBar.style.display = this.playerCh.style.display = 'block';
    },
    showTurnButtons : function() {
    	this.hideSplashScreen();
        this.turnButtons.style.display = 'block';
        this.turnMove.addEventListener('click', this.moveButtonClickListener);
        this.turnShoot.addEventListener('click', this.shootButtonClickListener);
    },
    moveButtonClickListener : function(event) {
        this.removeEventListener(this.moveButtonClickListener);
        CANNONS.stateManager.changeState(CANNONS.gameStates.move);
    },
    shootButtonClickListener : function(event) {
        this.removeEventListener(this.shootButtonClickListener);
        CANNONS.stateManager.changeState(CANNONS.gameStates.shoot);
    },
    hideTurnButtons : function() {
    	this.hideSplashScreen();
        this.turnButtons.style.display = 'none';
    },
    lockPointer : function(callback) {
    	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    	if (havePointerLock) {
            var pointerlockerror = function ( event ) { alert('Error requesting pointer lock'); console.log(event); };
            // Hook pointer lock state change events
            document.addEventListener( 'pointerlockchange', callback, false );
            document.addEventListener( 'mozpointerlockchange', callback, false );
            document.addEventListener( 'webkitpointerlockchange', callback, false );
            document.addEventListener( 'pointerlockerror', pointerlockerror, false );
            document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
            document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
            var element = document.body;
            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
            if (/Firefox/i.test(navigator.userAgent)) {
                var fullscreenchange = function (event) {
                    if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
                        document.removeEventListener('fullscreenchange', fullscreenchange);
                        document.removeEventListener('mozfullscreenchange', fullscreenchange);
                        element.requestPointerLock();
                    }
                };
                document.addEventListener('fullscreenchange', fullscreenchange, false);
                document.addEventListener('mozfullscreenchange', fullscreenchange, false);
                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
                element.requestFullscreen();
            } else {
                element.requestPointerLock();
            }
        } else {
            alert("Could not lock mouse pointer (maybe use HTML5 WebGL compatible browser?)")
        }
    },
    unlockPointer : function() {
    	document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
    	document.exitPointerLock();
    },
    showSplashScreen : function() {
        this.info.addEventListener( 'click', this.infoClickListener, false);
    },
    debugPointerLock : function() {
        this.getPointerLock.addEventListener('click', function() { gui.lockPointer() });
        this.info.addEventListener( 'click', this.infoDebugClickListener, false);
    },
    hideSplashScreen : function() {
    	this.info.style.display = 'none';
    },
    isPointerLockOn : function() {
    	return document.pointerLockElement === element || 
	    	document.mozPointerLockElement === element || 
	    	document.webkitPointerLockElement === element;
    },
    useTankControls : function() {
    	// TODO: remove listners from other controls!
    	controls = new THREE.TankControls(camera, audio);
    },
    useFirstPersonControls : function() {
    	controls = new THREE.FirstPersonControls(camera);
    },
    turnTransition : function(msg) {
        controls.disable();
        this.hideControls();
        this.unlockPointer();
        this.info.innerHTML = msg;
        this.info.style.display = 'block';
        this.info.addEventListener('click', this.infoClickListener, false);
    },
    infoClickListener : function(event) {
        this.removeEventListener('click', this.infoClickListener, false);
        gui.hideSplashScreen();
        CANNONS.stateManager.nextState();
    },
    infoDebugClickListener : function(event) {
        this.removeEventListener('click', this.infoDebugClickListener, false);
        gui.hideSplashScreen();
        gui.lockPointer();
        window.addEventListener('mousemove', gui.onMouseMove, false );
    },
    onMouseMove : function(e) {
        player.getSelectedObject();
    },
    setMoveClock : function(time) {
        if (this.moveClock.style.display != 'block')
            this.moveClock.style.display = 'block';
        this.moveClock.innerHTML = 30 - Math.floor(time);
    },
    hideMoveClock : function() {
        this.moveClock.style.display = 'none';
    },
    drawRadar : function() {
        this.radar.fillStyle = "rgb(0,0,0)";
    	this.radar.fillRect(0, 0, 255, 255);
        /*for (var y = 0; y < world.height; y++)
        	for (var x = 0; x < world.width; x++) {
        		var valXY = world.data[y*world.width+x];
        		context.fillRect(x,y,x,y);
        	}*/
        var px = w(player.getObject().position.x);
        var py = w(player.getObject().position.z);
        this.radar.fillStyle = "rgb(0,200,0)";
        this.radar.fillRect(px, py, 5, 5);
        px = w(CANNONS.aitank.bodyMesh.position.x);
        var py = w(CANNONS.aitank.bodyMesh.position.z);
        this.radar.fillStyle = "rgb(200,0,0)";
        this.radar.fillRect(px, py, 5, 5);
        this.radar.fillStyle = "blue";
        this.radar.fillRect(5, 100, 5, 5);
        this.radar.fillStyle = "white";
        this.radar.fillRect(100, 5, 5, 5);
    }
};