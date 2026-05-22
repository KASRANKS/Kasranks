function hiDPI(canvas, context, width, height) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.scale(pixelRatio, pixelRatio);

  return {
    width,
    height,
    dpr: pixelRatio
  };
}

(function setupCursor() {
  const cursorDot = document.getElementById('cur');
  const cursorRing = document.getElementById('cur-r');

  if (!cursorDot || !cursorRing || window.innerWidth < 768) {
    return;
  }

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  function updateCursor() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;

    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;

    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;

    requestAnimationFrame(updateCursor);
  }

  updateCursor();

  document
    .querySelectorAll('a,button,.rc,.rc-solo,.ksp,.mc,.cc,.story-card,.cp')
    .forEach((element) => {
      element.addEventListener('mouseenter', () => {
        cursorRing.style.width = '52px';
        cursorRing.style.height = '52px';
        cursorRing.style.borderColor = 'rgba(73,234,203,.6)';
        cursorDot.style.transform = 'translate(-50%,-50%) scale(1.8)';
      });

      element.addEventListener('mouseleave', () => {
        cursorRing.style.width = '32px';
        cursorRing.style.height = '32px';
        cursorRing.style.borderColor = 'rgba(73,234,203,.35)';
        cursorDot.style.transform = 'translate(-50%,-50%) scale(1)';
      });
    });
})();
