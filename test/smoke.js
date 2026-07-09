// 전 게임 스모크 테스트: 모든 게임 버튼 순회 → 초기화/프레임 진행/키 입력/전환(정리) 검증
const { JSDOM } = require("jsdom");
const fs = require("fs");
const html = fs.readFileSync(__dirname + "/../classic_games_pack.html", "utf-8");

const ctxStub = new Proxy({}, { get: (t, k) => (k === "canvas" ? {} : () => {}), set: () => true });
let rafQ = [];
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  beforeParse(w) {
    w.HTMLCanvasElement.prototype.getContext = () => ctxStub;
    w.requestAnimationFrame = cb => { rafQ.push(cb); return rafQ.length; };
    w.cancelAnimationFrame = () => {};
  },
});
const w = dom.window, doc = w.document;
const pump = n => { for (let i = 0; i < n; i++) { const q = rafQ; rafQ = []; q.forEach(cb => cb(Date.now())); } };
const press = (key, times = 1) => {
  for (let i = 0; i < times; i++) {
    w.dispatchEvent(new w.KeyboardEvent("keydown", { key }));
    w.dispatchEvent(new w.KeyboardEvent("keyup", { key }));
  }
};

const btns = [...doc.querySelectorAll(".gbtn")];
console.log("게임 수:", btns.length);
if (btns.length < 10) { console.error("게임이 10개 미만입니다 — 기존 게임이 삭제되었는지 확인"); process.exit(1); }

let fail = 0;
for (const b of btns) {
  try {
    b.click();
    pump(60);
    press("ArrowLeft", 3); press("ArrowRight", 3); press("ArrowUp", 2); press("ArrowDown", 2); press(" ", 2);
    pump(60);
    const title = doc.getElementById("g-title").textContent;
    const hud = doc.getElementById("hud").textContent;
    if (!title) throw new Error("제목 미표시");
    console.log("OK:", title, "| HUD:", hud.slice(0, 34));
  } catch (e) {
    fail++;
    console.error("실패:", b.textContent, "-", e.message);
  }
}
setTimeout(() => {
  pump(30);
  if (fail) { console.error(fail + "개 게임 실패"); process.exit(1); }
  console.log("전 게임 스모크 테스트 통과 (" + btns.length + "종)");
  process.exit(0);
}, 700);
