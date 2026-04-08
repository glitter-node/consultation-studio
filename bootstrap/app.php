<?php

use Dotenv\Dotenv;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Env;
use Illuminate\Support\Facades\Route;

if (PHP_SAPI === 'cli' || PHP_SAPI === 'phpdbg') {
    Dotenv::createMutable(dirname(__DIR__))->safeLoad();
}

Env::disablePutenv();

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        then: function () {
            Route::middleware('api')
                ->group(base_path('routes/devtools.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->remove(\Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance::class);

        $middleware->prepend(\App\Http\Middleware\MaintenanceModePage::class);

        $middleware->prependToGroup('web', \App\Http\Middleware\SyncBoostWithDebugMode::class);

        $localeTimezoneMiddleware = [
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\SetTimezone::class,
        ];

        $middleware->appendToGroup('web', $localeTimezoneMiddleware);
        $middleware->appendToGroup('api', $localeTimezoneMiddleware);

        $middleware->append(\App\Http\Middleware\GzipEncodeResponse::class);

        $middleware->appendToGroup('api', [
            \App\Http\Middleware\RefreshTokenExpiration::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'check.user_status' => \App\Http\Middleware\CheckUserStatus::class,
            'permission' => \App\Http\Middleware\PermissionMiddleware::class,
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'template.dependencies' => \App\Http\Middleware\CheckTemplateDependencies::class,
            'optional.sanctum' => \App\Http\Middleware\OptionalSanctumMiddleware::class,
            'start.api.session' => \App\Http\Middleware\StartApiSession::class,
            'seo' => \App\Seo\SeoMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => __('auth.unauthenticated')], 401)
                    ->withCookie(cookie()->forget(config('session.cookie')));
            }
        });
    })
    ->create();

return $app;
