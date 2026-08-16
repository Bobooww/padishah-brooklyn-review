import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
} from 'three';

/**
 * SCENE A — THE HEARTH.
 *
 * Procedural smoke and coal-glow composited over the restaurant's own grill footage.
 * It depicts weather, not evidence: it makes no claim about the room, the menu or the food,
 * which is exactly why it is allowed to be the biggest visual on the page.
 *
 * Two draw calls. No textures, no lights, no post-processing.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;

  uniform float uTime;       // seconds, wrapped
  uniform float uIntensity;  // 0..1, scrubbed by scroll
  uniform vec2  uHearth;     // uv of the coal hot-spot in the photo behind
  uniform vec2  uRes;

  varying vec2 vUv;

  const vec3 EMBER = vec3(1.000, 0.455, 0.118);
  const vec3 GOLD  = vec3(0.812, 0.604, 0.192);   // #CF9A31
  const vec3 ASH   = vec3(0.596, 0.580, 0.557);
  const vec3 IVORY = vec3(0.933, 0.922, 0.898);   // #EEEBE5

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  // Four octaves. Coarse on purpose — tight fbm reads as hi-tech, not as smoke.
  float fbm(vec2 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.02; a *= 0.5; }
    return s;
  }

  void main() {
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 uv = vUv;
    uv.x *= aspect;

    // smoke rises and sways; it never scrolls sideways like a texture
    vec2 p = uv * 2.6;
    p.y -= uTime * 0.045;
    p.x += sin(p.y * 2.2 + uTime * 0.30) * 0.06;

    vec2 q = vec2(fbm(p + 1.7), fbm(p + vec2(5.2, 1.3)));

    // abr / ikat bleed: a faint vertical dye-bleed in the silhouette
    q.x += 0.14 * sin(uv.y * 34.0 + fbm(p * 0.6) * 3.0);

    float d = fbm(p + q * 0.9);

    vec2 hearth = vec2(uHearth.x * aspect, uHearth.y);
    float r = distance(uv, hearth);
    float bed = exp(-r * r * 3.4);
    float rise = smoothstep(0.05, 0.95, 1.0 - uv.y);

    float smoke = smoothstep(0.42, 0.86, d) * mix(0.35, 1.0, rise);

    // coals breathe: one slow sine, one flutter — never a loop you can count
    float breath = 0.74 + 0.18 * sin(uTime * 0.62) + 0.08 * sin(uTime * 2.31 + d * 6.0);
    float coal = bed * breath;

    vec3 col = mix(ASH, IVORY, smoke * 0.35);
    col = mix(col, GOLD, coal * 0.55);
    col = mix(col, EMBER, coal * coal * 0.45);

    float a = (smoke * 0.30 + coal * 0.42) * uIntensity;

    // cheap ordered dither: 8-bit alpha ramps band badly on OLED
    a += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`;

const EMBER_VERT = /* glsl */ `
  attribute vec3 aSeed;   // x: lane, y: speed, z: phase
  uniform float uTime;
  uniform float uPR;
  varying float vLife;

  void main() {
    float t = fract(uTime * aSeed.y + aSeed.z);
    vLife = t;
    vec3 p = position;
    p.y = mix(-0.62, 0.92, t);
    p.x += sin(t * 4.71 + aSeed.z * 6.283) * 0.055 * (0.35 + aSeed.x);
    gl_PointSize = (1.4 + 4.6 * (1.0 - t)) * uPR;
    gl_Position = vec4(p.xy, 0.0, 1.0);
  }
`;

const EMBER_FRAG = /* glsl */ `
  precision mediump float;
  uniform float uIntensity;
  varying float vLife;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float m = smoothstep(0.5, 0.06, length(c));
    float a = sin(vLife * 3.14159) * m * uIntensity;
    vec3 col = mix(vec3(1.0, 0.52, 0.16), vec3(0.81, 0.60, 0.19), vLife);
    gl_FragColor = vec4(col, a * 0.85);
  }
`;

export type Hearth = ReturnType<typeof createHearth>;

export function createHearth(emberCount: number, pixelRatio: number) {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const smokeMat = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uHearth: { value: new Vector2(0.5, 0.28) },
      uRes: { value: new Vector2(1, 1) },
    },
  });
  scene.add(new Mesh(new PlaneGeometry(2, 2), smokeMat));

  // Embers: one buffer, built once. No JS runs per particle, ever.
  const seeds = new Float32Array(emberCount * 3);
  const positions = new Float32Array(emberCount * 3);
  for (let i = 0; i < emberCount; i++) {
    seeds[i * 3] = Math.random();
    seeds[i * 3 + 1] = 0.03 + Math.random() * 0.06;
    seeds[i * 3 + 2] = Math.random();
    positions[i * 3] = (Math.random() - 0.5) * 1.7;
  }
  const emberGeo = new BufferGeometry();
  emberGeo.setAttribute('position', new BufferAttribute(positions, 3));
  emberGeo.setAttribute('aSeed', new BufferAttribute(seeds, 3));

  const emberMat = new ShaderMaterial({
    vertexShader: EMBER_VERT,
    fragmentShader: EMBER_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uPR: { value: pixelRatio },
    },
  });
  scene.add(new Points(emberGeo, emberMat));

  return {
    scene,
    camera,
    setTime(t: number) {
      smokeMat.uniforms.uTime.value = t;
      emberMat.uniforms.uTime.value = t;
    },
    setIntensity(v: number) {
      smokeMat.uniforms.uIntensity.value = v;
      emberMat.uniforms.uIntensity.value = v;
    },
    setHearth(x: number, y: number) {
      (smokeMat.uniforms.uHearth.value as Vector2).set(x, y);
    },
    setSize(w: number, h: number) {
      (smokeMat.uniforms.uRes.value as Vector2).set(w, h);
    },
    dispose() {
      smokeMat.dispose();
      emberMat.dispose();
      emberGeo.dispose();
      scene.clear();
    },
  };
}
