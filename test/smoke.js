const assert = require("node:assert/strict");
const { openPack } = require("./helpers");

for (const mode of ["pc", "mobile"]) {
  const app = openPack();
  try {
    assert.equal(app.doc.getElementById("modeDialog").open, true);
    app.choose(mode);
    assert.equal(app.doc.getElementById("modeDialog").open, false);
    const buttons = [...app.doc.querySelectorAll(".gbtn")];
    assert.equal(buttons.length, 46);
    assert.equal(app.doc.querySelectorAll(".recbtn").length, 20);
    for (const button of buttons) {
      button.click(); app.pump(60);
      for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "1", "2", "3", "4"]) app.press(key);
      app.pump(60);
      assert.ok(app.doc.getElementById("g-title").textContent);
      assert.ok(app.hud());
      assert.equal(app.doc.querySelector(".info details").open, false);
      assert.ok(app.doc.querySelectorAll(".word-form").length <= 1);
    }
    app.doc.getElementById("homeBtn").click(); app.pump(90);
    assert.equal(app.doc.querySelectorAll(".word-form").length, 0);
    assert.equal(app.doc.getElementById("mobilePad").hidden, true);
    assert.equal(app.errors.length, 0);
    console.log(`${mode}: all 46 games passed`);
  } finally { app.close(); }
}
