# usage-battery

Claude Code 대화의 입력창 위에 **일일(5시간) 사용량**과 **주간(7일) 사용량**을
휴대폰 배터리 모양으로 보여주는 모드입니다. 옆에 **새로고침** 버튼이 있습니다.

```
 일일 [████████░░]▌ 78% ↻2h13m   주간 [█████░░░░░]▌ 52% ↻3d4h   [⟳ 새로고침]
```

- 배터리는 **남은 양**을 표시합니다 (초록 > 50%, 노랑 21–50%, 빨강 ≤ 20%).
- `↻` 뒤 시간은 한도가 초기화될 때까지 남은 시간입니다.
- 수치는 마지막 응답에서 받은 값이며, 응답마다 자동으로 갱신됩니다.
- 구독 요금제(Pro/Max)에서만 한도 정보가 표시됩니다.
- 입력창 위 띠가 안 보이면(모바일 앱 등) 프롬프트에 **`/battery`** 를 입력하세요.
  대화창에 배터리가 바로 표시됩니다. 새로고침 버튼을 누르면 알림으로도 보여줍니다.

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
