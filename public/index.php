<?php

$installedFlagPath = __DIR__ . '/../storage/app/g7_installed';
$envPath = __DIR__ . '/../.env';

$isInstalled = file_exists($installedFlagPath) || (
    file_exists($envPath) &&
    preg_match('/^INSTALLER_COMPLETED=true$/m', file_get_contents($envPath))
);

if (!$isInstalled) {
    $installUrl = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/install';
    echo '<script>
        alert("G7 최초 사용을 위해 설치 절차가 필요합니다. 설치 화면으로 이동합니다.");
        window.location.href="' . htmlspecialchars($installUrl) . '";
    </script>';
    exit;
}

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

$loader = require __DIR__.'/../vendor/autoload.php';

$extensionAutoloadFile = __DIR__.'/../bootstrap/cache/autoload-extensions.php';

if (file_exists($extensionAutoloadFile)) {
    define('G7_EXTENSION_AUTOLOAD_REGISTERED', true);
    $extensionAutoloads = require $extensionAutoloadFile;

    if (!empty($extensionAutoloads['psr4'])) {
        foreach ($extensionAutoloads['psr4'] as $namespace => $paths) {
            $paths = (array) $paths;
            foreach ($paths as $path) {
                $absolutePath = __DIR__.'/../'.$path;
                if (is_dir($absolutePath)) {
                    $loader->addPsr4($namespace, $absolutePath);
                }
            }
        }
    }

    if (!empty($extensionAutoloads['classmap'])) {
        foreach ($extensionAutoloads['classmap'] as $file) {
            $absolutePath = __DIR__.'/../'.$file;
            if (file_exists($absolutePath)) {
                require_once $absolutePath;
            }
        }
    }

    if (!empty($extensionAutoloads['files'])) {
        foreach ($extensionAutoloads['files'] as $file) {
            $absolutePath = __DIR__.'/../'.$file;
            if (file_exists($absolutePath)) {
                require_once $absolutePath;
            }
        }
    }

    if (!empty($extensionAutoloads['vendor_autoloads'])) {
        foreach ($extensionAutoloads['vendor_autoloads'] as $vendorAutoload) {
            $absolutePath = __DIR__.'/../'.$vendorAutoload;
            if (file_exists($absolutePath)) {
                require_once $absolutePath;
            }
        }
    }
}

$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
