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
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDO\Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка подключения к базе данных'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Метод не поддерживается'
    ]);
    exit;
}

// Получение данных из запроса
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Некорректные данные'
    ]);
    exit;
}

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$first_name = trim($input['first_name'] ?? '');
$last_name = trim($input['last_name'] ?? '');
$phone = trim($input['phone'] ?? '');

// Валидация
if (empty($email) || empty($password) || empty($first_name) || empty($last_name)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Заполните все обязательные поля'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Некорректный email адрес'
    ]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Пароль должен содержать минимум 6 символов'
    ]);
    exit;
}

try {
    // Проверяем, не существует ли уже пользователь с таким email
    $check_user = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $check_user->execute([$email]);

    if ($check_user->fetchColumn()) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Пользователь с таким email уже существует'
        ]);
        exit;
    }

    // Создаем нового пользователя
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    $insert_user = $pdo->prepare("
        INSERT INTO users (email, password_hash, first_name, last_name, phone, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
    ");

    $insert_user->execute([
        $email,
        $password_hash,
        $first_name,
        $last_name,
        $phone ?: null
    ]);

    $user_id = $pdo->lastInsertId();

    // Получаем данные созданного пользователя
    $get_user = $pdo->prepare("
        SELECT id, email, first_name, last_name, phone, created_at 
        FROM users 
        WHERE id = ?
    ");
    $get_user->execute([$user_id]);
    $user = $get_user->fetch();

    // Создаем сессию
    session_start();
    $_SESSION['user_id'] = $user_id;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_first_name'] = $first_name;
    $_SESSION['user_last_name'] = $last_name;

    echo json_encode([
        'status' => 'success',
        'message' => 'Регистрация успешна',
        'user' => $user
    ]);

} catch (PDO\Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка при создании пользователя'
    ]);
}
?>