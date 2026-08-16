import {
  CanvasTexture,
  ExtrudeGeometry,
  Mesh,
  MeshMatcapMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  Shape,
  ShaderMaterial,
  Vector3,
} from 'three';
import { tracePath, traceHole } from './cartouche';

/**
 * SCENE B — THE PASSAGE.
 *
 * The restaurant's own crowned cartouche, extruded in gold, that the page travels through
 * as the field turns from ink to ivory: the fire section ends, the room begins.
 *
 * Matcap, not PBR — the light is painted into a 128px texture (ivory ceiling bounce, one
 * chandelier specular, gold body, warm floor). Painted gold reads illustrative and warm;
 * physically-based gold reads like a casino. It is also four times cheaper.
 */

/** The actual light in the actual room, painted once into a texture. */
function goldMatcap(size = 128): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;

  g.fillStyle = '#2B0504'; // oxblood rim — the legacy accent earns its one appearance here
  g.beginPath();
  g.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  g.fill();

  const grad = g.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#FFF3D6'); // ivory ceiling bounce
  grad.addColorStop(0.3, '#EBB755'); // lit gold
  grad.addColorStop(0.55, '#CF9A31'); // padishah gold — this is what faces the camera
  grad.addColorStop(0.8, '#7A4F16'); // shadow side
  grad.addColorStop(1, '#2B0504'); // oxblood floor
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);

  const spec = g.createRadialGradient(size * 0.34, size * 0.22, 0, size * 0.34, size * 0.22, size * 0.3);
  spec.addColorStop(0, 'rgba(255,250,236,.95)');
  spec.addColorStop(1, 'rgba(255,250,236,0)');
  g.fillStyle = spec;
  g.fillRect(0, 0, size, size);

  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

const BACKDROP_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }
`;

const BACKDROP_FRAG = /* glsl */ `
  precision mediump float;
  uniform float uProgress;   // 0 = the frame in the dark, 1 = the page has come through
  varying vec2 vUv;
  const vec3 INK  = vec3(0.024, 0.020, 0.020);
  const vec3 WARM = vec3(0.223, 0.140, 0.055);   // lit ink, the colour of a room behind a door
  const vec3 GOLD = vec3(0.812, 0.604, 0.192);

  void main() {
    float r = distance(vUv, vec2(0.5, 0.52));
    float aperture = smoothstep(0.62, 0.04, r);

    // The light behind the frame builds slowly and only really opens at the end.
    float open = smoothstep(0.62, 1.0, uProgress);

    vec3 col = mix(INK, WARM, aperture * (0.35 + uProgress * 0.4));
    col = mix(col, GOLD, aperture * open * 0.5);

    // Fade the whole backdrop out at the section edges: the canvas is fixed to the
    // viewport, so it must never paint over the ivory sections either side.
    float edgeIn  = smoothstep(0.0, 0.16, uProgress);
    float edgeOut = smoothstep(1.0, 0.84, uProgress);
    gl_FragColor = vec4(col, min(edgeIn, edgeOut) * 0.92);
  }
`;

export type Passage = ReturnType<typeof createPassage>;

export function createPassage() {
  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 12);
  camera.position.set(0, 0, 2.4);

  const backdropMat = new ShaderMaterial({
    vertexShader: BACKDROP_VERT,
    fragmentShader: BACKDROP_FRAG,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: { uProgress: { value: 0 } },
  });
  scene.add(new Mesh(new PlaneGeometry(2, 2), backdropMat));

  // The frame only. No letterforms ever enter this geometry.
  const shape = new Shape();
  tracePath(shape);
  const hole = new Shape();
  traceHole(hole);
  shape.holes.push(hole);

  const geo = new ExtrudeGeometry(shape, {
    depth: 0.055,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 3,
  });
  geo.center();

  const matcap = goldMatcap();
  const mesh = new Mesh(geo, new MeshMatcapMaterial({ matcap }));
  mesh.scale.setScalar(1.9);
  scene.add(mesh);

  const pointer = new Vector3();

  return {
    scene,
    camera,
    /** 0 → the cartouche sits in the dark; 1 → the page has come through it. */
    setProgress(p: number) {
      backdropMat.uniforms.uProgress.value = p;
      // travel through the aperture: the frame grows past the camera and tips away
      camera.position.z = 2.4 - p * 1.75;
      mesh.rotation.x = (0.22 - p * 0.34) * 0.6;
      mesh.rotation.z = (p - 0.5) * 0.06;
      mesh.scale.setScalar(1.9 + p * 1.5);
    },
    setPointer(x: number, y: number) {
      pointer.set(x, y, 0);
      mesh.rotation.y = pointer.x * 0.12;
      mesh.rotation.x += pointer.y * 0.05;
    },
    setSize(w: number, h: number) {
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    },
    dispose() {
      geo.dispose();
      matcap.dispose();
      backdropMat.dispose();
      (mesh.material as MeshMatcapMaterial).dispose();
      scene.clear();
    },
  };
}
