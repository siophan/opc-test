<?php
// Copy this file to config.php and fill in real values.
// config.php is gitignored. Never commit it.

return [
    // MySQL connection. Use utf8mb4 — required for Chinese content.
    'db' => [
        'host'     => '127.0.0.1',
        'port'     => 3306,
        'database' => 'opc_assessments',
        'username' => 'opc_user',
        'password' => 'change-me',
        // Set to true if your remote MySQL requires TLS (RDS, Aliyun, PlanetScale, etc.)
        'ssl'      => false,
        // Optional: path to CA cert if your provider gives you one. Leave null to use system CAs.
        'ssl_ca'   => null,
    ],

    // Single admin account for the review console.
    'admin' => [
        'username' => 'admin',
        // For minimal setup we keep a plaintext password here — config.php is outside the
        // web root and gitignored. If you'd rather store a hash, replace this with the
        // output of: php -r "echo password_hash('your-password', PASSWORD_DEFAULT);"
        // and flip 'password_is_hash' to true.
        'password'         => 'change-me',
        'password_is_hash' => false,
    ],

    // Random string used to sign session cookies. Generate one with:
    //   php -r "echo bin2hex(random_bytes(32));"
    'session_secret' => 'replace-with-a-long-random-hex-string',

    // Cookie name for the admin session. Change if you host multiple instances on one domain.
    'session_name' => 'opc_admin',
];
