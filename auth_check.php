<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

session_start();
if (!isset($_SESSION['user_id'])) {
  echo json_encode(['status'=>'error','message'=>'Не авторизован']);
  exit;
}

$host='127.0.0.1'; $port=3306; $dbname='aviasales_db'; $u='root'; $p='';

try {
  $pdo=new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $u, $p,
    [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
} catch(PDOException $e) {
  echo json_encode(['status'=>'error','message'=>'DB error']);
  exit;
}

$stmt=$pdo->prepare("SELECT id,email,first_name,last_name,phone,role FROM users WHERE id=?");
$stmt->execute([$_SESSION['user_id']]);
$user=$stmt->fetch();

if (!$user) {
  echo json_encode(['status'=>'error','message'=>'Пользователь не найден']);
  exit;
}

echo json_encode(['status'=>'success','user'=>$user]);
?>
