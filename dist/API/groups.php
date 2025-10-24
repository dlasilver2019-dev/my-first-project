<?php
header('Access-Control-Allow-Origin: http://localhost:5173');  // ваш фронтенд
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT id, name FROM `groups` ORDER BY name");
    $groups = $stmt->fetchAll();
    
    echo json_encode($groups, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
