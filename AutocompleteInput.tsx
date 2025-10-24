// src/AutocompleteInput.tsx
import React, { useEffect, useRef, useState } from 'react';

type City = {
  id: number;
  name: string;
  iatacode?: string;
  countryid?: number;
};

type Props = {
  label: string;
  placeholder?: string;
  value: City | null;
  onChange: (city: City | null) => void;
  apiUrl?: string;
};

export const AutocompleteInput: React.FC<Props> = ({
  label,
  placeholder = 'Город',
  value,
  onChange,
  apiUrl = 'http://myservervisit/public/api/cities_autocomplete.php',
}) => {
  const [query, setQuery] = useState(value?.name ?? '');
  const [list, setList] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  // Простая реализация дебаунса
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (debouncedQuery.trim().length < 1) {
      setList([]);
      return;
    }
    let aborted = false;
    setLoading(true);
    fetch(`${apiUrl}?q=${encodeURIComponent(debouncedQuery)}`, {
      method: 'GET',
    })
      .then((r) => r.json())
      .then((data) => {
        if (aborted) return;
        setList(Array.isArray(data?.data) ? data.data : []);
        setOpen(true);
      })
      .catch(() => {
        if (aborted) return;
        setList([]);
        setOpen(false);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });
    return () => {
      aborted = true;
    };
  }, [debouncedQuery, apiUrl]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSelect = (c: City) => {
    onChange(c);
    setQuery(c.name);
    setOpen(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlight >= 0 && list[highlight]) handleSelect(list[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="field" ref={boxRef}>
      <span className="field__label">{label}</span>
      <div className="autocomplete">
        <input
          className="field__input"
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => list.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          autoComplete="off"
        />
        {open && (loading || list.length > 0) && (
          <div className="autocomplete__panel">
            {loading && <div className="autocomplete__empty">Загрузка...</div>}
            {!loading && list.length === 0 && (
              <div className="autocomplete__empty">Ничего не найдено</div>
            )}
            {!loading && list.length > 0 && (
              <ul className="autocomplete__list">
                {list.map((c, i) => (
                  <li
                    key={c.id}
                    className={
                      'autocomplete__item ' + (i === highlight ? 'is-active' : '')
                    }
                    onMouseEnter={() => setHighlight(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(c)}
                  >
                    <span className="autocomplete__name">
                      {c.name}
                      {c.iatacode ? ` (${c.iatacode})` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Локальный hook-дебаунс без внешних зависимостей
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
