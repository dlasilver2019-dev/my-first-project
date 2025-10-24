<?php
// flights_search.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

// DB config
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
// Input params
$from_city_id = intval($_GET['from_city_id'] ?? 0);
$to_city_id   = intval($_GET['to_city_id']   ?? 0);
$depart_date  = $_GET['depart_date']  ?? '';
$return_date  = $_GET['return_date']  ?? '';

// Validate
if (!$from_city_id || !$to_city_id || !preg_match('/^\d{4}-\d{2}-\d{2}$/',$depart_date)) {
  echo json_encode(['status'=>'error','message'=>'Неверные параметры'], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $pdo = new PDO($dsn,$user,$pass,$options);

  // Outbound flights
  $sql = "
  SELECT
    fs.id AS schedule_id,
    f.flight_number AS flightnumber,
    al.name AS airline_name,
    al.iata_code AS airline_code,
    c1.name AS from_city,
    c2.name AS to_city,
    ap1.name AS departure_airport,
    ap1.iata_code AS departure_airport_code,
    ap2.name AS arrival_airport,
    ap2.iata_code AS arrival_airport_code,
    fs.departure_date AS departuredate,
    fs.departure_time AS departuretime,
    fs.arrival_date AS arrivaldate,
    fs.arrival_time AS arrivaltime,
    fs.price_economy AS priceeconomy,
    fs.price_business AS pricebusiness,
    fs.price_first AS pricefirst,
    fs.seats_economy_available AS seatseconomyavailable,
    fs.seats_business_available AS seatsbusinessavailable,
    fs.seats_first_available AS seatsfirstavailable,
    f.duration_minutes AS durationminutes,
    f.distance_km AS distancekm,
    at.model AS aircraft_model,
    fs.status
  FROM flight_schedules fs
  JOIN flights f ON fs.flight_id = f.id
  JOIN airlines al ON f.airline_id = al.id
  JOIN airports ap1 ON f.departure_airport_id = ap1.id
  JOIN airports ap2 ON f.arrival_airport_id = ap2.id
  JOIN cities c1 ON ap1.city_id = c1.id
  JOIN cities c2 ON ap2.city_id = c2.id
  LEFT JOIN aircraft_types at ON f.aircraft_type_id = at.id
  WHERE
    c1.id = :from_city_id
    AND c2.id = :to_city_id
    AND fs.departure_date = :depart_date
    AND fs.status IN ('scheduled','boarding')
    AND (
      fs.seats_economy_available > 0
      OR fs.seats_business_available > 0
      OR fs.seats_first_available > 0
    )
    AND f.is_active = 1
  ORDER BY fs.departure_time ASC, fs.price_economy ASC
  LIMIT 50
";


  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ':from_city_id' => $from_city_id,
    ':to_city_id'   => $to_city_id,
    ':depart_date'  => $depart_date,
  ]);
  $outbound = $stmt->fetchAll();

  $response = [
    'status'         => 'success',
    'search_params'  => compact('from_city_id','to_city_id','depart_date','return_date'),
    'outbound_flights'=> ['count'=>count($outbound),'data'=>$outbound],
  ];

  // Return flights if date provided
  if (preg_match('/^\d{4}-\d{2}-\d{2}$/',$return_date)) {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
      ':from_city_id' => $to_city_id,
      ':to_city_id'   => $from_city_id,
      ':depart_date'  => $return_date,
    ]);
    $return = $stmt->fetchAll();
    $response['return_flights'] = ['count'=>count($return),'data'=>$return];
  }

  echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['status'=>'error','message'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
}
