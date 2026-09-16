/** Canvas-only cloth simulation. Navigation and DOM layout live in atlas.js. */
export function createClothEngine({
  canvas,
  cursor,
  note,
  reducedMotion = false,
}) {
  const ui = { canvas, cursor, note };
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  const FIXED_STEP = 1000 / 120;
  const PHYSICS = {
    radius: 108,
    damping: 0.992,
    gravity: 0.085,
    push: 1.05,
    sweep: 0.34,
  };
  const SLEEP_SPEED = 0.035;
  const QUIET_STEPS = 24;
  let cloths = [];
  let galleryOpen = false;
  let suspended = false;
  let canvasScale = 1;
  let canvasDirty = true;
  let cursorDirty = false;
  let animationFrameId = 0;
  let lastFrameTime = 0;
  let physicsAccumulator = 0;
  const glyphAtlases = new Map();
  const pointer = {
    x: -9999,
    y: -9999,
    simulationX: -9999,
    simulationY: -9999,
    active: false,
    lastMoveTime: 0,
  };
  function resizeCanvas() {
    const dprLimit = galleryOpen ? 2 : 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, dprLimit);
    const width = Math.round(window.innerWidth * dpr);
    const height = Math.round(window.innerHeight * dpr);
    // Changing canvas dimensions discards its backing buffer and drawing state.
    if (ui.canvas.width !== width) ui.canvas.width = width;
    if (ui.canvas.height !== height) ui.canvas.height = height;
    canvasScale = dpr;
    ui.canvas.style.width = `${window.innerWidth}px`;
    ui.canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function getGlyphAtlas(glyphs, font, fontSize, ink) {
    const key = JSON.stringify([glyphs, font, ink, canvasScale]);
    if (glyphAtlases.has(key)) return glyphAtlases.get(key);

    const characters = [...new Set(glyphs)];
    const columns = Math.ceil(Math.sqrt(characters.length));
    const cellPixels = Math.ceil(fontSize * 2.5 * canvasScale);
    const cellSize = cellPixels / canvasScale;
    const canvas = document.createElement("canvas");
    canvas.width = columns * cellPixels;
    canvas.height = Math.ceil(characters.length / columns) * cellPixels;
    const atlasContext = canvas.getContext("2d");
    atlasContext.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
    atlasContext.font = font;
    atlasContext.textAlign = "center";
    atlasContext.textBaseline = "middle";
    atlasContext.fillStyle = ink;
    const sprites = new Map();
    characters.forEach((glyph, index) => {
      const x = (index % columns) * cellPixels;
      const y = Math.floor(index / columns) * cellPixels;
      atlasContext.fillText(
        glyph,
        x / canvasScale + cellSize / 2,
        y / canvasScale + cellSize / 2,
      );
      sprites.set(glyph, { x, y });
    });
    const atlas = { canvas, sprites, cellPixels, cellSize };
    // Bound memory when window resizing produces different font sizes.
    if (glyphAtlases.size >= 8)
      glyphAtlases.delete(glyphAtlases.keys().next().value);
    glyphAtlases.set(key, atlas);
    return atlas;
  }

  function createCloth({
    x,
    y,
    width,
    height,
    cols,
    rows,
    glyphs,
    ink,
    fontSize,
    fontFamily,
    strength = 1,
    constraintPasses = 3,
  }) {
    const strands = [];
    const gapX = width / (cols - 1);
    const gapY = height / (rows - 1);
    let glyphIndex = 0;
    const font = `400 ${fontSize}px ${fontFamily}`;
    const atlas = getGlyphAtlas(glyphs, font, fontSize, ink);

    for (let col = 0; col < cols; col += 1) {
      const nodes = [];
      for (let row = 0; row < rows; row += 1) {
        const restX = x + col * gapX;
        const restY = y + row * gapY;
        nodes.push({
          x: restX,
          y: restY,
          previousX: restX,
          previousY: restY,
          restX,
          restY,
          pinned: row === 0,
          glyph: glyphs[glyphIndex % glyphs.length],
          sprite: atlas.sprites.get(glyphs[glyphIndex % glyphs.length]),
        });
        glyphIndex += 1;
      }
      if (col % 3 === 1) glyphIndex += 2;
      strands.push(nodes);
    }

    return {
      strands,
      x,
      y,
      width,
      height,
      cols,
      rows,
      gapY,
      ink,
      font,
      fontSize,
      atlas,
      strength,
      constraintPasses,
      active: false,
      quietSteps: 0,
    };
  }

  function solveSegment(a, b, targetDistance) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const correction = ((distance - targetDistance) / distance) * 0.5;
    const correctionX = dx * correction;
    const correctionY = dy * correction;

    if (a.pinned) {
      b.x -= correctionX * 2;
      b.y -= correctionY * 2;
    } else {
      a.x += correctionX;
      a.y += correctionY;
      b.x -= correctionX;
      b.y -= correctionY;
    }
  }

  function simulateCloth(
    cloth,
    mouseX,
    mouseY,
    mouseVelocityX,
    mouseVelocityY,
    pointerInfluencing,
  ) {
    const radius = PHYSICS.radius * cloth.strength;
    const radiusSquared = radius * radius;
    const strands = cloth.strands;

    for (let strandIndex = 0; strandIndex < strands.length; strandIndex += 1) {
      const strand = strands[strandIndex];
      for (let index = 1; index < strand.length; index += 1) {
        const node = strand[index];

        if (reducedMotion) {
          node.x = node.restX;
          node.y = node.restY;
          node.previousX = node.restX;
          node.previousY = node.restY;
          continue;
        }

        const damping = pointerInfluencing ? PHYSICS.damping : 0.978;
        const velocityX = (node.x - node.previousX) * damping;
        const velocityY = (node.y - node.previousY) * damping;
        node.previousX = node.x;
        node.previousY = node.y;
        node.x += velocityX;
        node.y += velocityY + PHYSICS.gravity;
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < radiusSquared) {
          const distance = Math.sqrt(distanceSquared) || 1;
          const falloff = 1 - distance / radius;
          const impulse = falloff * falloff;
          node.x +=
            (dx / distance) * impulse * PHYSICS.push +
            mouseVelocityX * impulse * PHYSICS.sweep;
          node.y +=
            (dy / distance) * impulse * PHYSICS.push * 0.45 +
            mouseVelocityY * impulse * PHYSICS.sweep * 0.7;
        }
      }

      for (let pass = 0; pass < cloth.constraintPasses; pass += 1) {
        for (let index = 0; index < strand.length - 1; index += 1) {
          solveSegment(strand[index], strand[index + 1], cloth.gapY);
        }
      }
    }
  }

  function renderCloth(cloth, drawContext = ctx) {
    const { canvas, cellPixels, cellSize } = cloth.atlas;
    const halfCell = cellSize / 2;
    const baseAlpha = galleryOpen ? 0.95 : 1;
    let previousAlpha = -1;
    const strands = cloth.strands;

    for (let strandIndex = 0; strandIndex < strands.length; strandIndex += 1) {
      const strand = strands[strandIndex];
      for (let index = 0; index < strand.length; index += 1) {
        const node = strand[index];
        const next = strand[index + 1] || node;
        const previous = strand[index - 1] || node;
        const angle =
          Math.atan2(next.y - previous.y, next.x - previous.x) - Math.PI / 2;
        const bend = Math.abs(angle);
        const alpha =
          Math.round((baseAlpha - Math.min(0.18, bend * 0.16)) * 20) / 20;
        if (alpha !== previousAlpha) {
          drawContext.globalAlpha = alpha;
          previousAlpha = alpha;
        }

        if (bend > 0.015) {
          drawContext.save();
          drawContext.translate(node.x, node.y);
          drawContext.rotate(angle);
          drawContext.drawImage(
            canvas,
            node.sprite.x,
            node.sprite.y,
            cellPixels,
            cellPixels,
            -halfCell,
            -halfCell,
            cellSize,
            cellSize,
          );
          drawContext.restore();
        } else {
          drawContext.drawImage(
            canvas,
            node.sprite.x,
            node.sprite.y,
            cellPixels,
            cellPixels,
            Math.round((node.x - halfCell) * canvasScale) / canvasScale,
            Math.round((node.y - halfCell) * canvasScale) / canvasScale,
            cellSize,
            cellSize,
          );
        }
      }
    }
    drawContext.globalAlpha = 1;
  }

  function drawCloths() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let clothIndex = 0; clothIndex < cloths.length; clothIndex += 1) {
      const cloth = cloths[clothIndex];
      if (galleryOpen && !cloth.active) {
        if (!cloth.restImage) {
          const padding = cloth.fontSize * 2;
          const nodes = cloth.strands.flat();
          const minX = Math.min(...nodes.map((n) => n.x));
          const minY = Math.min(...nodes.map((n) => n.y));
          const maxX = Math.max(...nodes.map((n) => n.x));
          const maxY = Math.max(...nodes.map((n) => n.y));
          const x = Math.floor((minX - padding) * canvasScale) / canvasScale;
          const y = Math.floor((minY - padding) * canvasScale) / canvasScale;
          const canvas = document.createElement("canvas");
          canvas.width = Math.ceil((maxX + padding - x) * canvasScale);
          canvas.height = Math.ceil((maxY + padding - y) * canvasScale);
          const restContext = canvas.getContext("2d");
          restContext.setTransform(
            canvasScale,
            0,
            0,
            canvasScale,
            -x * canvasScale,
            -y * canvasScale,
          );
          renderCloth(cloth, restContext);
          cloth.restImage = { canvas, x, y };
        }
        const { canvas, x, y } = cloth.restImage;
        ctx.drawImage(
          canvas,
          x,
          y,
          canvas.width / canvasScale,
          canvas.height / canvasScale,
        );
      } else {
        renderCloth(cloth);
      }
    }
  }

  function pointerNearCloth(cloth, x, y) {
    const padding = PHYSICS.radius * cloth.strength;
    return (
      x > cloth.x - padding &&
      x < cloth.x + cloth.width + padding &&
      y > cloth.y - padding &&
      y < cloth.y + cloth.height + padding
    );
  }

  function schedule() {
    if (suspended || document.hidden || animationFrameId) return;
    if (!lastFrameTime) lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(animate);
  }

  function animate(now) {
    animationFrameId = 0;
    if (suspended || document.hidden) return;
    if (cursorDirty && pointer.active) {
      ui.cursor.style.transform = `translate3d(${pointer.x - 13}px, ${pointer.y - 13}px, 0)`;
    }
    cursorDirty = false;
    physicsAccumulator = Math.min(
      physicsAccumulator + now - lastFrameTime,
      FIXED_STEP * 4,
    );
    lastFrameTime = now;
    const steps = Math.min(4, Math.floor(physicsAccumulator / FIXED_STEP));
    physicsAccumulator -= steps * FIXED_STEP;
    const influencing =
      pointer.active && now - pointer.lastMoveTime < 140 && !reducedMotion;
    const vx =
      influencing && steps ? (pointer.x - pointer.simulationX) / steps : 0;
    const vy =
      influencing && steps ? (pointer.y - pointer.simulationY) / steps : 0;

    for (let step = 1; step <= steps; step++) {
      const x = influencing ? pointer.simulationX + vx * step : -9999;
      const y = influencing ? pointer.simulationY + vy * step : -9999;
      for (const cloth of cloths) {
        const touched = influencing && pointerNearCloth(cloth, x, y);
        if (touched) {
          cloth.active = true;
          cloth.quietSteps = 0;
          cloth.restImage = null;
        }
        if (!cloth.active) continue;
        simulateCloth(cloth, x, y, vx, vy, touched);
        let speed = 0;
        for (const strand of cloth.strands) {
          for (const node of strand) {
            speed = Math.max(
              speed,
              Math.abs(node.x - node.previousX),
              Math.abs(node.y - node.previousY),
            );
          }
        }
        cloth.quietSteps =
          !touched && speed < SLEEP_SPEED ? cloth.quietSteps + 1 : 0;
        if (cloth.quietSteps >= QUIET_STEPS) {
          cloth.active = false;
          cloth.restImage = null; // Cache this settled pose, not the original straight curtain.
        }
        canvasDirty = true;
      }
    }
    if (steps) {
      pointer.simulationX = pointer.x;
      pointer.simulationY = pointer.y;
    }
    if (canvasDirty) {
      drawCloths();
      canvasDirty = false;
    }
    if (influencing || cloths.some((cloth) => cloth.active)) schedule();
    else {
      lastFrameTime = 0;
      physicsAccumulator = 0;
    }
  }

  function deactivate() {
    pointer.active = false;
    document.body.classList.remove("cloth-hover");
    ui.cursor.classList.remove("is-visible");
  }

  function move(event) {
    if (suspended || reducedMotion) return;
    const overText = event.target.closest?.(".gallery-cloth-space");
    const interactive =
      !overText && event.target.closest?.("button, a, input, textarea, select");
    const wasActive = pointer.active;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active =
      !interactive &&
      cloths.some((c) => pointerNearCloth(c, pointer.x, pointer.y));
    if (!pointer.active) {
      deactivate();
      return;
    }
    if (!wasActive) {
      pointer.simulationX = pointer.x;
      pointer.simulationY = pointer.y;
    }
    pointer.lastMoveTime = performance.now();
    cursorDirty = true;
    document.body.classList.add("cloth-hover");
    ui.cursor.classList.add("is-visible");
    ui.note.style.opacity = "0";
    schedule();
  }

  function rebuild(layouts, options = {}) {
    galleryOpen = Boolean(options.gallery);
    resizeCanvas();
    cloths = layouts.map(createCloth);
    canvasDirty = true;
    physicsAccumulator = 0;
    deactivate();
    schedule();
  }

  function suspend() {
    suspended = true;
    deactivate();
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
    lastFrameTime = 0;
    physicsAccumulator = 0;
  }

  function resume() {
    suspended = false;
    canvasDirty = true;
    schedule();
  }
  function refreshFonts() {
    glyphAtlases.clear();
  }
  return { rebuild, move, deactivate, suspend, resume, refreshFonts };
}
