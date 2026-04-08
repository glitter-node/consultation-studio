# Glitter Reservation Module

## 알림 구조

glitter-reservation 모듈은 실제 문자/이메일 구현을 직접 알지 않고
`NotificationDispatcherInterface`만 의존합니다.

- 기본 구현: `NullNotificationDispatcher`
- 실제 발송 구현: `plugins/glitter-reservation_notify` 같은 플러그인에서 담당
- glitter-reservation 모듈은 dispatcher가 없어도 안전하게 동작
- 이메일은 `customer_email`이 있을 때만 발송 가능
- glitter-reservation 모듈은 `customer_email`을 booking 본문과 notification payload context에 함께 넣습니다.

현재 이벤트:

- `booking_created`
- `booking_confirmed`
- `admin_cancelled`
- `customer_cancelled`
- `booking_completed`
- `booking_no_show`

현재 glitter-reservation 모듈은 실제 이메일 구현체를 직접 갖지 않습니다.
외부 플러그인이 연결되면 같은 이벤트 payload를 실제 채널 구현으로 넘깁니다.

## 이메일 연동

- glitter-reservation 모듈은 `NotificationDispatcherInterface`만 호출합니다.
- `plugins/glitter-reservation_notify`가 실제 dispatcher / sender를 제공합니다.
- 발신자 주소 정책은 플러그인 sender 내부에서 `no-reply@glitter.kr`로 명시 처리합니다.

실행 예시:

```bash
# glitter-reservation 전체 테스트
/usr/local/bin/php83 artisan test modules/glitter-reservation/tests

# notify 구조 테스트
/usr/local/bin/php83 artisan test modules/glitter-reservation/tests/Unit/PluginEmailDispatchTest.php modules/glitter-reservation/tests/Unit/PluginNotificationDispatcherTest.php
```

## 테스트 실행

현재 glitter-reservation 모듈 테스트는 `phpunit.xml` testsuite에 자동 등록되어 있지 않습니다.
따라서 전체 프로젝트 기준 `--filter=Reservation`만으로는 테스트가 잡히지 않을 수 있습니다.

모듈 테스트는 아래처럼 경로를 직접 지정해서 실행합니다.

```bash
/usr/local/bin/php83 artisan test modules/glitter-reservation/tests
```

## 마이그레이션 적용

glitter-reservation 모듈 마이그레이션은 아래 명령으로 직접 적용합니다.

```bash
/usr/local/bin/php83 artisan migrate --path=modules/glitter-reservation/database/migrations
```

운영 보호가 켜진 환경이면 `--force`가 필요할 수 있습니다.

```bash
/usr/local/bin/php83 artisan migrate --force --path=modules/glitter-reservation/database/migrations
```

## 빠른 예시

```bash
# glitter-reservation 모듈 마이그레이션 적용
/usr/local/bin/php83 artisan migrate --force --path=modules/glitter-reservation/database/migrations

# glitter-reservation 모듈 테스트 실행
/usr/local/bin/php83 artisan test modules/glitter-reservation/tests
```
