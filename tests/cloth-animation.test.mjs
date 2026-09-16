import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(
  new URL("../public/modules/cloth-engine.js", import.meta.url),
  "utf8",
).replace("export function", "function");
function harness() {
  let now = 100;
  let id = 0;
  const frames = new Map();
  const counts = { text: 0, images: 0, clears: 0 };
  let translations = [];
  const draw = {
    setTransform() {},
    save() {},
    restore() {},
    rotate() {},
    translate(x, y) {
      translations.push([x, y]);
    },
    fillText() {
      counts.text++;
    },
    drawImage() {
      counts.images++;
    },
    clearRect() {
      counts.clears++;
      translations = [];
    },
  };
  const surface = () => ({
    width: 0,
    height: 0,
    style: {},
    getContext: () => draw,
    classList: { add() {}, remove() {} },
  });
  const sandbox = vm.createContext({
    window: { innerWidth: 1200, innerHeight: 900, devicePixelRatio: 2 },
    document: { hidden: false, createElement: surface, body: surface() },
    performance: { now: () => now },
    requestAnimationFrame(fn) {
      frames.set(++id, fn);
      return id;
    },
    cancelAnimationFrame(key) {
      frames.delete(key);
    },
    canvas: surface(),
    cursor: surface(),
    note: surface(),
  });
  vm.runInContext(
    source + "\nvar engine = createClothEngine({canvas,cursor,note});",
    sandbox,
  );
  const run = (code) => vm.runInContext(code, sandbox);
  function tick(dt = 1000 / 60) {
    now += dt;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((fn) => fn(now));
  }
  run(
    `engine.rebuild([{x:300,y:200,width:160,height:320,cols:8,rows:18,glyphs:"文字旅行山川",ink:"#211a15",fontSize:13,fontFamily:"serif"}], {gallery:true})`,
  );
  tick();
  return {
    run,
    tick,
    counts,
    frames,
    translations: () => translations.map((p) => [...p]),
  };
}

test("glyphs stay cached during motion and each curtain sleeps naturally", () => {
  const h = harness();
  const text = h.counts.text;
  h.run("engine.move({clientX:380,clientY:350,target:{closest:()=>null}})");
  for (let i = 0; i < 30; i++) h.tick();
  h.run("engine.deactivate()");
  for (let i = 0; i < 1200 && h.frames.size; i++) h.tick();
  assert.equal(
    h.frames.size,
    0,
    "motion eventually sleeps without a hard timeout",
  );
  assert.equal(h.counts.text, text, "no repeated glyph rasterization");
  const paints = h.counts.clears;
  h.tick();
  h.tick();
  assert.equal(h.counts.clears, paints, "idle frame loop is stopped");
});

test("a resting curtain retains its settled pose on wake instead of jumping to the initial pose", () => {
  const h = harness();
  h.run("engine.move({clientX:380,clientY:350,target:{closest:()=>null}})");
  for (let i = 0; i < 20; i++) h.tick();
  h.run("engine.deactivate()");
  let previous = h.translations();
  let largestLateStep = 0;
  for (let i = 0; i < 1200 && h.frames.size; i++) {
    h.tick();
    const current = h.translations();
    if (i > 150 && current.length === previous.length) {
      for (let j = 0; j < current.length; j++)
        largestLateStep = Math.max(
          largestLateStep,
          Math.hypot(
            current[j][0] - previous[j][0],
            current[j][1] - previous[j][1],
          ),
        );
    }
    previous = current;
  }
  assert.ok(
    largestLateStep < 3,
    `late frame movement ${largestLateStep}px must not snap to rest`,
  );
});

test("suspended content pages cannot restart canvas work", () => {
  const h = harness();
  h.run("engine.suspend()");
  const paints = h.counts.clears;
  h.run("engine.move({clientX:380,clientY:350,target:{closest:()=>null}})");
  h.tick();
  assert.equal(h.frames.size, 0);
  assert.equal(h.counts.clears, paints);
  h.run("engine.resume()");
  h.tick();
  assert.ok(h.counts.clears > paints);
});
