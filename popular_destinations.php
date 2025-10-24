<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
// popular_destinations.php - API endpoint для получения популярных направлений

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Разрешить кросс-доменные запросы (по необходимости)

$host = 'MySQL-8.4';  // или 'MySQL-8.0' в зависимости от настроек
$db = 'aviasales_db';
$user = 'root';
$pass = '';            // обычно пустой пароль в Open Server
$charset = 'utf8mb4';

// Создаем DSN
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // ошибки в исключениях
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // ассоциативный массив
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    // SQL запрос для получения популярных направлений с названиями городов
    $sql = "
    SELECT 
        pd.id, 
        fc.name AS from_city,
        tc.name AS to_city,
        pd.min_price,
        pd.image_url,
        pd.description
    FROM popular_destinations pd
    JOIN cities fc ON pd.from_city_id = fc.id
    JOIN cities tc ON pd.to_city_id = tc.id
    WHERE pd.is_active = 1
    ORDER BY pd.sort_order ASC, pd.min_price ASC
    LIMIT 20
    ";

    $stmt = $pdo->query($sql);
    $results = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'count' => count($results),
        'data' => $results
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка подключения к базе данных: ' . $e->getMessage()
    ]);
    exit;
}
