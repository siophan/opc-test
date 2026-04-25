<?php
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    jsonResponse(405, ['error' => 'method_not_allowed']);
}

$body = readJsonBody();
$username = (string)($body['username'] ?? '');
$password = (string)($body['password'] ?? '');

$admin = $config['admin'];
$userOk = hash_equals((string)$admin['username'], $username);
$passOk = !empty($admin['password_is_hash'])
    ? password_verify($password, (string)$admin['password'])
    : hash_equals((string)$admin['password'], $password);

if (!$userOk || !$passOk) {
    // Constant-ish delay to blunt naive brute force.
    usleep(300_000);
    jsonResponse(401, ['error' => 'invalid_credentials']);
}

session_regenerate_id(true);
$_SESSION['admin'] = true;
$_SESSION['admin_user'] = $admin['username'];

jsonResponse(200, ['ok' => true, 'username' => $admin['username']]);
