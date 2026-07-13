export function initStars() {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let mouseX = 0;
  let mouseY = 0;
  let shootingStar = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.3,
      baseAlpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.6 + 0.2,
    }));
  }

  function maybeSpawnShootingStar() {
    if (!shootingStar && Math.random() < 0.003) {
      const startX = Math.random() * canvas.width * 0.6;
      shootingStar = { x: startX, y: -10, vx: 6 + Math.random() * 3, vy: 3 + Math.random() * 2, life: 1 };
    }
  }

  function drawShootingStar() {
    if (!shootingStar) return;
    const s = shootingStar;
    ctx.save();
    ctx.strokeStyle = 'rgba(200,210,255,' + s.life + ')';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
    ctx.stroke();
    ctx.restore();
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 0.02;
    if (s.life <= 0 || s.x > canvas.width || s.y > canvas.height) shootingStar = null;
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const px = (mouseX - cx) / cx;
    const py = (mouseY - cy) / cy;
    for (const s of stars) {
      s.twinklePhase += s.twinkleSpeed;
      const alpha = s.baseAlpha + Math.sin(s.twinklePhase) * 0.25;
      const ox = px * 14 * s.depth;
      const oy = py * 14 * s.depth;
      ctx.beginPath();
      ctx.arc(s.x + ox, s.y + oy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230,232,255,' + Math.max(0, alpha) + ')';
      ctx.fill();
    }
    maybeSpawnShootingStar();
    drawShootingStar();
    requestAnimationFrame(animate);
  }

  // --- Efecto "atravesar" el fondo con el mouse ---------------------
  // Mueve directamente (con estilos inline, no con @keyframes) la
  // imagen de fondo y cada nebulosa. Cada capa .nebula-parallax tiene
  // su propio data-depth: las "más cercanas" se mueven más que las
  // "lejanas", dando sensación real de profundidad al pasar el mouse.
  const fondoImagen = document.getElementById('fondoImagen');
  const capasNebulosa = Array.from(document.querySelectorAll('.nebula-parallax'));

  function actualizarParallaxFondo(clientX, clientY) {
    const nx = (clientX / window.innerWidth) * 2 - 1;  // -1 a 1
    const ny = (clientY / window.innerHeight) * 2 - 1; // -1 a 1

    if (fondoImagen) {
      fondoImagen.style.transform =
        `translate(${(nx * -35).toFixed(1)}px, ${(ny * -35).toFixed(1)}px) scale(1.08)`;
    }

    capasNebulosa.forEach((capa) => {
      const depth = parseFloat(capa.dataset.depth) || 1;
      const dx = (nx * 60 * depth).toFixed(1);
      const dy = (ny * 60 * depth).toFixed(1);
      capa.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    actualizarParallaxFondo(e.clientX, e.clientY);
  });

  resizeCanvas();
  animate();
}
