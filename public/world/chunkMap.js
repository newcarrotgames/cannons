import { Chunk } from "./chunk.js";

export class ChunkMap {
    constructor(chunkSize, noise) {
        this.chunkSize = chunkSize;
        this.chunks = {};
        this.noise = noise;
    }

    tune = (val, size) => {
        return (val < 0 ? -1 : 1) + val / size >> 0;
    }

    posToHash = (pos) => {
        return `${pos[0] > 0 ? '' : '+'}${pos[0]}${pos[1] > 0 ? '' : '+'}${pos[1]}`;
    }

    worldToChunkPos = (pos) => {
        return [
            tune(pos[0], chunkSize),
            tune(pos[1], chunkSize)
        ];
    }

    getChunkAt = (pos) => {
        const chunkPos = this.worldToChunkPos(pos);
        return this.chunks[this.posToHash(chunkPos)];
    }

    getBlockAt = (pos) => {
        const chunk = this.getChunkAt(pos);
        return chunk.getBlockAt(pos);
    }

    newChunkAt = (scene, pos) => {
        const chunk = new Chunk(this.chunkSize, pos, this.noise);
        this.chunks[this.posToHash(pos)] = chunk;
        chunk.generate(scene);
    }
}