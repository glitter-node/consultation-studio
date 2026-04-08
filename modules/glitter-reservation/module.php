<?php

namespace Modules\Glitter\Reservation;

use App\Extension\AbstractModule;
use Modules\Glitter\Reservation\Listeners\ReservationActivityLogListener;

class Module extends AbstractModule
{
    /**
     * 모듈 라우트 경로 반환
     *
     * @return array<string, string>
     */
    public function getRoutes(): array
    {
        return [
            'api' => $this->getModulePath().'/routes/admin.php',
            'web' => $this->getModulePath().'/routes/web.php',
        ];
    }

    /**
     * 모듈 역할 정의
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRoles(): array
    {
        return [];
    }

    /**
     * 모듈 권한 정의
     *
     * @return array<string, mixed>
     */
    public function getPermissions(): array
    {
        return [
            'name' => [
                'ko' => '예약',
                'en' => 'Reservation',
            ],
            'description' => [
                'ko' => '예약 모듈 권한',
                'en' => 'Reservation module permissions',
            ],
            'categories' => [
                [
                    'identifier' => 'reservations',
                    'resource_route_key' => 'reservation',
                    'owner_key' => 'created_by',
                    'name' => [
                        'ko' => '예약 관리',
                        'en' => 'Reservation Management',
                    ],
                    'description' => [
                        'ko' => '예약 관리 권한',
                        'en' => 'Reservation management permissions',
                    ],
                    'permissions' => [
                        [
                            'action' => 'read',
                            'name' => ['ko' => '예약 조회', 'en' => 'Read Reservations'],
                            'description' => ['ko' => '예약 목록 및 상세 조회', 'en' => 'Read reservation list and details'],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'create',
                            'name' => ['ko' => '예약 생성', 'en' => 'Create Reservation'],
                            'description' => ['ko' => '새 예약 생성', 'en' => 'Create new reservation'],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'update',
                            'name' => ['ko' => '예약 수정', 'en' => 'Update Reservation'],
                            'description' => ['ko' => '예약 정보 수정', 'en' => 'Update reservation information'],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'delete',
                            'name' => ['ko' => '예약 삭제', 'en' => 'Delete Reservation'],
                            'description' => ['ko' => '예약 삭제', 'en' => 'Delete reservation'],
                            'type' => 'admin',
                            'roles' => ['admin'],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * 모듈 설정 파일
     *
     * @return array<string, string>
     */
    public function getConfig(): array
    {
        return [
            'reservation' => $this->getModulePath().'/config/reservation.php',
        ];
    }

    /**
     * 훅 리스너 목록
     *
     * @return array<class-string>
     */
    public function getHookListeners(): array
    {
        return [
            ReservationActivityLogListener::class,
        ];
    }

    /**
     * 관리자 메뉴 정의
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAdminMenus(): array
    {
        return [
            [
                'name' => [
                    'ko' => '예약 관리',
                    'en' => 'Reservation Management',
                ],
                'slug' => 'reservation',
                'url' => '/admin/reservations',
                'icon' => 'fas fa-calendar-check',
                'order' => 35,
                'permission' => 'reservation.reservations.read',
            ],
        ];
    }
}
