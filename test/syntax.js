// 스크립트 문법 검사: HTML에서 <script>를 추출해 node --check 실행
const fs = require("fs");
const { execFileSync } = require("child_process");
const html = fs.readFileSync(__dirname + "/../classic_games_pack.html", "utf-8");
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error("스크립트 블록을 찾지 못했습니다"); process.exit(1); }
const tmp = __dirname + "/_extracted.js";
fs.writeFileSync(tmp, m[1]);
execFileSync(process.execPath, ["--check", tmp], { stdio: "inherit" });
fs.unlinkSync(tmp);
console.log("문법 검사 통과");
