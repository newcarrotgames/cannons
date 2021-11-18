import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { World } from '/newworld/world.js';

const X_DIR = 0, Y_DIR = 1, Z_DIR = 2, WORLD_SIZE = 256;

class Service {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = new THREE.WebGLRenderer();
        this.controls = new OrbitControls(camera, this.renderer.domElement);
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
        this.controls.update();
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
    // lock pointer
    document.body.requestPointerLock();
    
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

    // build tank
    s.register((scene) => {
        const loader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load("models/tank1/tank1.gltf",
                function (gltf) {
                    scene.add(gltf.scene);
                    gltf.scene.position.y = 250;
                    resolve(gltf.scene);
                },
                function (xhr) {
                    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
                },
                function (error) {
                    console.error("An error happened: ", error);
                    reject(error);
                }
            );
        });
    });

    // build world
    s.registerWorld((scene) => {
        return new World(WORLD_SIZE, scene);
    });

    s.start();

    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'w':
                s.move([0, 0, 1]);
                break;
            case 's':
                s.move([0, 0, -1]);
                break;
            case 'a':
                s.move([-1, 0, 0]);
                break;
            case 'd':
                s.move([1, 0, 0]);
                break;
        }
    });

    // const sound = new Audio('sounds/engine.ogg');
    // sound.loop = true;
    // let playing = false;
    // window.addEventListener('keydown', () => {
    //     playing = !playing;
    //     if (playing) {
    //         sound.pause();
    //         sound.currentTime = 0;
    //     }
    //     else 
    //         sound.play();
    // });
};