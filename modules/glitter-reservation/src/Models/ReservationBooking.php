<?php

namespace Modules\Glitter\Reservation\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Glitter\Reservation\Enums\BookingStatus;

/**
 * 예약 모델
 */
class ReservationBooking extends Model
{
    /**
     * 테이블명
     *
     * @var string
     */
    protected $table = 'reservation_bookings';

    /**
     * 대량 할당 가능 속성
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'reservation_service_id',
        'reservation_schedule_id',
        'booking_code',
        'customer_name',
        'customer_phone',
        'student_grade',
        'customer_email',
        'booking_date',
        'booking_time',
        'booking_end_time',
        'guest_count',
        'status',
        'request_memo',
        'admin_memo',
        'confirmed_at',
        'cancelled_at',
        'completed_at',
        'created_by',
        'updated_by',
    ];

    /**
     * 속성 캐스팅
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'booking_date' => 'date',
            'booking_time' => 'datetime:H:i:s',
            'booking_end_time' => 'datetime:H:i:s',
            'guest_count' => 'integer',
            'status' => BookingStatus::class,
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * 예약 서비스 관계
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(ReservationService::class, 'reservation_service_id');
    }

    /**
     * 예약 스케줄 관계
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(ReservationSchedule::class, 'reservation_schedule_id');
    }

    /**
     * 예약 로그 목록 관계
     */
    public function logs(): HasMany
    {
        return $this->hasMany(ReservationBookingLog::class, 'reservation_booking_id');
    }

    /**
     * 생성자 관계
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 수정자 관계
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
