<?php

namespace Tests\Feature\Api\Public;

use Tests\TestCase;

class ConsultationReservationCompatControllerTest extends TestCase
{
    public function test_reserve_context_returns_compatible_payload(): void
    {
        $response = $this->getJson('/api/modules/consultation-reservation/reserve-context');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.consultation_types', [])
            ->assertJsonPath('data.branches', [])
            ->assertJsonPath('data.available_dates', [])
            ->assertJsonPath('data.available_slots', [])
            ->assertJsonPath('data.summary.reservationNumber', '')
            ->assertJsonPath('data.verification.email', '');
    }
}
