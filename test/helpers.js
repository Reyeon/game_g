const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs");
const path = require("path");

function openPack() {
  let now = 0, nextId = 1;
  const frames = new Map(), timers = new Map(), errors = [], draws = [];
  const ctx = new Proxy({}, {
    get(target, key) {
      if (key in target) return target[key];
      return (...args) => {
        if (key === "fillRect" && args.join() === "0,0,480,480") draws.length = 0;
        draws.push({ method: key, args, color: target.fillStyle });
      };
    }
  });
  const vc = new VirtualConsole();
  vc.on("jsdomError", error => errors.push(error));
  const dom = new JSDOM(fs.readFileSync(path.join(__dirname, "../classic_games_pack.html"), "utf8"), {
    runScripts: "dangerously", virtualConsole: vc,
    beforeParse(w) {
      w.HTMLCanvasElement.prototype.getContext = () => ctx;
      w.HTMLElement.prototype.scrollIntoView = () => {};
      w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
      w.HTMLDialogElement.prototype.close = function () { this.open = false; };
      w.requestAnimationFrame = callback => { const id = nextId++; frames.set(id, callback); return id; };
      w.cancelAnimationFrame = id => frames.delete(id);
      function schedule(callback, delay = 0, repeat = false) {
        const id = nextId++;
        timers.set(id, { callback, at: now + delay, delay, repeat });
        return id;
      }
      w.setTimeout = (callback, delay) => schedule(callback, delay);
      w.setInterval = (callback, delay) => schedule(callback, delay, true);
      w.clearTimeout = w.clearInterval = id => timers.delete(id);
    }
  });
  const w = dom.window, doc = w.document;
  function pump(count = 1, hz = 60) {
    for (let i = 0; i < count; i++) {
      now += 1000 / hz;
      for (const [id, timer] of [...timers]) {
        if (!timers.has(id) || timer.at > now) continue;
        if (timer.repeat) timer.at += timer.delay; else timers.delete(id);
        timer.callback();
      }
      const pending = [...frames.values()]; frames.clear();
      pending.forEach(callback => callback(now));
    }
    if (errors.length) throw errors[0];
  }
  function choose(mode) { doc.querySelector(`[data-mode="${mode}"]`).click(); }
  function select(title) {
    const button = [...doc.querySelectorAll(".gbtn")].find(b => b.textContent.startsWith(title + "  ·"));
    if (!button) throw new Error("Missing game: " + title);
    button.click(); pump(1);
  }
  function press(key) {
    w.dispatchEvent(new w.KeyboardEvent("keydown", { key, cancelable: true })); pump(2);
    w.dispatchEvent(new w.KeyboardEvent("keyup", { key })); pump(2);
  }
  function canvasClick(x, y, width = 320) {
    const canvas = doc.getElementById("cv");
    canvas.getBoundingClientRect = () => ({ left: 20, top: 100, width, height: width });
    canvas.dispatchEvent(new w.MouseEvent("click", { clientX: 20 + x * width / 480, clientY: 100 + y * width / 480 }));
    pump(1);
  }
  return { w, doc, pump, choose, select, press, canvasClick, draws, errors,
    hud: () => doc.getElementById("hud").textContent,
    close() { dom.window.close(); timers.clear(); frames.clear(); }
  };
}
module.exports = { openPack };
