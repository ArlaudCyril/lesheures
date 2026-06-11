/* ============================================================
   LES HEURES — Ciel vivant Three.js (branche exp/ciel-vivant)
   Le fond n'est plus un champ de couleur décoratif : c'est un
   ciel peint dont le SOLEIL parcourt son arc au fil du récit.
   - dégradé de ciel art-directed (couleurs des arrêts du récit)
   - deux couches de nuages fbm éclairées directionnellement
     (liseré lumineux face au soleil)
   - rayons crépusculaires aux heures basses
   - étoiles scintillantes et lune discrète la nuit
   initBackground(canvas) renvoie une API : blendSky /
   setSkyImmediate (+ compat setColors/blendColors), consommée
   par le moteur de récit (story.js).
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
  uniform vec3  uColorA;   // ciel (base)
  uniform vec3  uColorB;   // lumière du soleil
  uniform vec3  uColorC;   // accent (ombres)
  uniform float uGrain;
  uniform float uIntro;
  uniform float uDebug;
  uniform float uSunElev;  // élévation du soleil : -1 (minuit) -> 1 (zénith)
  uniform float uSunAz;    // azimut écran : 0 (gauche) -> 1 (droite)
  uniform float uStars;    // densité d'étoiles : 0 -> 1

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
    for (int i = 0; i < 5; i++){
      v += amp * noise(p);
      p = rot * p * 2.0;
      amp *= 0.5;
    }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * uAspect, uv.y);
    vec2 m = uMouse * 0.5;

    // ---- soleil : position écran depuis élévation + azimut ----
    // à pleine élévation le disque SORT du cadre par le haut : le
    // plein jour est une inondation de lumière, pas un spot derrière
    // le texte ; le disque n'habite l'écran qu'aux heures basses
    vec2 sun = vec2(uSunAz * uAspect + m.x * 0.02, 0.14 + uSunElev * 1.05 + m.y * 0.015);
    float sunDist = distance(p, sun);
    float dayUp = smoothstep(-0.25, 0.45, uSunElev);   // jour levé
    float golden = smoothstep(0.55, 0.06, abs(uSunElev - 0.12)); // heures dorées

    // ---- ciel : dégradé vertical art-directed ----
    float horiz = pow(1.0 - uv.y, 1.45);
    vec3 sky = mix(uColorA * 0.92, mix(uColorA, uColorB, 0.7), horiz);
    // diffusion chaude autour du soleil
    sky += uColorB * exp(-sunDist * 2.1) * (0.22 + 0.3 * golden);

    // ---- nuages : deux couches fbm, dérive du vent + souris ----
    vec2 wind = vec2(uTime * 0.014, uTime * 0.004) + m * 0.06 + uMouseV * 0.25;
    vec2 q1 = p * 1.35 + wind;
    vec2 q2 = p * 2.7 - wind * 1.6 + vec2(4.7, 9.1);
    float w1 = fbm(q1 + vec2(3.1, 7.7));
    float d1 = fbm(q1 + w1 * 0.9);
    float d2 = fbm(q2 + fbm(q2 + vec2(8.2, 1.3)) * 0.7);
    float field = d1 * 0.62 + d2 * 0.38 + horiz * 0.06;
    float dens = smoothstep(0.42, 0.8, field);
    // plein midi : ciel plus dégagé
    dens *= 1.0 - smoothstep(0.5, 0.95, uSunElev) * 0.35;

    // éclairage directionnel : la densité ré-échantillonnée vers le
    // soleil donne le liseré lumineux des bords qui lui font face
    vec2 toSun = (sun - p) / max(sunDist, 1e-3);
    float dlit = fbm(q1 + toSun * 0.16 + w1 * 0.9);
    float rim = clamp((d1 - dlit) * 2.6, 0.0, 1.0);

    vec3 cloudShadow = mix(uColorA * 0.6, uColorC, 0.4);
    vec3 cloudLit = mix(uColorB, vec3(1.0), 0.12);
    vec3 cloud = mix(cloudShadow, cloudLit, clamp(rim * dayUp + 0.16 * dayUp, 0.0, 1.0));

    // ---- rayons crépusculaires (marche courte vers le soleil) ----
    // coût GPU encouru seulement aux heures dorées (golden ~ uniforme)
    float ray = 0.0;
    if (golden > 0.01) {
      vec2 stepv = (sun - p) / 7.0;
      vec2 rp = p;
      for (int i = 0; i < 6; i++) {
        rp += stepv;
        ray += 1.0 - smoothstep(0.35, 0.8, fbm(rp * 1.35 + wind));
      }
      ray = pow(ray / 6.0, 2.0) * exp(-sunDist * 1.7) * golden * 0.45;
    }

    // ---- étoiles (la nuit, au-dessus des nuages fins) ----
    float star = 0.0;
    if (uStars > 0.01) {
      vec2 sg = p * 42.0;
      vec2 cell = floor(sg);
      float h = hash(cell * 1.13);
      vec2 off = (vec2(hash(cell), hash(cell + 19.7)) - 0.5) * 0.7;
      float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + h * 2.4) + h * 43.0);
      star = smoothstep(0.085, 0.0, length(fract(sg) - 0.5 - off))
           * step(0.78, h) * twinkle
           * smoothstep(0.15, 0.75, uv.y);
    }

    // ---- composition ----
    vec3 col = sky;
    // disque + halo (soleil le jour, lueur de lune la nuit)
    float disc = smoothstep(0.05, 0.038, sunDist);
    float glow = exp(-sunDist * 4.6);
    float celest = clamp(uSunElev * 2.0 + 0.7, 0.12, 1.0);
    col += (disc * 1.15 + glow * 0.5) * mix(uColorB, vec3(1.0), 0.35) * celest;
    col += ray * uColorB;
    col = mix(col, cloud, dens * 0.92);
    col += star * uStars * (1.0 - dens) * vec3(0.93, 0.96, 1.0);
    // accent dans les creux d'ombre
    col = mix(col, uColorC, (1.0 - rim) * dens * 0.1);

    // vignette
    float vig = smoothstep(1.35, 0.15, length((vUv - 0.5) * vec2(uAspect, 1.0)));
    col *= 0.8 + 0.2 * vig;

    // mode making-of : densité nuageuse nue + liseré + grille
    if (uDebug > 0.001) {
      vec3 dbg = vec3(dens);
      dbg.r += rim * 0.45;
      dbg.b += star * 0.6 + (1.0 - dens) * 0.08;
      vec2 cellg = fract(p * 6.0);
      dbg += (step(0.985, cellg.x) + step(0.985, cellg.y)) * 0.08;
      col = mix(col, clamp(dbg, 0.0, 1.0), uDebug);
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
    uSunElev: { value: 0.2 },
    uSunAz: { value: 0.3 },
    uStars: { value: 0 },
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

  const lerpN = (cur, target, amt) => cur + (target - cur) * amt;

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
    // ---- ciel vivant : couleurs + soleil + étoiles d'un coup ----
    blendSky(stop, amt) {
      this.blendColors(stop.a, stop.b, stop.c, amt);
      uniforms.uSunElev.value = lerpN(uniforms.uSunElev.value, stop.elev, amt);
      uniforms.uSunAz.value = lerpN(uniforms.uSunAz.value, stop.az, amt);
      uniforms.uStars.value = lerpN(uniforms.uStars.value, stop.stars, amt);
    },
    setSkyImmediate(stop) {
      this.setColorsImmediate(stop.a, stop.b, stop.c);
      uniforms.uSunElev.value = stop.elev;
      uniforms.uSunAz.value = stop.az;
      uniforms.uStars.value = stop.stars;
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
        sun: {
          elev: uniforms.uSunElev.value,
          az: uniforms.uSunAz.value,
          stars: uniforms.uStars.value,
        },
        dpr: renderer.getPixelRatio(),
        width: renderer.domElement.width,
        height: renderer.domElement.height,
      };
    },
  };
}
