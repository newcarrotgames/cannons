import * as THREE from 'three';
import { ChunkMap } from '../world/chunkMap.js';

export class World {
    constructor(chunkSize, scene) {
        this.chunkSize = chunkSize;
        this.halfSize = chunkSize / 2;
        this.chunks = new ChunkMap(this.chunkSize, { getY: () => this.chunkSize[1] / 2});
        for (let z = 1; z < 4; z++) {
            for (let x = 1; x < 4; x++) {
                this.chunks.newChunkAt(scene, [x, z]);
            }
        }
        
        // turn on the lights?
        const ambientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(1, 1, 0.5).normalize();
        scene.add(directionalLight);
    }

    getAtWorld = (pos) => {
        return this.getAt(
            [parseInt(pos.x / 100),
            parseInt(pos.y / 100),
            parseInt(pos.z / 100)]);
    }
}