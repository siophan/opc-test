<?php
// Shared bootstrap for every endpoint in this directory:
//   - load config (lives outside web root)
//   - open a PDO connection (utf8mb4, exception mode)
//   - ensure the opc_assessments table exists
//   - start the admin session
//   - expose helpers: jsonResponse(), readJsonBody(), isAdmin(), requireAdmin()

declare(strict_types=1);

ini_set('display_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function jsonResponse(int $status, $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

set_exception_handler(function (Throwable $e): void {
    error_log('[opc] ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
    jsonResponse(500, ['error' => 'internal_error']);
});

$configPath = __DIR__ . '/../../config.php';
if (!is_file($configPath)) {
    jsonResponse(500, ['error' => 'config_missing', 'hint' => 'Copy config.example.php to config.php']);
}
$config = require $configPath;

// --- Session ---------------------------------------------------------------
// Sign cookies with the configured secret so a leaked DB dump can't forge them.
session_name($config['session_name'] ?? 'opc_admin');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
if (!empty($_SERVER['HTTPS'])) {
    ini_set('session.cookie_secure', '1');
}
session_start();

// --- PDO -------------------------------------------------------------------
function pdo(array $config): PDO
{
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $db = $config['db'];
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $db['host'], (int)$db['port'], $db['database']
    );
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    if (!empty($db['ssl'])) {
        $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = true;
        if (!empty($db['ssl_ca'])) {
            $options[PDO::MYSQL_ATTR_SSL_CA] = $db['ssl_ca'];
        }
    }
    $pdo = new PDO($dsn, $db['username'], $db['password'], $options);
    return $pdo;
}

function ensureSchema(PDO $pdo): void
{
    // Idempotent. Safe to run on every request — MySQL short-circuits when the table exists.
    $pdo->exec(<<<'SQL'
        CREATE TABLE IF NOT EXISTS opc_assessments (
            id                 CHAR(36)     NOT NULL PRIMARY KEY,
            candidate_name     VARCHAR(128) NOT NULL,
            contact            VARCHAR(128) NOT NULL DEFAULT '',
            email              VARCHAR(255) NOT NULL DEFAULT '',
            wechat_id          VARCHAR(128) NOT NULL DEFAULT '',
            city               VARCHAR(128) NOT NULL DEFAULT '',
            industry           VARCHAR(128) NOT NULL DEFAULT '',
            role               VARCHAR(128) NOT NULL DEFAULT '',
            experience_years   INT          NOT NULL DEFAULT 0,
            ai_self_level      VARCHAR(64)  NOT NULL DEFAULT '',
            tools_used         JSON         NULL,
            business_goal      TEXT         NULL,
            survey_score       INT          NOT NULL DEFAULT 0,
            exam_score         INT          NOT NULL DEFAULT 0,
            total_score        INT          NOT NULL DEFAULT 0,
            classification     VARCHAR(64)  NOT NULL DEFAULT '',
            opc_fit            VARCHAR(255) NOT NULL DEFAULT '',
            recommended_track  TEXT         NULL,
            answers            JSON         NULL,
            submitted_at       DATETIME     NULL,
            created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created_at (created_at),
            INDEX idx_classification (classification)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    SQL);
}

ensureSchema(pdo($config));

// --- Auth ------------------------------------------------------------------
function isAdmin(): bool
{
    return !empty($_SESSION['admin']) && $_SESSION['admin'] === true;
}

function requireAdmin(): void
{
    if (!isAdmin()) {
        jsonResponse(401, ['error' => 'unauthorized']);
    }
}

// --- Body parsing ----------------------------------------------------------
function readJsonBody(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') return [];
    try {
        $data = json_decode($raw, true, 64, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        jsonResponse(400, ['error' => 'invalid_json']);
    }
    return is_array($data) ? $data : [];
}

function uuidV4(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
    $hex = bin2hex($bytes);
    return substr($hex, 0, 8) . '-' . substr($hex, 8, 4) . '-'
         . substr($hex, 12, 4) . '-' . substr($hex, 16, 4) . '-' . substr($hex, 20);
}
