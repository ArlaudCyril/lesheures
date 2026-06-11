/* ============================================================
   LES HEURES — son génératif
   Un drone ambiant fabriqué en WebAudio pur (aucun fichier) :
   trois oscillateurs accordés en quinte + un souffle filtré.
   La « luminosité » sonore suit l'heure du récit : claire au
   zénith, sombre la nuit, frémissante à l'aurore.
   Coupé par défaut — le bouton est le geste utilisateur exigé
   par les navigateurs pour démarrer l'audio.
   ============================================================ */

export function initSound() {
  const btn = document.querySelector(".snd");
  if (!btn) return;

  let ctx = null;
  let master = null;
  let lp = null;
  let oscs = [];
  let on = false;
  let updateTimer = null;

  function progressNow() {
    const limit =
      document.documentElement.scrollHeight - window.innerHeight || 1;
    return Math.max(0, Math.min(1, (window.scrollY || 0) / limit));
  }

  /* Luminosité sonore : pic au zénith (p≈1/3), creux la nuit
     (p≈2/3), petite remontée à l'aurore (p≈0.85). */
  function brightness(p) {
    const peak = Math.exp(-Math.pow(p - 0.33, 2) / 0.05);
    const dawn = 0.35 * Math.exp(-Math.pow(p - 0.85, 2) / 0.012);
    return Math.min(1, peak + dawn);
  }

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    lp.Q.value = 0.7;
    lp.connect(master);

    // respiration lente du filtre
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoAmp = ctx.createGain();
    lfoAmp.gain.value = 70;
    lfo.connect(lfoAmp);
    lfoAmp.connect(lp.frequency);
    lfo.start();

    // trois voix : fondamentale, quinte légèrement désaccordée, octave basse
    const defs = [
      { type: "sine", ratio: 1, gain: 0.5, detune: 0 },
      { type: "sine", ratio: 1.5, gain: 0.3, detune: 5 },
      { type: "triangle", ratio: 0.5, gain: 0.32, detune: -3 },
    ];
    oscs = defs.map((d) => {
      const o = ctx.createOscillator();
      o.type = d.type;
      o.frequency.value = 96 * d.ratio;
      o.detune.value = d.detune;
      const g = ctx.createGain();
      g.gain.value = d.gain;
      o.connect(g);
      g.connect(lp);
      o.start();
      return { osc: o, ratio: d.ratio };
    });

    // souffle d'air : bruit bouclé dans un passe-bande aigu, très bas
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.4;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2300;
    bp.Q.value = 0.6;
    const ng = ctx.createGain();
    ng.gain.value = 0.012;
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(master);
    noise.start();
  }

  function applyProgress() {
    if (!ctx) return;
    const b = brightness(progressNow());
    const now = ctx.currentTime;
    const root = 78 + 42 * b; // grave la nuit, plus clair au zénith
    oscs.forEach(({ osc, ratio }) =>
      osc.frequency.setTargetAtTime(root * ratio, now, 1.4)
    );
    lp.frequency.setTargetAtTime(320 + 1250 * b, now, 1.4);
  }

  function setOn(next) {
    on = next;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    document.body.classList.toggle("sound-on", on);

    if (on) {
      if (!ctx) build();
      ctx.resume();
      applyProgress();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.055, ctx.currentTime, 0.6);
      updateTimer = setInterval(applyProgress, 300);
    } else if (ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      clearInterval(updateTimer);
      updateTimer = null;
      setTimeout(() => {
        if (!on && ctx) ctx.suspend(); // batterie : on coupe vraiment
      }, 1600);
    }
  }

  btn.addEventListener("click", () => setOn(!on));

  // onglet caché : silence ; retour : reprise si le son était actif
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !on) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });
}
