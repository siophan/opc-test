<?php
// Handles the frontend's `tables/opc_assessments` endpoint.
//   POST  — public; user-side submission (ui/app.js)
//   GET   — admin only; review console list (ui/admin.js)

declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    handleCreate(pdo($config));
} elseif ($method === 'GET') {
    requireAdmin();
    handleList(pdo($config));
} else {
    header('Allow: GET, POST');
    jsonResponse(405, ['error' => 'method_not_allowed']);
}

function handleCreate(PDO $pdo): void
{
    $body = readJsonBody();

    // Whitelist columns. Anything else in the payload is dropped silently —
    // the frontend already sends exactly these fields.
    $id = uuidV4();
    $row = [
        'id'                => $id,
        'candidate_name'    => trim((string)($body['candidate_name'] ?? '')),
        'contact'           => trim((string)($body['contact'] ?? '')),
        'email'             => trim((string)($body['email'] ?? '')),
        'wechat_id'         => trim((string)($body['wechat_id'] ?? '')),
        'city'              => trim((string)($body['city'] ?? '')),
        'industry'          => trim((string)($body['industry'] ?? '')),
        'role'              => trim((string)($body['role'] ?? '')),
        'experience_years'  => (int)($body['experience_years'] ?? 0),
        'ai_self_level'     => (string)($body['ai_self_level'] ?? ''),
        'tools_used'        => json_encode($body['tools_used'] ?? [], JSON_UNESCAPED_UNICODE),
        'business_goal'     => (string)($body['business_goal'] ?? ''),
        'survey_score'      => (int)($body['survey_score'] ?? 0),
        'exam_score'        => (int)($body['exam_score'] ?? 0),
        'total_score'       => (int)($body['total_score'] ?? 0),
        'classification'    => (string)($body['classification'] ?? ''),
        'opc_fit'           => (string)($body['opc_fit'] ?? ''),
        'recommended_track' => (string)($body['recommended_track'] ?? ''),
        // `answers` is already a JSON string from the frontend; pass through as-is.
        'answers'           => (string)($body['answers'] ?? '{}'),
        'submitted_at'      => normalizeDateTime($body['submitted_at'] ?? null),
    ];

    if ($row['candidate_name'] === '') {
        jsonResponse(400, ['error' => 'candidate_name_required']);
    }

    $cols = array_keys($row);
    $placeholders = array_map(fn($c) => ':' . $c, $cols);
    $sql = 'INSERT INTO opc_assessments (' . implode(',', $cols) . ') VALUES (' . implode(',', $placeholders) . ')';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($row);

    jsonResponse(201, ['id' => $id]);
}

function handleList(PDO $pdo): void
{
    $page  = max(1, (int)($_GET['page'] ?? 1));
    $limit = max(1, min(500, (int)($_GET['limit'] ?? 100)));
    $offset = ($page - 1) * $limit;

    // Whitelist sortable columns. Default mirrors the frontend's `?sort=-created_at`.
    $sortRaw = (string)($_GET['sort'] ?? '-created_at');
    $direction = 'DESC';
    $col = $sortRaw;
    if (str_starts_with($sortRaw, '-')) {
        $col = substr($sortRaw, 1);
        $direction = 'DESC';
    } elseif (str_starts_with($sortRaw, '+')) {
        $col = substr($sortRaw, 1);
        $direction = 'ASC';
    } else {
        $direction = 'ASC';
    }
    $allowedSort = ['created_at', 'submitted_at', 'total_score', 'exam_score'];
    if (!in_array($col, $allowedSort, true)) {
        $col = 'created_at';
        $direction = 'DESC';
    }

    $stmt = $pdo->prepare("SELECT * FROM opc_assessments ORDER BY {$col} {$direction} LIMIT :limit OFFSET :offset");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    foreach ($rows as &$r) {
        // tools_used is stored as JSON; admin.js expects an array.
        $r['tools_used'] = $r['tools_used'] !== null ? json_decode($r['tools_used'], true) : [];
        // answers stays as a JSON string — admin.js re-parses it for the detail panel.
    }
    unset($r);

    $total = (int)$pdo->query('SELECT COUNT(*) FROM opc_assessments')->fetchColumn();

    jsonResponse(200, [
        'data'  => $rows,
        'page'  => $page,
        'limit' => $limit,
        'total' => $total,
    ]);
}

function normalizeDateTime($value): ?string
{
    if (!is_string($value) || $value === '') return null;
    $ts = strtotime($value);
    return $ts === false ? null : date('Y-m-d H:i:s', $ts);
}
