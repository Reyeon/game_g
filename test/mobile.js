const assert = require("node:assert/strict");
const { openPack } = require("./helpers");
const app = openPack();
const { w, doc, pump, select, canvasClick, draws } = app;
const padKey = key => [...doc.querySelectorAll(".pad-btn")].find(b => b.dataset.key === key);
function pointer(target, type, id = 1) {
  const event = new w.MouseEvent(type, { bubbles: true, button: 0 });
  Object.defineProperty(event, "pointerId", { value: id });
  target.dispatchEvent(event);
}
try {
  app.choose("mobile");
  assert.equal(doc.body.dataset.playMode, "mobile");
  select("사이먼 순서 기억");
  assert.deepEqual([...doc.querySelectorAll(".pad-btn")].map(b => b.dataset.key), ["1", "2", "3", "4"]);
  assert.equal(doc.getElementById("menuToggle").getAttribute("aria-expanded"), "false");

  select("상자 밀기");
  pointer(padKey("ArrowRight"), "pointerdown"); pump(2);
  pointer(w, "pointerup"); pump(2);
  assert.match(app.hud(), /이동 1회/);
  doc.getElementById("modeBtn").click(); pump(2);
  assert.equal(doc.body.dataset.playMode, "pc");
  assert.match(app.hud(), /이동 1회/);
  assert.equal(doc.getElementById("mobilePad").hidden, true);
  doc.getElementById("modeBtn").click();
  doc.getElementById("restartBtn").click(); pump(2);
  assert.match(app.hud(), /이동 0회/);

  select("퐁");
  pointer(padKey("ArrowUp"), "pointerdown"); pump(3);
  w.dispatchEvent(new w.Event("blur")); pump(2);
  const paddle = () => draws.find(d => d.method === "fillRect" && d.args[0] === 16 && d.args[2] === 8).args[1];
  const stoppedAt = paddle(); pump(10); assert.equal(paddle(), stoppedAt);

  select("지뢰찾기");
  doc.getElementById("flagMode").checked = true;
  canvasClick(432, 432, 280);
  assert.match(app.hud(), /깃발 1개/);
  assert.ok(draws.some(d => d.method === "fillText" && d.args[1] === 432 && d.args[2] === 440));
  canvasClick(432, 432, 440); assert.match(app.hud(), /깃발 0개/);

  select("모양 타일 놓기");
  canvasClick(58 + 4 * 52 + 10, 70 + 4 * 52 + 10, 280);
  assert.match(app.hud(), /점수 3/);
  assert.ok(draws.some(d => d.method === "fillRect" && d.args[0] === 58 + 4 * 52 && d.args[1] === 70 + 4 * 52 && d.color === "#4DD9E8"));

  const random = w.Math.random; w.Math.random = () => .5;
  select("카드 짝맞추기");
  canvasClick(100, 110); canvasClick(275, 110); canvasClick(188, 110);
  assert.match(app.hud(), /뒤집기 1회/);
  assert.equal(draws.filter(d => d.method === "fillText" && /^[1-6]$/.test(d.args[0])).length, 2);
  pump(30);
  assert.equal(draws.filter(d => d.method === "fillText" && /^[1-6]$/.test(d.args[0])).length, 0);
  w.Math.random = random;

  select("타자 방어");
  const target = draws.find(d => d.method === "fillText" && d.color === "#FFD23F").args[0];
  const input = doc.querySelector(".word-form input");
  input.value = "아무단어"; input.dispatchEvent(new w.InputEvent("input", { bubbles: true })); pump(1);
  assert.match(app.hud(), /점수 0/);
  input.dispatchEvent(new w.CompositionEvent("compositionstart"));
  input.value = target; input.dispatchEvent(new w.InputEvent("input", { isComposing: true })); pump(1);
  assert.equal(input.value, target); assert.match(app.hud(), /점수 0/);
  input.dispatchEvent(new w.CompositionEvent("compositionend", { data: target })); pump(1);
  assert.ok(app.hud().includes("점수 " + target.length * 10));
  assert.equal(input.value, "");
  input.dispatchEvent(new w.InputEvent("input")); pump(1);
  assert.ok(app.hud().includes("점수 " + target.length * 10));

  select("행맨 단어 추리");
  const letter = doc.querySelector(".word-form input");
  letter.value = "a";
  doc.querySelector(".word-form").dispatchEvent(new w.Event("submit", { cancelable: true })); pump(1);
  assert.match(app.hud(), /틀린 횟수 0/);
  assert.equal(app.errors.length, 0);
  console.log("Mobile controls, scaled touches, mode switching, cards and Korean composition passed");
} finally { app.close(); }

function distance(hz) {
  const game = openPack();
  try { game.choose("pc"); game.select("배달 라이더"); game.pump(hz, hz); return Number(game.hud().match(/거리 (\d+)/)[1]); }
  finally { game.close(); }
}
assert.equal(distance(60), distance(120));
console.log("60 Hz and 120 Hz game speed matched");
