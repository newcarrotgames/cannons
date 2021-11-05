CANNONS.Player = function(camera) {
    this.name = 'player';
    this.health = 100;
    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();
    this.isShooting = false;
    this.canShoot = false;
    this.canMove = false;

    this.pitchObject.add(camera);
    var spawnPoint = world.getSpawn(0);
    this.yawObject.position.x = spawnPoint.x;
    this.yawObject.position.z = spawnPoint.z;
    this.yawObject.position.y = spawnPoint.y + 1000;
    this.yawObject.add(this.pitchObject);
    // TODO: find a better place for this
    this.muzzleVelocity = 0;

    // used to get selected cube face
    this.projector = new THREE.Projector();
    this.INTERSECTED = null;
    this.centerWindowVector = new THREE.Vector3(0.0, 0.0, 0.5);

    this.cursor = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshLambertMaterial({ ambient: 0x00ff00 }));
    this.cursorShowing = false;

    this.getSelectedObject = function() {
        this.raycaster = this.projector.pickingRay(this.centerWindowVector.clone(), camera);
        this.raycaster.far = 800;
        var intersects = this.raycaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            if (this.cursorShowing == false) {
                scene.add(this.cursor);
                this.cursorShowing = true;
                document.getElementById('container').addEventListener('click', this.cursorListener);
                window.addEventListener('mousedown', this.cursorListener, false);
            }
            if (intersects[0].object != this.cursor) {
                this.cursor.position.x = intersects[0].point.x;
                this.cursor.position.y = intersects[0].point.y;
                this.cursor.position.z = intersects[0].point.z;
            } else {
                this.cursor.position.x = intersects[1].point.x;
                this.cursor.position.y = intersects[1].point.y;
                this.cursor.position.z = intersects[1].point.z;

                console.log(intersects[1].face);
            }
        } else {
            this.cursorShowing = false;
            scene.remove(this.cursor);
            window.removeEventListener('mousedown', this.cursorListener, false);
        }
    };

    this.cursorListener = function(event) {
        x = w(player.cursor.position.x);
        z = w(player.cursor.position.z);
        y = ((player.cursor.position.y + 50) / 100) | 0;
        console.log("placing block at: ", x, y, z, player.cursor.position);
        world.data.set(x, y, z, 1);
        world.render();
    };

    this.getObject = function () {
        return this.yawObject;
    };

    this.getDirection = function(speed) {
        // assumes the camera itself is not rotated
        var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );
        rotation.set(
            this.pitchObject.rotation.x,
            this.yawObject.rotation.y, 0);
        return speed.applyEuler(rotation);
    };

    this.startShot = function() {
       if (this.canShoot) {
            this.isShooting = true;
            this.canShoot = false;
        }
    };

    this.endShot = function() {
        if (!this.isShooting) return;
        // create bullet at end of barrel
        var bulletGeometry = new THREE.SphereGeometry(15);
        var texture = THREE.ImageUtils.loadTexture('textures/metal.jpg');
        texture.anisotropy = renderer.getMaxAnisotropy();
        var material = new THREE.MeshBasicMaterial({ map: texture });
        var bulletMesh = new THREE.Mesh(bulletGeometry, material);
        bulletMesh.position.y = player.getObject().position.y;
        bulletMesh.position.x = player.getObject().position.x;
        bulletMesh.position.z = player.getObject().position.z;
        var bulletEntity = new CANNONS.Entity(bulletMesh,
            player.getDirection(new THREE.Vector3(0, 0, - this.muzzleVelocity)));
        CANNONS.entities.add(bulletEntity);
        scene.add(bulletMesh);
        var sndeffect = new Audio("sounds/fire.ogg");
        sndeffect.play();
        this.isShooting = false;
        this.muzzleVelocity = 0;
        gui.powerBar.style.height = 0 + 'px';
        this.shell = bulletMesh;
    };

    this.update = function() {
        if (this.isShooting) {
            this.muzzleVelocity += 0.5;
            if (this.muzzleVelocity > 100)
                this.muzzleVelocity = 100;
        }
    };

    this.isAlive = function() {
        if (this.health > 0)
            return true;
        else
            return false;
    };
    
    this.shootMode = function() {
    	this.canShoot = true;
    	this.canMove = false;
    };
    
    this.moveMode = function() {
    	this.canShoot = false;
    	this.canMove = true;
    };
};