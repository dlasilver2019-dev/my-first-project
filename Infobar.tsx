import React, { useEffect, useState } from 'react';

interface AppProps {
  title?: string;
}

interface Destination {
  id: number | string;
  from_city: string;
  to_city: string;
  min_price: number;
  image_url?: string;
  description?: string;
}

interface ApiResponse {
  status: string;
  count: number;
  data: Destination[];
}

export const Infobar: React.FC<AppProps> = ({ title = "Популярные направления" }) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://myservervisit/public/api/popular_destinations.php')
      .then(r => r.json())
      .then((d: ApiResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки популярных направлений:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="popular-destinations-loading">Загрузка популярных направлений...</div>;
  }
  
  if (!data || !data.data || data.data.length === 0) {
    return <div className="popular-destinations-error">Популярные направления временно недоступны</div>;
  }

  return (
    <section className="popular-destinations">
      <div className="container">
        <h2 className="popular-destinations__title">{title}</h2>
        <div className="popular-destinations__cards">
          {data.data.slice(0, 6).map((item: Destination) => (
            <div className="destination-card" key={item.id}>
              <img 
                className="destination-card__image" 
                src={item.image_url || `http://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&q=80`}
                alt={`${item.from_city} - ${item.to_city}`} 
              />
              <div className="destination-card__info">
                <div className="destination-card__route">
                  {item.from_city} → {item.to_city}
                </div>
                <div className="destination-card__price">
                  <span className="plane-icon">✈️</span> 
                  от {item.min_price.toLocaleString()} ₽
                </div>
                {item.description && (
                  <div className="destination-card__description">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Показать больше направлений - кнопка */}
        {data.count > 6 && (
          <div className="popular-destinations__actions">
            <button className="btn btn--outline">
              Показать все направления ({data.count})
            </button>
          </div>
        )}
        
        <div className="popular-destinations__arrows">
          <button className="arrow-btn arrow-btn--left" title="Предыдущие">‹</button>
          <button className="arrow-btn arrow-btn--right" title="Следующие">›</button>
        </div>
      </div>
    </section>
  );
};

export default Infobar;
