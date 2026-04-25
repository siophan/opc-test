<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    jsonResponse(405, ['error' => 'method_not_allowed']);
}

if (!isAdmin()) {
    jsonResponse(401, ['error' => 'unauthorized']);
}

jsonResponse(200, [
    'admin' => true,
    'username' => $_SESSION['admin_user'] ?? '',
]);
