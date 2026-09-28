# 예은 가계부

모바일에서 주로 쓰고 PC에서도 볼 수 있는 정적 웹 가계부입니다. 아이디와 비밀번호로 로그인하면 Supabase를 통해 여러 기기에서 자동 동기화됩니다.

## 주요 기능

- 계좌별 잔액과 총 잔액 확인
- 계좌 카드에서 바로 여는 월별 거래 상세 내역
- 수입/지출 등록
- 수입 카테고리와 지출 카테고리 직접 추가 및 순서 변경
- 월별 달력에서 날짜별 수입/지출 확인
- 지난달 소비와 이번 달 소비 비교
- 카테고리별 지출/수입 금액과 비율 분석
- 모바일 우선 반응형 UI
- iPhone 홈 화면 설치와 오프라인 앱 셸 지원
- 아이디·비밀번호 로그인과 기기 간 자동 동기화
- 일별 클라우드 스냅샷과 JSON 백업/복원

## 실행

아래 명령으로 로컬 서버를 실행합니다.

로컬 네트워크에서 휴대폰으로도 확인하려면 아래 명령을 실행한 뒤, 같은 와이파이에 연결된 휴대폰에서 PC의 로컬 IP 주소로 접속하세요.

```bash
npm start
```

기본 포트는 `4173`입니다.

## iPhone 홈 화면에 추가

서비스가 HTTPS 주소로 배포된 뒤 iPhone Safari에서 주소를 엽니다. Safari의 공유 버튼을 누르고 `홈 화면에 추가`를 선택하면 `예은 가계부`가 독립된 앱처럼 실행됩니다.

PWA 아이콘과 설치 정보, 오프라인 앱 셸이 포함되어 있습니다. iOS에서는 Safari를 통해 홈 화면에 추가해야 합니다.

## 데이터 저장

로그인한 사용자마다 브라우저의 `localStorage`가 분리되며, 사용자별 가계부가 Supabase에 동기화됩니다. 변경할 때마다 그날의 최신 상태가 백업 테이블에 보관됩니다.

브라우저에서 사용하는 Supabase 키는 공개 가능한 publishable key입니다. 사용자 데이터는 `supabase/schema.sql`의 Row Level Security 정책으로 분리되며, service role 키는 프런트엔드에서 사용하지 않습니다.

## Supabase 설정

1. Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.
2. Authentication의 Sign In / Providers에서 Email을 활성화하고 Confirm email을 끕니다.
3. Authentication URL Configuration의 Site URL을 배포 주소로 설정합니다.
4. Redirect URLs에 배포 주소와 로컬 개발 주소를 추가합니다.
