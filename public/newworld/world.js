import * as THREE from 'three';
import { ChunkMap } from '../world/chunkMap.js';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';

export class World {
    constructor(chunkSize, scene) {
        this.chunkSize = chunkSize;
        this.halfSize = chunkSize / 2;
        this.perlin = new ImprovedNoise();
        this.sampleIndex = Math.random() * 100;
        this.quality = 16;
        this.chunks = new ChunkMap(this.chunkSize, this.getNoise());
        for (let z = -4; z <= 4; z++)
            for (let x = -4; x <= 4; x++)
                this.chunks.newChunkAt(scene, [x, z]);

        // =====================================================================
        // add reference points

        // origin
        const geometry = new THREE.SphereGeometry( 15, 32, 16 );
        const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        const sphere = new THREE.Mesh( geometry, material );
        scene.add( sphere );

        // =====================================================================
        
        // turn on the lights?
        const ambientLight = new THREE.AmbientLight(0xcccccc);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(1, 1, 0.5).normalize();
        scene.add(directionalLight);
    }

    getNoise() {
        return {
            getY: (x, z) => {
                return this.perlin.noise(x / this.quality, z / this.quality, this.sampleIndex) * 4;
            }
        }
    }

    getAtWorld = (pos) => {
        return this.chunks.getBlockAt([parseInt(pos.x / 100),
            parseInt(pos.y / 100),
            parseInt(pos.z / 100)]);
    }
}