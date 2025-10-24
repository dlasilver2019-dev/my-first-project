<?php
header('Access-Control-Allow-Origin: http://localhost:5173');  // ваш фронтенд
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}require 'config.php';
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit;
}

parse_str(file_get_contents('php://input'), $input);

if (!isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing id']);
    exit;
}

$sql = "DELETE FROM lessons WHERE id = :id";
$stmt = $pdo->prepare($sql);
$stmt->execute([':id' => $input['id']]);

echo json_encode(['success' => true]);
