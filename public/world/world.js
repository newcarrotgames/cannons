import * as THREE from 'three';
import { ImprovedNoise } from '/jsm/math/ImprovedNoise.js';
BufferGeometryUtils

const chunkSize = 16, chunkHeight = 64;

export class World {
    constructor(size, scene) {
        this.size = size;
        this.halfSize = size / 2;
        this.data = new Array(this.size * this.size * this.size);
        this.hmap = this.generateHeight(this.size, this.size);
        this.buildTerrain(scene);
    }

    getAtWorld = (pos) => {
        return this.getAt(
            [parseInt(pos.x / 50),
            parseInt(pos.y / 50),
            parseInt(pos.z / 50)]);
    }

    getAt = (pos) => {
        pos[0] += this.halfSize;
        pos[1] += this.halfSize;
        pos[2] += this.halfSize;
        return this.data[pos[0] + pos[2] * this.size + pos[1] * this.size * this.size];
    }

    setAt = (pos, v) => {
        pos[1] += this.halfSize;
        this.data[pos[0] + pos[2] * this.size + pos[1] * this.size * this.size] = v;
    }

    generateHeight = (width, height) => {
        const hmap = [], perlin = new ImprovedNoise(),
            size = width * height, z = Math.random() * 100;
        let quality = 1;
        for (let j = 0; j < 4; j++) {
            if (j === 0) for (let i = 0; i < size; i++) hmap[i] = 0;
            for (let i = 0; i < size; i++) {
                const x = i % width, y = (i / width) | 0;
                hmap[i] += perlin.noise(x / quality, y / quality, z) * quality;
            }
            quality *= 4;
        }
        return hmap;
    }

    getY = (x, z) => {
        return (this.hmap[x + z * this.size] * 0.15) | 0;
    }

    buildTerrain = (scene) => {
        const matrix = new THREE.Matrix4();

        const pxGeometry = new THREE.PlaneGeometry(100, 100);
        pxGeometry.attributes.uv.array[1] = 0.5;
        pxGeometry.attributes.uv.array[3] = 0.5;
        pxGeometry.rotateY(Math.PI / 2);
        pxGeometry.translate(50, 0, 0);

        const nxGeometry = new THREE.PlaneGeometry(100, 100);
        nxGeometry.attributes.uv.array[1] = 0.5;
        nxGeometry.attributes.uv.array[3] = 0.5;
        nxGeometry.rotateY(- Math.PI / 2);
        nxGeometry.translate(- 50, 0, 0);

        const pyGeometry = new THREE.PlaneGeometry(100, 100);
        pyGeometry.attributes.uv.array[5] = 0.5;
        pyGeometry.attributes.uv.array[7] = 0.5;
        pyGeometry.rotateX(- Math.PI / 2);
        pyGeometry.translate(0, 50, 0);

        const pzGeometry = new THREE.PlaneGeometry(100, 100);
        pzGeometry.attributes.uv.array[1] = 0.5;
        pzGeometry.attributes.uv.array[3] = 0.5;
        pzGeometry.translate(0, 0, 50);

        const nzGeometry = new THREE.PlaneGeometry(100, 100);
        nzGeometry.attributes.uv.array[1] = 0.5;
        nzGeometry.attributes.uv.array[3] = 0.5;
        nzGeometry.rotateY(Math.PI);
        nzGeometry.translate(0, 0, - 50);

        const geometries = [];
        for (let z = 0; z < this.size; z++) {
            for (let x = 0; x < this.size; x++) {
                const h = this.getY(x, z);
                for (let y = 0; y < h; y++) {
                    matrix.makeTranslation(
                        x * 100 - this.halfSize * 100,
                        y * 100,
                        z * 100 - this.halfSize * 100
                    );
                    const px = this.getY(x + 1, z);
                    const nx = this.getY(x - 1, z);
                    const pz = this.getY(x, z + 1);
                    const nz = this.getY(x, z - 1);
                    geometries.push(pyGeometry.clone().applyMatrix4(matrix));
                    if ((px !== y && px !== y + 1) || x === 0) {
                        geometries.push(pxGeometry.clone().applyMatrix4(matrix));
                    }
                    if ((nx !== h && nx !== h + 1) || x === this.size - 1) {
                        geometries.push(nxGeometry.clone().applyMatrix4(matrix));
                    }
                    if ((pz !== h && pz !== h + 1) || z === this.size - 1) {
                        geometries.push(pzGeometry.clone().applyMatrix4(matrix));
                    }
                    if ((nz !== h && nz !== h + 1) || z === 0) {
                        geometries.push(nzGeometry.clone().applyMatrix4(matrix));
                    }

                    this.setAt([x, y, z], 1);
                }
            }
        }

        const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
        geometry.computeBoundingSphere();

        const texture = new THREE.TextureLoader().load('textures/atlas.png');
        texture.magFilter = THREE.NearestFilter;

        const mesh = new THREE.Mesh(geometry,
            new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }));
        scene.add(mesh);

        const ambientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(1, 1, 0.5).normalize();
        scene.add(directionalLight);
    }
}