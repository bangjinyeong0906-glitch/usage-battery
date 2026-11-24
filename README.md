# usage-battery

Claude Code 대화의 입력창 위에 **일일(5시간) 사용량**과 **주간(7일) 사용량**을
휴대폰 배터리 모양으로 보여주는 모드입니다. 옆에 **새로고침** 버튼이 있습니다.

```
 일일 ▕████████████░░░░▏ 78% ↻2h13m   주간 ▕████████░░░░░░░░▏ 52% ↻3d4h   [⟳ 새로고침]
```

- 배터리는 **남은 양**을 표시합니다 (노트북처럼 남은 양은 항상 초록색).
- `↻` 뒤 시간은 한도가 초기화될 때까지 남은 시간입니다.
- 수치는 마지막 응답에서 받은 값이며, 응답마다 자동으로 갱신됩니다.
- 구독 요금제(Pro/Max)에서만 한도 정보가 표시됩니다.
- 배터리는 칸으로 나뉘지 않은 **하나의 막대**로 그려집니다.
- 입력창 아래 상태줄에도 자동으로 고정 표시됩니다. 따로 입력할 필요가 없어요:
  `🔋 일일 ███████░░░ 70%  ·  주간 ██░░░░░░░░ 15%`
- 지금 바로 다시 확인하고 싶으면 **`/battery`** 를 입력해도 됩니다.

## 설치

터미널의 Claude Code 프롬프트에서:

```
/plugin install usage-battery --marketplace bangjinyeong0906-glitch/usage-battery
```

셸에서:

```bash
claude plugin install usage-battery --marketplace bangjinyeong0906-glitch/usage-battery
```

데스크톱 앱: 프롬프트 옆 **+** → **Plugins** → **Add marketplace**에
`bangjinyeong0906-glitch/usage-battery` 입력 → **Add plugin**.
