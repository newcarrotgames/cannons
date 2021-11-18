// (a/b>>0)

function tune(val, size) {
    return (val < 0 ? -1 : 1) + val / size >> 0;
}

const chunkSize = 16, chunkHeight = 128;

const [x,y,z] = [
    parseInt(-1), 
    parseInt(1), 
    parseInt(1)
];
console.log(x, y, z);

let chunkPos = [
    tune(x, chunkSize),
    tune(z, chunkSize)
];
console.log('chunkPos', chunkPos);

let blockPos = [
	(x % chunkSize - chunkSize) % chunkSize,
    (y % chunkSize - chunkSize) % chunkSize,
    (z % chunkSize - chunkSize) % chunkSize
];
console.log('blockPos', blockPos);

let blockIndex = 
  Math.abs(blockPos[0] + 
  blockPos[1] * chunkSize + 
  blockPos[2] * chunkSize * chunkSize);
console.log('blockIndex', blockIndex);