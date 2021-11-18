import * as THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import Stats from 'three/examples/jsm/libs/stats.module';
import { World } from './world.js';

const X_DIR = 0, Y_DIR = 1, Z_DIR = 2, CHUNK_SIZE = [16, 64, 16];

class Service {
    constructor(scene, camera) {
        this.clock = new THREE.Clock();
        this.scene = scene;
        this.camera = camera;
        this.renderer = new THREE.WebGLRenderer();
        this.controls = new FlyControls(camera, this.renderer.domElement);
        this.controls.movementSpeed = 400;
        this.controls.rollSpeed = 1;
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        window.addEventListener(
            'resize',
            () => {
                this.camera.aspect = window.innerWidth / window.innerHeight
                this.camera.updateProjectionMatrix()
                this.renderer.setSize(window.innerWidth, window.innerHeight)
                this.render()
            },
            false
        );

        this.entities = [];
    }

    render = () => {
        this.renderer.render(this.scene, this.camera)
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.controls.update(this.clock.getDelta());
        this.render();
        this.stats.update();
        this.entities.forEach((e) => {
            this.physics(e);
            e.position.x += e.dir[X_DIR];
            e.position.y += e.dir[Y_DIR];
            e.position.z += e.dir[Z_DIR];
            this.log([e.position.x, e.position.y, e.position.z]);
        });
    }

    register = (callback) => {
        const result = callback(this.scene);
        Promise.resolve(result).then((entity) => {
            if (entity) {
                this.addPhysics(entity);
                this.entities.push(entity);
            }
        });
    }

    registerWorld = (callback) => {
        this.world = callback(this.scene);
    }

    addPhysics = (e) => {
        e.dir = [0, 5, 0];
    }

    physics = (e) => {
        const v = this.world.getAtWorld(e.position);
        if (!v)
            e.dir[Y_DIR] -= 0.1;
        else
            e.dir[Y_DIR] = 0;
    }

    start = () => {
        this.animate();
    }

    move = (dir) => {
        console.log('move', dir);
        this.entities[0].dir = dir;
    };

    log = (m) => {
        document.getElementById('debug').innerHTML = m;
    }
}

window.onload = () => {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 9999999);
    camera.position.x = -50;
    camera.position.y = 150;
    camera.position.z = 3000;

    const s = new Service(new THREE.Scene(), camera);

    // skybox
    s.register((scene) => {
        scene.background = new THREE.CubeTextureLoader()
            .setPath('textures/skybox/')
            .load([
                'skybox_px.jpg',
                'skybox_nx.jpg',
                'skybox_py.jpg',
                'skybox_ny.jpg',
                'skybox_pz.jpg',
                'skybox_nz.jpg'
            ]);
    });

    // build world
    s.registerWorld((scene) => {
        return new World(CHUNK_SIZE, scene);
    });

    // lock pointer
    setTimeout(() => document.body.requestPointerLock(), 5000);

    s.start();

    // window.addEventListener('keydown', (e) => {
    //     switch (e.key) {
    //         case 'w':
    //             s.move([0, 0, 1]);
    //             break;
    //         case 's':
    //             s.move([0, 0, -1]);
    //             break;
    //         case 'a':
    //             s.move([-1, 0, 0]);
    //             break;
    //         case 'd':
    //             s.move([1, 0, 0]);
    //             break;
    //     }
    // });
};