/* ============================================================
   LES HEURES — Fond peint Three.js
   Champ de peinture liquide (domain-warped fbm) dont les
   couleurs sont pilotées par le scroll et déformées par le curseur.
   initBackground(canvas) renvoie une API : setColors / blendColors /
   setColorsImmediate, consommée par le moteur de récit (story.js).
   ============================================================ */
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  Vector2,
  Color,
  ShaderMaterial,
  Mesh,
  PlaneGeometry,
  Clock,
} from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform vec2  uMouseV;
  uniform float uAspect;
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;
  uniform float uGrain;
  uniform float uIntro;
  uniform float uDebug;

  float hash(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0;
    float amp = 0.55;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 6; i++){
      v += amp * noise(p);
      p = rot * p * 2.0;
      amp *= 0.5;
    }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    uv.x *= uAspect;
    vec2 p = uv * 1.7;

    float t = uTime * 0.045;
    vec2 m = uMouse * vec2(uAspect, 1.0);

    // attraction douce vers le curseur + traînée de vitesse
    float md = distance(uv, m * 0.5 + 0.5 * vec2(uAspect, 1.0) * 0.0);
    vec2 toMouse = (m - (uv - 0.5 * vec2(uAspect,1.0)));
    float pull = exp(-dot(toMouse, toMouse) * 1.4);

    // domain warping
    vec2 q = vec2(
      fbm(p + t + m * 0.55 + uMouseV * 1.2),
      fbm(p + vec2(5.2, 1.3) - t * 0.9)
    );
    vec2 r = vec2(
      fbm(p + 1.8 * q + vec2(1.7, 9.2) + m * 0.7 * pull),
      fbm(p + 1.8 * q + vec2(8.3, 2.8) - t * 1.1)
    );
    float f = fbm(p + 2.2 * r + uMouseV * 0.8);

    // mélange des couleurs façon coups de pinceau
    float blend = clamp(f * f * 1.7, 0.0, 1.0);
    vec3 col = mix(uColorA, uColorB, blend);

    // veine d'accent qui serpente
    float vein = clamp(length(r) * 0.7, 0.0, 1.0);
    col = mix(col, uColorC, smoothstep(0.25, 0.95, vein) * 0.6);

    // halo lumineux suivant le curseur
    col += uColorB * pull * 0.18;

    // vignette
    float vig = smoothstep(1.35, 0.15, length((vUv - 0.5) * vec2(uAspect, 1.0)));
    col *= 0.78 + 0.22 * vig;

    // mode making-of : le champ de bruit nu qui pilote tout,
    // teinté par les vecteurs de warp, avec une grille d'échelle
    if (uDebug > 0.001) {
      vec3 field = vec3(pow(f, 1.5));
      field += vec3(0.22, 0.05, -0.04) * (q.x - 0.5);
      field += vec3(-0.04, 0.07, 0.26) * (r.y - 0.5);
      vec2 cell = fract(uv * 6.0);
      float grid = (step(0.985, cell.x) + step(0.985, cell.y)) * 0.08;
      vec3 dbg = clamp(field + grid, 0.0, 1.0);
      col = mix(col, dbg, uDebug);
    }

    // grain de film
    float g = hash(vUv * (uTime * 0.6 + 1.0));
    col += (g - 0.5) * uGrain;

    // fondu d'intro
    col *= uIntro;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function initBackground(canvas) {
  if (!canvas) {
    console.warn("[HeuresBG] canvas manquant");
    return null;
  }

  // reduced-motion : la peinture dérive à peine (les couleurs
  // continuent de suivre le scroll, mais sans mouvement propre)
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const timeScale = prefersReduced ? 0.12 : 1;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 1);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new Vector2(0, 0) },
    uMouseV: { value: new Vector2(0, 0) },
    uAspect: { value: 1 },
    uColorA: { value: new Color("#16111c") },
    uColorB: { value: new Color("#5a2733") },
    uColorC: { value: new Color("#0c0a12") },
    uGrain: { value: 0.06 },
    uIntro: { value: 0 }, // 0 -> 1 fade-in du fond au chargement
    uDebug: { value: 0 }, // 0 -> 1 vue déconstruite (making-of)
  };

  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), material);
  scene.add(quad);

  // ---- redimensionnement ----
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    uniforms.uAspect.value = w / h;
  }
  resize();
  window.addEventListener("resize", resize);

  // ---- souris (lissée) ----
  const target = new Vector2(0, 0);
  const current = new Vector2(0, 0);
  const prev = new Vector2(0, 0);

  function onMove(clientX, clientY) {
    target.x = (clientX / window.innerWidth) * 2 - 1;
    target.y = -((clientY / window.innerHeight) * 2 - 1);
  }
  window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  // ---- boucle de rendu ----
  const clock = new Clock();
  let debugTarget = 0;
  let fps = 60;
  function render() {
    const dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += dt * timeScale;
    if (dt > 0) fps += (1 / dt - fps) * 0.05; // moyenne glissante

    // lissage souris
    current.x += (target.x - current.x) * 0.06;
    current.y += (target.y - current.y) * 0.06;
    uniforms.uMouse.value.set(current.x, current.y);

    // vitesse de la souris pour la traînée
    const vx = (current.x - prev.x) * 4.0;
    const vy = (current.y - prev.y) * 4.0;
    uniforms.uMouseV.value.x += (vx - uniforms.uMouseV.value.x) * 0.1;
    uniforms.uMouseV.value.y += (vy - uniforms.uMouseV.value.y) * 0.1;
    prev.copy(current);

    // fondu doux vers/depuis la vue making-of
    uniforms.uDebug.value += (debugTarget - uniforms.uDebug.value) * 0.06;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  // ---- fondu d'intro ----
  let introStart = null;
  function intro(ts) {
    if (introStart === null) introStart = ts;
    const e = Math.min((ts - introStart) / 1800, 1);
    uniforms.uIntro.value = e * e * (3 - 2 * e); // smoothstep
    if (e < 1) requestAnimationFrame(intro);
  }
  requestAnimationFrame(intro);

  // ---- API publique ----
  const _a = new Color();
  const _b = new Color();
  const _c = new Color();

  return {
    setColors(a, b, c) {
      _a.set(a);
      _b.set(b);
      _c.set(c);
      uniforms.uColorA.value.lerp(_a, 1);
      uniforms.uColorB.value.lerp(_b, 1);
      uniforms.uColorC.value.lerp(_c, 1);
    },
    // mélange progressif (appelé chaque frame depuis le scroll)
    blendColors(a, b, c, amt) {
      _a.set(a);
      _b.set(b);
      _c.set(c);
      uniforms.uColorA.value.lerp(_a, amt);
      uniforms.uColorB.value.lerp(_b, amt);
      uniforms.uColorC.value.lerp(_c, amt);
    },
    setColorsImmediate(a, b, c) {
      uniforms.uColorA.value.set(a);
      uniforms.uColorB.value.set(b);
      uniforms.uColorC.value.set(c);
    },
    // ---- making-of ----
    setDebug(on) {
      debugTarget = on ? 1 : 0;
    },
    getInfo() {
      return {
        fps: Math.round(fps),
        time: uniforms.uTime.value,
        colors: [
          "#" + uniforms.uColorA.value.getHexString(),
          "#" + uniforms.uColorB.value.getHexString(),
          "#" + uniforms.uColorC.value.getHexString(),
        ],
        dpr: renderer.getPixelRatio(),
        width: renderer.domElement.width,
        height: renderer.domElement.height,
      };
    },
  };
}
