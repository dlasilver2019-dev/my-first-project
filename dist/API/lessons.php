<?php
header('Access-Control-Allow-Origin: http://localhost:5173');  // ваш фронтенд
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
require_once 'config.php';

try {
    // Получаем параметры фильтрации
    $weekStart = $_GET['week_start'] ?? null;
    $weekEnd = $_GET['week_end'] ?? null;
    $groupId = $_GET['group_id'] ?? null;
    $teacherId = $_GET['teacher_id'] ?? null;

    // Строим WHERE условия
    $where = [];
    $params = [];

    if ($weekStart && $weekEnd) {
        $where[] = "l.date BETWEEN :week_start AND :week_end";
        $params[':week_start'] = $weekStart;
        $params[':week_end'] = $weekEnd;
    }

    if ($groupId) {
        $where[] = "l.group_id = :group_id";
        $params[':group_id'] = (int)$groupId;
    }

    if ($teacherId) {
        $where[] = "l.teacher_id = :teacher_id";
        $params[':teacher_id'] = (int)$teacherId;
    }

    // SQL запрос с JOIN для получения связанных данных
    $sql = "
        SELECT 
            l.id,
            l.date,
            l.lesson_num,
            g.name AS group_name,
            t.fullname AS teacher_name,
            d.name AS discipline_name,
            r.number AS room_number,
            lt.name AS lesson_type_name
        FROM lessons l
        JOIN `groups` g ON g.id = l.group_id
        JOIN teachers t ON t.id = l.teacher_id
        JOIN disciplines d ON d.id = l.discipline_id
        JOIN rooms r ON r.id = l.room_id
        LEFT JOIN lesson_types lt ON lt.id = l.lesson_type_id
    ";

    if (!empty($where)) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }

    $sql .= " ORDER BY l.date, l.lesson_num";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $lessons = $stmt->fetchAll();

    echo json_encode($lessons, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
