// src/SearchForm.tsx

import React, { useState } from 'react';
import { AutocompleteInput } from './AutocompleteInput';
import { FlightResults } from './FlightResults';

type City = {
  id: number;
  name: string;
  iata_code?: string;
  country_id?: number;
};

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
  departure_time: string;
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

type ApiResponse = {
  status: string;
  message?: string;
  search_params: {
    from_city_id: number;
    to_city_id: number;
    depart_date: string;
    return_date?: string;
  };
  outbound_flights: {
    count: number;
    data: any[];
  };
  return_flights?: {
    count: number;
    data: any[];
  };
};

export const SearchForm: React.FC = () => {
  const [from, setFrom] = useState<City | null>(null);
  const [to, setTo] = useState<City | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState<any>(null);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const mapApiFlight = (apiFlights: any[]): Flight[] => {
    return apiFlights.map((f: any) => ({
      schedule_id: f.schedule_id,
      flight_number: f.flightnumber,
      airline_name: f.airline_name,
      airline_code: f.airline_code,
      from_city: f.from_city,
      to_city: f.to_city,
      departure_airport: f.departure_airport,
      departure_airport_code: f.departure_airport_code,
      arrival_airport: f.arrival_airport,
      arrival_airport_code: f.arrival_airport_code,
      departure_date: f.departuredate,
      departure_time: f.departuretime,
      arrival_date: f.arrivaldate,
      arrival_time: f.arrivaltime,
      price_economy: parseFloat(f.priceeconomy || '0'),
      price_business: f.pricebusiness ? parseFloat(f.pricebusiness) : undefined,
      price_first: f.pricefirst ? parseFloat(f.pricefirst) : undefined,
      seats_economy_available: f.seatseconomyavailable || 0,
      seats_business_available: f.seatsbusinessavailable || 0,
      seats_first_available: f.seatsfirstavailable || 0,
      duration_minutes: f.durationminutes || 0,
      distance_km: f.distancekm,
      aircraft_model: f.aircraft_model,
      status: f.status
    }));
  };

  const searchFlights = async (fromCity: City, toCity: City, departDate: string, returnDate?: string) => {
    const params = new URLSearchParams({
      from_city_id: fromCity.id.toString(),
      to_city_id: toCity.id.toString(),
      depart_date: departDate,
    });

    if (returnDate) {
      params.append('return_date', returnDate);
    }

    const response = await fetch(`http://myservervisit/public/api/flights_search.php?${params}`);
    const data: ApiResponse = await response.json();

    if (data.status !== 'success') {
      throw new Error(data.message || 'Ошибка при поиске рейсов');
    }

    return data;
  };

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    setError('');

    if (!from || !to) {
      setError('Выберите города отправления и назначения');
      return;
    }

    if (!dateFrom) {
      setError('Укажите дату вылета');
      return;
    }

    const today = new Date();
    const departureDate = new Date(dateFrom);
    if (departureDate < today) {
      setError('Дата вылета не может быть в прошлом');
      return;
    }

    setLoading(true);
    setSearchPerformed(true);

    try {
      const result = await searchFlights(from, to, dateFrom, dateTo || undefined);
      setFlights(mapApiFlight(result.outbound_flights.data));
      setReturnFlights(result.return_flights?.data ? mapApiFlight(result.return_flights.data) : []);
      setSearchParams(result.search_params);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при поиске');
      setFlights([]);
      setReturnFlights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="search-schedule">
        <form className="search-form" onSubmit={onSubmit}>
          <div className="search__row">
            <div className="field">
              <label className="field__label">Откуда</label>
              <AutocompleteInput
                value={from}
                onChange={setFrom}
                placeholder="Город отправления"
              />
            </div>
            <button type="button" className="swap" onClick={swap}>
              ⇄
            </button>
            <div className="field">
              <label className="field__label">Куда</label>
              <AutocompleteInput
                value={to}
                onChange={setTo}
                placeholder="Город назначения"
              />
            </div>
          </div>
          
          <div className="search__row">
            <div className="field">
              <label className="field__label">Дата вылета</label>
              <input
                type="date"
                className="field__input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="field">
              <label className="field__label">Обратная дата</label>
              <input
                type="date"
                className="field__input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <button type="submit" className="btn btn--primary">
              {loading ? 'Поиск...' : 'Найти билеты'}
            </button>
          </div>
        </form>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {searchPerformed && (
          <div className="search-results">
            {flights.length > 0 && (
              <div>
                <h3>Рейсы туда</h3>
                <FlightResults
                  flights={flights}
                  loading={loading}
                  searchParams={searchParams}
                />
              </div>
            )}

            {returnFlights.length > 0 && (
              <div>
                <h3>Обратные рейсы</h3>
                <FlightResults
                  flights={returnFlights}
                  loading={loading}
                  searchParams={searchParams}
                />
              </div>
            )}

            {!loading && flights.length === 0 && (
              <div className="search-no-results">
                <p>Рейсы не найдены. Попробуйте изменить параметры поиска.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchForm;
