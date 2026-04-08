<?php

namespace Modules\Glitter\Reservation\Providers;

use App\Extension\BaseModuleServiceProvider;
use Modules\Glitter\Reservation\Contracts\NotificationDispatcherInterface;
use Modules\Glitter\Reservation\Notifications\NullNotificationDispatcher;

/**
 * Reservation 모듈 서비스 프로바이더
 */
class ReservationServiceProvider extends BaseModuleServiceProvider
{
    /**
     * 모듈 식별자
     */
    protected string $moduleIdentifier = 'glitter-reservation';

    /**
     * Repository 바인딩 목록
     *
     * @var array<class-string, class-string>
     */
    protected array $repositories = [];

    public function register(): void
    {
        parent::register();

        // 외부 플러그인이 별도 dispatcher를 바인딩하지 않은 경우에만
        // reservation 모듈 기본 no-op dispatcher를 사용합니다.
        $this->app->singletonIf(NotificationDispatcherInterface::class, NullNotificationDispatcher::class);
    }

    /**
     * 서비스 부트스트랩
     */
    public function boot(): void
    {
        parent::boot();

        $this->loadMigrationsFrom(dirname(__DIR__, 2).'/database/migrations');
    }
}
