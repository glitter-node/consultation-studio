<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\Base\PublicBaseController;
use Illuminate\Http\JsonResponse;

class ConsultationReservationCompatController extends PublicBaseController
{
    public function reserveContext(): JsonResponse
    {
        return $this->success('common.success', [
            'consultation_types' => [],
            'branches' => [],
            'available_dates' => [],
            'available_slots' => [],
            'summary' => [
                'reservationNumber' => '',
                'typeName' => '',
                'branchName' => '',
                'date' => '',
                'slotLabel' => '',
            ],
            'verification' => [
                'state' => '',
                'email' => '',
            ],
            'lookup' => [
                'reservationNumber' => '',
                'email' => '',
                'typeName' => '',
                'branchName' => '',
                'date' => '',
                'slotLabel' => '',
                'state' => '',
            ],
            'complete' => [
                'notice' => '',
            ],
            'state' => '',
        ]);
    }
}
