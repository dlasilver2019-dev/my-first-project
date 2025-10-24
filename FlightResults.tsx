// src/FlightResults.tsx

import React from 'react';

type Flight = {
  schedule_id: number;
  flight_number: string;
  airline_name: string;
  airline_code: string;
  from_city: string;
  to_city: string;
  departure_airport: string;
  departure_airport_code: string;
  arrival_airport: string;
  arrival_airport_code: string;
  departure_date: string;
  departure_time: string; // "HH:mm:ss" or maybe empty
  arrival_date: string;
  arrival_time: string;
  price_economy: number;
  price_business?: number;
  price_first?: number;
  seats_economy_available: number;
  seats_business_available: number;
  seats_first_available: number;
  duration_minutes: number;
  distance_km?: number;
  aircraft_model?: string;
  status: string;
};

type Props = {
  flights: Flight[];
  loading: boolean;
  searchParams?: {
    from_city_id: number;
    to_city_id: number;
    depart_date: string;
    return_date?: string;
  };
};

const formatTime = (time?: string) => {
  if (!time) return '';
  return time.length >= 5 ? time.substring(0, 5) : time;
};

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}ч ${mins}м`;
};

const formatPrice = (price?: number) => {
  if (price == null || isNaN(price)) return '—';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
};

export const FlightResults: React.FC<Props> = ({ flights, loading, searchParams }) => {
  if (loading) {
    return (
      <div className="flight-results">
        <div className="flight-results__loading">Поиск рейсов...</div>
      </div>
    );
  }

  if (!flights.length) {
    return (
      <div className="flight-results">
        <div className="flight-results__empty">
          <h3>Рейсы не найдены</h3>
          <p>Попробуйте изменить параметры поиска или выбрать другую дату.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flight-results">
      <div className="flight-results__header">
        <h2>Найдено рейсов: {flights.length}</h2>
        {searchParams && (
          <p className="flight-results__info">
            Рейсы на {searchParams.depart_date}
            {searchParams.return_date && ` (обратно: ${searchParams.return_date})`}
          </p>
        )}
      </div>

      <div className="flight-results__list">
        {flights.map((flight) => (
          <div key={flight.schedule_id} className="flight-card">
            <div className="flight-card__header">
              <div className="flight-card__airline">
                <span className="flight-card__airline-code">{flight.airline_code}</span>
                <span className="flight-card__airline-name">{flight.airline_name}</span>
                <span className="flight-card__flight-number">{flight.flight_number}</span>
              </div>
              {flight.aircraft_model && (
                <div className="flight-card__aircraft">
                  <span className="flight-card__aircraft-model">{flight.aircraft_model}</span>
                </div>
              )}
            </div>

            <div className="flight-card__route">
              <div className="flight-card__departure">
                <div className="flight-card__time">{formatTime(flight.departure_time)}</div>
                <div className="flight-card__airport">
                  <div className="flight-card__city">{flight.from_city}</div>
                  <div className="flight-card__airport-code">{flight.departure_airport_code}</div>
                </div>
              </div>

              <div className="flight-card__duration">
                <div className="flight-card__duration-line"></div>
                <div className="flight-card__duration-text">{formatDuration(flight.duration_minutes)}</div>
                {flight.distance_km && (
                  <div className="flight-card__distance">{flight.distance_km} км</div>
                )}
              </div>

              <div className="flight-card__arrival">
                <div className="flight-card__time">{formatTime(flight.arrival_time)}</div>
                <div className="flight-card__airport">
                  <div className="flight-card__city">{flight.to_city}</div>
                  <div className="flight-card__airport-code">{flight.arrival_airport_code}</div>
                </div>
              </div>
            </div>

            <div className="flight-card__bottom">
              <div className="flight-card__prices">
                <div className="flight-card__price flight-card__price--economy">
                  <span className="flight-card__price-label">Эконом</span>
                  <span className="flight-card__price-value">{formatPrice(flight.price_economy)}</span>
                  <span className="flight-card__seats">
                    {flight.seats_economy_available > 0
                      ? `${flight.seats_economy_available} мест`
                      : 'Нет мест'}
                  </span>
                </div>

                {flight.price_business !== undefined && (
                  <div className="flight-card__price flight-card__price--business">
                    <span className="flight-card__price-label">Бизнес</span>
                    <span className="flight-card__price-value">{formatPrice(flight.price_business)}</span>
                    <span className="flight-card__seats">
                      {flight.seats_business_available > 0
                        ? `${flight.seats_business_available} мест`
                        : 'Нет мест'}
                    </span>
                  </div>
                )}

                {flight.price_first !== undefined && (
                  <div className="flight-card__price flight-card__price--first">
                    <span className="flight-card__price-label">Первый</span>
                    <span className="flight-card__price-value">{formatPrice(flight.price_first)}</span>
                    <span className="flight-card__seats">
                      {flight.seats_first_available > 0
                        ? `${flight.seats_first_available} мест`
                        : 'Нет мест'}
                    </span>
                  </div>
                )}
              </div>
              <button className="flight-card__select-btn btn btn--primary">Выбрать</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightResults;
