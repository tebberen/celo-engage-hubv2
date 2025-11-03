// Shim to expose js-sha3 named exports when loaded from an ESM CDN.
import sha3Module from 'https://cdn.jsdelivr.net/npm/js-sha3@0.8.0/+esm';

const resolvedModule = sha3Module?.default ? sha3Module.default : sha3Module;

const exportedKeccak256 = resolvedModule.keccak_256 || resolvedModule.keccak256;

if (typeof exportedKeccak256 !== 'function') {
  throw new Error('js-sha3 keccak_256 export could not be resolved');
}

export const keccak_256 = exportedKeccak256;
export const keccak256 = resolvedModule.keccak256 || exportedKeccak256;
export default resolvedModule;
