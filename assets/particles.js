(() => {
  const canvas = document.getElementById("particle-field");
  const context = canvas.getContext("2d");
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const turn = Math.PI * 2;
  let frameId = 0;
  let lastDraw = null;
  let elapsed = 0;
  let width, height, pixelScale, middle, ribbonHeight, density;

  const layers = [
    { count: 2900, color: "#dfe4ec49", radius: 1.17, spread: 1.55 },
    { count: 2650, color: "#e7ebf17d", radius: 1.04, spread: .72 },
    { count: 1250, color: "#f6f7fbbe", radius: .87, spread: 1.25 },
    { count: 380, color: "#fffaf4e6", radius: 1.03, spread: 1.1 }
  ];

  for (const layer of layers) {
    layer.particles = Array.from({ length: layer.count }, () => ({
      position: Math.random(),
      speed: .009 + Math.random() * .012,
      angle: Math.random() * turn,
      shell: .36 + Math.sqrt(Math.random()) * .64,
      drift: Math.random() - .5,
      scatter: Math.random() + Math.random() - 1,
      size: .32 + Math.random() * 1.03
    }));
  }

  function paint() {
    context.clearRect(0, 0, width, height);
    const sway = Math.sin(elapsed * .44);

    for (const layer of layers) {
      context.beginPath();
      const visibleCount = Math.round(layer.particles.length * density);
      for (let i = 0; i < visibleCount; i += 1) {
        const particle = layer.particles[i];
        const u = (particle.position + elapsed * particle.speed) % 1;
        const phase = turn * (u * 1.24 - .11) + .24 * sway;
        const roll = particle.angle + u * 5 - elapsed * .39;
        const spread = ribbonHeight * (.09 + .055 * Math.sin(Math.PI * u));
        const x = width * (.026 + .948 * u + particle.drift * .038)
          + Math.cos(roll) * spread * .18 * particle.shell;
        const y = middle - ribbonHeight * (.29 * Math.sin(phase) + .035 * Math.sin(2 * phase))
          + spread * (Math.sin(roll) * particle.shell + particle.scatter * layer.spread);
        const taper = Math.min(1, u * 18, (1 - u) * 16);
        const radius = Math.max(.01, layer.radius * particle.size * taper);

        context.moveTo(x + radius, y);
        context.arc(x, y, radius, 0, turn);
      }
      context.fillStyle = layer.color;
      context.fill();
    }
  }

  function resize() {
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    const nextScale = Math.min(window.devicePixelRatio || 1, 1.6);
    if (nextWidth === width && nextHeight === height && nextScale === pixelScale) return;

    width = nextWidth;
    height = nextHeight;
    pixelScale = nextScale;
    canvas.width = Math.round(width * pixelScale);
    canvas.height = Math.round(height * pixelScale);
    context.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
    const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
    const ribbonSpan = Math.min(13 * rootFontSize, Math.max(8 * rootFontSize, window.innerWidth * .23));
    // Anchor the ribbon to the viewport so shorter page headers cannot pull it up.
    middle = Math.min(height * .68, 5 * rootFontSize + ribbonSpan * 2.5);
    ribbonHeight = Math.min(height * .74, width * .56, ribbonSpan * 2.35);
    density = Math.min(1, Math.max(.38, width / 1080));
    paint();
  }

  function animate(now) {
    // About 30 fps is enough for the slow motion.
    if (lastDraw === null || now - lastDraw >= 32) {
      if (lastDraw !== null) elapsed += Math.min((now - lastDraw) / 1000, .1);
      lastDraw = now;
      paint();
    }
    frameId = requestAnimationFrame(animate);
  }

  function updateMotion() {
    cancelAnimationFrame(frameId);
    lastDraw = null;
    if (!reducedMotion.matches && !document.hidden) frameId = requestAnimationFrame(animate);
  }

  reducedMotion.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", updateMotion);
  window.addEventListener("resize", resize);
  resize();
  updateMotion();
})();
