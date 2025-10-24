<?php
// Исправление CORS для credentials: include
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ['http://localhost:5173', 'http://localhost:3000', 'https://myservervisit'])) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Обработка preflight запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Подключение к базе данных
$host = 'MySQL-8.4';
$dbname = 'aviasales_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Ошибка подключения к базе данных'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Метод не поддерживается'
    ]);
    exit;
}

// Получение данных из запроса
$input = json_decode(file_get_contents('php://input'), true);

$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Валидация
if (empty($email) || empty($password)) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Введите email и пароль'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Некорректный email адрес'
    ]);
    exit;
}

try {
    // Ищем пользователя по email, включая роль
    $stmt = $pdo->prepare("
        SELECT id, email, password_hash, first_name, last_name, phone, role
        FROM users
        WHERE email = ? AND is_active = 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        echo json_encode([
            'status'  => 'error',
            'message' => 'Неверный email или пароль'
        ]);
        exit;
    }

    // Обновляем время последнего входа
    $update = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $update->execute([$user['id']]);

    // Создаём сессию
    session_start();
    $_SESSION['user_id']          = $user['id'];
    $_SESSION['user_email']       = $user['email'];
    $_SESSION['user_first_name']  = $user['first_name'];
    $_SESSION['user_last_name']   = $user['last_name'];
    $_SESSION['user_role']        = $user['role'];

    unset($user['password_hash']);

    echo json_encode([
        'status'  => 'success',
        'message' => 'Вход выполнен успешно',
        'user'    => $user
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status'  => 'error',
        'message' => 'Ошибка при входе в систему'
    ]);
}
?>
