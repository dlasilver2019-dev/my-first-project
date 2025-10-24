<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require 'config.php';

try {
    $stmt = $pdo->query("SELECT id, name FROM disciplines ORDER BY name");
    $disciplines = $stmt->fetchAll();
    echo json_encode($disciplines, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сервера']);
}
