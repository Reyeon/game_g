# 고전게임 체험관

게임잼 수업에서 규칙, 목표, 장애물, 점수를 관찰하는 46가지 게임 모음입니다. 추천 20가지와 접어 둔 전체 목록을 제공합니다. 게임 파일 하나만 있으면 인터넷 없이 실행할 수 있습니다.

## 시작하기

1. `index.html` 또는 `classic_games_pack.html`을 브라우저로 엽니다.
2. 첫 화면에서 **PC용으로 시작** 또는 **모바일용으로 시작**을 고릅니다.
3. 게임 목록에서 게임을 선택합니다. 사용 중에도 메뉴에서 PC용과 모바일용을 전환할 수 있습니다.

## 모바일 조작

- 모바일용을 선택하면 화면 너비와 관계없이 터치 버튼이 표시됩니다. 펼친 폴더블이나 태블릿도 같습니다.
- 게임마다 필요한 방향, 행동, 숫자 버튼을 표시합니다. 화면을 직접 누르는 게임에는 불필요한 방향키가 나타나지 않습니다.
- 지뢰찾기는 `깃발 표시`를 켠 뒤 칸을 누르면 깃발을 놓습니다.
- 타자 방어와 단어 추리는 화면 아래 한글 입력칸을 사용합니다.
- `다시 시작`은 모든 게임에서 사용할 수 있습니다. 게임을 고르면 모바일 게임 목록은 자동으로 접힙니다.

## 검증

```powershell
npm.cmd ci --cache .npm-cache
npm.cmd run check
npm.cmd run smoke
npm.cmd run test:mobile
```

PC용과 모바일용에서 46개 게임 실행, 터치 좌표, 키 해제, 모드 전환, 한글 조합, 카드 입력, 60/120Hz 게임 속도를 검사합니다. 자동 검사는 실제 휴대폰의 한글 키보드 검사를 완전히 대신하지는 않습니다.

## 수정과 배포

`classic_games_pack.html`을 수정한 뒤 `index.html`에 동일하게 반영합니다.

```powershell
Copy-Item -LiteralPath .\classic_games_pack.html -Destination .\index.html
npm.cmd run check
npm.cmd run smoke
npm.cmd run test:mobile
git add classic_games_pack.html index.html README.md package.json test
git commit -m "Update game pack"
git push origin main
```

GitHub Pages는 `main` 브랜치의 `/ (root)`를 게시하도록 설정합니다. `index.html`이 시작 파일이며 `.nojekyll`도 함께 유지합니다. 게시 주소는 https://reyeon.github.io/game_g/ 입니다. 저장소를 공개로 바꾸는 작업과 Pages 게시 설정은 별개입니다.
