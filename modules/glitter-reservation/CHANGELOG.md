# Changelog

All notable changes to this module will be documented in this file.

The format is based on Keep a Changelog.

## [0.1.0] - 2026-04-06

### Added
- reservation 모듈 기본 골격 추가 (module.php, module.json, composer.json)
- 예약 CRUD 기본 계층 추가: Controller, FormRequest, Service, Repository, Model
- 예약 상태 Enum, Hook 기반 활동 로그 리스너, 관리자 API 라우트 추가
- reservations 테이블 마이그레이션 추가 (comment/down 포함)
- FormRequest/Service 단위 테스트 골격 추가

### Changed
- reservation MVP 스키마를 서비스/운영시간/휴무일/예약/예약로그 5개 테이블 구조로 재정리
- 기존 단일 reservations 구조를 reservation_bookings 중심으로 통합하고 legacy 정리 migration 추가
