<?php

namespace Modules\Glitter\Reservation\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Modules\Glitter\Reservation\Enums\ReservationStatus;

/**
 * 예약 수정 요청
 */
class UpdateReservationRequest extends FormRequest
{
    /**
     * 권한 확인
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * 검증 전 전처리
     */
    protected function prepareForValidation(): void
    {
        $this->merge(array_filter([
            'customer_name' => $this->input('customer_name', $this->input('name')),
            'customer_phone' => $this->input('customer_phone', $this->input('phone')),
            'customer_email' => $this->input('customer_email', $this->input('email')),
            'booking_date' => $this->input('booking_date', $this->input('reservation_date')),
            'booking_time' => $this->input('booking_time', $this->input('reservation_time')),
            'request_memo' => $this->input('request_memo', $this->input('notes')),
        ], static fn ($value) => $value !== null));

        if ($this->has('guest_count')) {
            $this->merge([
                'guest_count' => (int) $this->input('guest_count'),
            ]);
        }
    }

    /**
     * 검증 규칙
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'reservation_service_id' => ['sometimes', 'integer', 'exists:reservation_services,id'],
            'reservation_schedule_id' => ['nullable', 'integer', 'exists:reservation_schedules,id'],
            'customer_name' => ['sometimes', 'string', 'max:100'],
            'customer_phone' => ['sometimes', 'string', 'max:30'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'booking_date' => ['sometimes', 'date'],
            'booking_time' => ['sometimes', 'date_format:H:i'],
            'booking_end_time' => ['nullable', 'date_format:H:i'],
            'guest_count' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'status' => ['sometimes', new Enum(ReservationStatus::class)],
            'request_memo' => ['nullable', 'string', 'max:2000'],
            'admin_memo' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
