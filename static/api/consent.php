<?php
// Registro anónimo de consentimientos de cookies (RGPD art. 7.1: poder demostrar el consentimiento).
//
// Guarda una línea JSON por elección en <carpeta del dominio>/private/consent/AAAA-MM.jsonl,
// FUERA de public_html, para que el despliegue (rsync --delete) no la borre y no sea accesible desde internet.
// Guarda: fecha, IP, ID aleatorio del navegador, versión del banner y elección. No guarda user-agent ni otras cabeceras.

declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function fin(int $code): void
{
    http_response_code($code);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    fin(405);
}

// Solo desde la propia web (los navegadores envían Origin en los POST).
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !preg_match('#^https://(www\.)?contratalux\.com$#', $origin) && !getenv('CONSENT_ALLOW_ANY_ORIGIN')) {
    fin(403);
}

$raw = file_get_contents('php://input', false, null, 0, 1025);
if ($raw === false || $raw === '' || strlen($raw) > 1024) {
    fin(400);
}

$d = json_decode($raw, true);
if (!is_array($d) || count($d) !== 5) {
    fin(400);
}
foreach (['id', 'v', 'a', 'd', 's'] as $k) {
    if (!array_key_exists($k, $d)) {
        fin(400);
    }
}
if (
    !is_string($d['id']) || !preg_match('/^[a-f0-9]{32}$/', $d['id']) ||
    !is_string($d['v']) || !preg_match('/^[A-Za-z0-9._-]{1,32}$/', $d['v']) ||
    !is_bool($d['a']) || !is_bool($d['d']) ||
    !in_array($d['s'], ['accept_all', 'reject_all', 'custom'], true)
) {
    fin(400);
}

// Carpeta: .../web/contratalux.com/private/consent (public_html/api -> subir dos niveles).
$dir = getenv('CONSENT_DIR') ?: dirname(__DIR__, 2) . '/private/consent';
if (!is_dir($dir) && !@mkdir($dir, 0750, true) && !is_dir($dir)) {
    fin(500);
}

// IP del visitante (prueba del consentimiento). Si PHP está detrás del nginx local de Hestia, la real viene en X-Real-IP.
$ip = $_SERVER['REMOTE_ADDR'] ?? '';
if (in_array($ip, ['127.0.0.1', '::1'], true) && !empty($_SERVER['HTTP_X_REAL_IP'])) {
    $ip = $_SERVER['HTTP_X_REAL_IP'];
}
if (!filter_var($ip, FILTER_VALIDATE_IP)) {
    $ip = '';
}

date_default_timezone_set('Europe/Madrid');
$file = $dir . '/' . date('Y-m') . '.jsonl';

// Tope de seguridad por mes (evita llenar el disco si alguien envía datos en masa).
if (is_file($file) && filesize($file) > 50 * 1024 * 1024) {
    fin(503);
}

$linea = json_encode(
    ['t' => date('c'), 'ip' => $ip, 'id' => $d['id'], 'v' => $d['v'], 'a' => $d['a'], 'd' => $d['d'], 's' => $d['s']],
    JSON_UNESCAPED_SLASHES
) . "\n";

$nuevo = !is_file($file);
if (@file_put_contents($file, $linea, FILE_APPEND | LOCK_EX) === false) {
    fin(500);
}
if ($nuevo) {
    @chmod($file, 0640);
    // Retención: al empezar un mes nuevo se borran los archivos de hace más de 24 meses.
    $limite = date('Y-m', strtotime('first day of -24 months'));
    foreach (glob($dir . '/*.jsonl') ?: [] as $viejo) {
        if (basename($viejo, '.jsonl') < $limite) {
            @unlink($viejo);
        }
    }
}

fin(204);
