<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }

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


$q = isset($_GET['q']) ? trim($_GET['q']) : '';
if ($q === '' || mb_strlen($q) < 1) {
  echo json_encode(['status'=>'success','count'=>0,'data'=>[]], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $pdo = new PDO($dsn, $user, $pass, $options);
 $sql = "SELECT cities.id, cities.name, cities.iata_code, cities.country_id, countries.name AS country
        FROM cities
        LEFT JOIN countries ON cities.country_id = countries.id
        WHERE cities.name LIKE :prefix
        ORDER BY cities.is_popular DESC, cities.name ASC
        LIMIT 10";

  $stmt = $pdo->prepare($sql);
  $prefix = $q . '%';
  $stmt->bindParam(':prefix', $prefix, PDO::PARAM_STR);
  $stmt->execute();
  $rows = $stmt->fetchAll();
  echo json_encode(['status'=>'success','count'=>count($rows),'data'=>$rows], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['status'=>'error','message'=>$e->getMessage()]);
}