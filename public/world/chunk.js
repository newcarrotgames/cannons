import * as THREE from 'three';
import * as BufferGeometryUtils from '/jsm/utils/BufferGeometryUtils.js';

export class Chunk {
    data = [];

    constructor(size, pos, noise) {
        this.size = size;
        this.halfSize = size[0] / 2;
        this.pos = pos;
        this.noise = noise;
    }

    getBlockIndex = (pos) => {
        let blockPos = [
            (pos[0] % this.size - this.size) % this.size,
            (pos[1] % this.size - this.size) % this.size,
            (pos[2] % this.size - this.size) % this.size
        ];
        return Math.abs(blockPos[0] +
            blockPos[1] * this.size +
            blockPos[2] * this.size * this.size);
    }

    getBlockAt(pos) {
        return this.data[this.getBlockIndex(pos)];
    }

    setBlockAt(pos, val) {
        this.data[this.getBlockIndex(pos)] = val;
    }

    generate(scene) {
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
        for (let z = 0; z < this.size[2]; z++) {
            for (let x = 0; x < this.size[0]; x++) {
                const h = this.noise.getY(x, z);
                for (let y = 0; y < h; y++) {
                    matrix.makeTranslation(
                        x * 100 - this.halfSize * 100,
                        y * 100,
                        z * 100 - this.halfSize * 100
                    );
                    const px = this.noise.getY(x + 1, z);
                    const nx = this.noise.getY(x - 1, z);
                    const pz = this.noise.getY(x, z + 1);
                    const nz = this.noise.getY(x, z - 1);
                    geometries.push(pyGeometry.clone().applyMatrix4(matrix));
                    if ((px !== y && px !== y + 1) || x === 0) {
                        geometries.push(pxGeometry.clone().applyMatrix4(matrix));
                    }
                    if ((nx !== h && nx !== h + 1) || x === this.size[0] - 1) {
                        geometries.push(nxGeometry.clone().applyMatrix4(matrix));
                    }
                    if ((pz !== h && pz !== h + 1) || z === this.size[2] - 1) {
                        geometries.push(pzGeometry.clone().applyMatrix4(matrix));
                    }
                    if ((nz !== h && nz !== h + 1) || z === 0) {
                        geometries.push(nzGeometry.clone().applyMatrix4(matrix));
                    }

                    this.setBlockAt([x, y, z], 1);
                }
            }
        }

        const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
        // translate to chunk world pos
        const cwpMatrix = new THREE.Matrix4();
        cwpMatrix.makeTranslation(
            this.size[0] * 100 * this.pos[0],
            0,
            this.size[2] * 100 * this.pos[1]
        );
        geometry.applyMatrix4(cwpMatrix)
        geometry.computeBoundingSphere();
        const texture = new THREE.TextureLoader().load('textures/atlas.png');
        texture.magFilter = THREE.NearestFilter;
        const mesh = new THREE.Mesh(geometry,
            new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide }));
        scene.add(mesh);
    }
}