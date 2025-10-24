<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

require 'config.php';

try {
    $stmt = $pdo->query("SELECT id, number AS name FROM rooms ORDER BY number");
    $rooms = $stmt->fetchAll();
    echo json_encode($rooms, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сервера']);
}
