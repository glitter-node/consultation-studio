<?php

namespace Modules\Glitter\Reservation\Listeners;

use App\ActivityLog\ChangeDetector;
use App\ActivityLog\Traits\ResolvesActivityLogType;
use App\Contracts\Extension\HookListenerInterface;
use Modules\Glitter\Reservation\Models\Reservation;

/**
 * 예약 활동 로그 리스너
 */
class ReservationActivityLogListener implements HookListenerInterface
{
    use ResolvesActivityLogType;

    /**
     * 구독 훅 목록
     *
     * @return array<string, array<string, int|string>>
     */
    public static function getSubscribedHooks(): array
    {
        return [
            'reservation.reservation.after_create' => ['method' => 'handleAfterCreate', 'priority' => 20],
            'reservation.reservation.after_update' => ['method' => 'handleAfterUpdate', 'priority' => 20],
            'reservation.reservation.after_delete' => ['method' => 'handleAfterDelete', 'priority' => 20],
        ];
    }

    /**
     * 기본 핸들러
     */
    public function handle(...$args): void
    {
    }

    /**
     * 생성 후 로그
     */
    public function handleAfterCreate(Reservation $reservation, array $data): void
    {
        $this->logActivity('reservation.create', [
            'loggable' => $reservation,
            'description_key' => 'reservation::messages.reservations.create_success',
            'properties' => [
                'booking_code' => $reservation->booking_code,
                'status' => $reservation->status?->value,
            ],
        ]);
    }

    /**
     * 수정 후 로그
     */
    public function handleAfterUpdate(Reservation $reservation, array $data, ?array $snapshot = null): void
    {
        $changes = ChangeDetector::detect($reservation, $snapshot);

        $this->logActivity('reservation.update', [
            'loggable' => $reservation,
            'description_key' => 'reservation::messages.reservations.update_success',
            'changes' => $changes,
        ]);
    }

    /**
     * 삭제 후 로그
     */
    public function handleAfterDelete(Reservation $reservation): void
    {
        $this->logActivity('reservation.delete', [
            'loggable' => $reservation,
            'description_key' => 'reservation::messages.reservations.delete_success',
            'properties' => [
                'booking_code' => $reservation->booking_code,
            ],
        ]);
    }
}
