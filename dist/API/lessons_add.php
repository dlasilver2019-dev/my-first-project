<?php
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// CORS и preflight запрос
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'config.php';

// Разрешаем только POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

// Получаем и декодируем JSON-тело
$input = json_decode(file_get_contents('php://input'), true);

// Валидация полей
$fields = ['date', 'lesson_num', 'group_id', 'teacher_id', 'discipline_id', 'room_id', 'lesson_type_id'];
foreach ($fields as $field) {
    if (empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing field: $field"]);
        exit();
    }
}

// Запрос добавления урока
$sql = "INSERT INTO lessons (date, lesson_num, group_id, teacher_id, discipline_id, room_id, lesson_type_id)
        VALUES (:date, :lesson_num, :group_id, :teacher_id, :discipline_id, :room_id, :lesson_type_id)";
$stmt = $pdo->prepare($sql);
$res = $stmt->execute([
    ':date' => $input['date'],
    ':lesson_num' => $input['lesson_num'],
    ':group_id' => $input['group_id'],
    ':teacher_id' => $input['teacher_id'],
    ':discipline_id' => $input['discipline_id'],
    ':room_id' => $input['room_id'],
    ':lesson_type_id' => $input['lesson_type_id'],
]);

if ($res) {
    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to add lesson']);
}
?>
