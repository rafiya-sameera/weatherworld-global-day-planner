
import { useEffect, useState } from "react";
import "./App.css";

const callCities = [
  { name: "Hyderabad", timeZone: "Asia/Kolkata" },
  { name: "London", timeZone: "Europe/London" },
  { name: "New York", timeZone: "America/New_York" },
  { name: "Tokyo", timeZone: "Asia/Tokyo" },
  { name: "Dubai", timeZone: "Asia/Dubai" },
];

function getWeatherDescription(code) {
  if (code === 0) return "Clear Sky";
  if ([1, 2].includes(code)) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rainy";
  if ([71, 73, 75, 77].includes(code)) return "Snowy";
  if ([80, 81, 82].includes(code)) return "Rain Showers";
  if ([85, 86].includes(code)) return "Snow Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather Update";
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([80, 81, 82].includes(code)) return "🌦️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌈";
}

function getWeatherBackground(code) {
  if (code === 0) return "sunny-weather";
  if ([1, 2].includes(code)) return "partly-cloudy-weather";
  if (code === 3) return "cloudy-weather";
  if ([45, 48].includes(code)) return "foggy-weather";

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return "rainy-weather";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "snowy-weather";
  }

  if ([95, 96, 99].includes(code)) return "stormy-weather";

  return "partly-cloudy-weather";
}

function getSmartSuggestion(code, temperature) {
  if ([95, 96, 99].includes(code)) {
    return {
      title: "Stay Safe Indoors ⛈️",
      message: "Thunderstorms may occur. Avoid outdoor activities.",
      tip: "Keep an umbrella ready and stay away from open areas.",
    };
  }

  if ([61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      title: "Carry Your Umbrella ☔",
      message: "Rain is expected. Plan your outdoor activities carefully.",
      tip: "A raincoat or umbrella can make your day easier.",
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      title: "Stay Warm ❄️",
      message: "Cold and snowy conditions are expected.",
      tip: "Wear warm clothes before heading outside.",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      title: "Drive Carefully 🌫️",
      message: "Fog may reduce visibility.",
      tip: "Allow extra travel time and use caution on the road.",
    };
  }

  if (temperature >= 35) {
    return {
      title: "Beat the Heat ☀️",
      message: "It is a hot day. Try to avoid strong afternoon sunlight.",
      tip: "Drink water regularly and wear light clothes.",
    };
  }

  if (code === 0) {
    return {
      title: "Enjoy the Sunshine ☀️",
      message: "A clear day is great for outdoor activities.",
      tip: "Remember sunscreen and stay hydrated.",
    };
  }

  if ([1, 2, 3].includes(code)) {
    return {
      title: "Enjoy the Fresh Air 🌤️",
      message: "A pleasant time for a walk or a short outing.",
      tip: "Keep a light jacket handy if needed.",
    };
  }

  return {
    title: "Have a Good Day 🌈",
    message: "Check the latest conditions before going out.",
    tip: "Stay comfortable and plan your day smartly.",
  };
}

function getCityTime(date, timeZone) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(date);
}

function getCityHour(date, timeZone) {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone,
    }).format(date)
  );
}

function getCityDate(date, timeZone) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone,
  }).format(date);
}

function findBestCallTime(city1, city2) {
  const now = new Date();

  for (let i = 1; i <= 7 * 24; i++) {
    const candidate = new Date(
      now.getTime() + i * 60 * 60 * 1000
    );

    const hour1 = getCityHour(candidate, city1.timeZone);
    const hour2 = getCityHour(candidate, city2.timeZone);

    if (
      hour1 >= 9 &&
      hour1 < 18 &&
      hour2 >= 9 &&
      hour2 < 18
    ) {
      return candidate;
    }
  }

  return null;
}

function App() {
  const [city, setCity] = useState("Hyderabad");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [currentTime, setCurrentTime] = useState(new Date());

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favoriteCities")) || [];
    } catch {
      return [];
    }
  });

  const [callCity1, setCallCity1] = useState("Hyderabad");
  const [callCity2, setCallCity2] = useState("London");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "favoriteCities",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  async function loadWeatherForLocation(location) {
    setLoading(true);
    setError("");
    setSearchResults([]);

    try {
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`
      );

      if (!weatherResponse.ok) {
        throw new Error("Unable to load weather information.");
      }

      const weatherData = await weatherResponse.json();

      setWeather({
        name: location.name,
        country: location.country || "",
        admin1: location.admin1 || "",
        latitude: location.latitude,
        longitude: location.longitude,
        timeZone: weatherData.timezone || "UTC",
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        wind: weatherData.current.wind_speed_10m,
        code: weatherData.current.weather_code,
        isDay: weatherData.current.is_day,
      });

      const daily = weatherData.daily.time.map((date, index) => ({
        date,
        code: weatherData.daily.weather_code[index],
        max: weatherData.daily.temperature_2m_max[index],
        min: weatherData.daily.temperature_2m_min[index],
      }));

      setForecast(daily);
      setCity(location.name);
      setCallCity1(location.name);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function getWeather(cityToSearch = city) {
    if (!cityToSearch.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setSearchResults([]);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityToSearch
        )}&count=10&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("Unable to search for this city.");
      }

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(
          "No matching location found. Try another city name."
        );
      }

      setSearchResults(geoData.results);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getWeather("Hyderabad");
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    getWeather(city);
  }

  function addFavorite() {
    if (!weather) return;

    const alreadyExists = favorites.some(
      (favorite) =>
        favorite.name.toLowerCase() === weather.name.toLowerCase() &&
        favorite.country === weather.country
    );

    if (!alreadyExists) {
      setFavorites((previous) => [
        ...previous,
        {
          name: weather.name,
          country: weather.country,
          admin1: weather.admin1,
          latitude: weather.latitude,
          longitude: weather.longitude,
        },
      ]);
    }
  }

  function removeFavorite(cityName) {
    setFavorites((previous) =>
      previous.filter((favorite) => favorite.name !== cityName)
    );
  }

  const suggestion = weather
    ? getSmartSuggestion(weather.code, weather.temperature)
    : null;

  const activityGuide = weather
    ? [95, 96, 99].includes(weather.code)
      ? {
          activity: "Choose indoor activities",
          hydration:
            "Keep devices charged and avoid exposed outdoor areas.",
        }
      : [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 85, 86].includes(
          weather.code
        )
      ? {
          activity: "Plan a flexible indoor day",
          hydration: "Carry rain protection if you need to go out.",
        }
      : weather.temperature >= 35
      ? {
          activity: "Prefer early morning or evening outings",
          hydration:
            "Drink water regularly and take breaks in shade.",
        }
      : [45, 48].includes(weather.code)
      ? {
          activity: "Keep travel plans unhurried",
          hydration:
            "Allow extra time and take care in low visibility.",
        }
      : {
          activity: "A short walk or outdoor break may be pleasant",
          hydration:
            "Keep water handy and use sun protection when needed.",
        }
    : null;

  const backgroundClass = weather
    ? getWeatherBackground(weather.code)
    : "partly-cloudy-weather";

  const availableCallCities = weather?.timeZone
    ? [
        {
          name: weather.name,
          timeZone: weather.timeZone,
        },
        ...callCities.filter(
          (item) =>
            item.name !== weather.name &&
            item.timeZone !== weather.timeZone
        ),
      ]
    : callCities;

  const firstCallCity = availableCallCities.find(
    (item) => item.name === callCity1
  );

  const secondCallCity = availableCallCities.find(
    (item) => item.name === callCity2
  );

  const bestCallTime =
    firstCallCity &&
    secondCallCity &&
    callCity1 !== callCity2
      ? findBestCallTime(firstCallCity, secondCallCity)
      : null;

  const fixedClocks = [
    {
      name: "Hyderabad",
      timeZone: "Asia/Kolkata",
      icon: "🇮🇳",
    },
    {
      name: "London",
      timeZone: "Europe/London",
      icon: "🇬🇧",
    },
    {
      name: "New York",
      timeZone: "America/New_York",
      icon: "🇺🇸",
    },
    {
      name: "Tokyo",
      timeZone: "Asia/Tokyo",
      icon: "🇯🇵",
    },
    {
      name: "Dubai",
      timeZone: "Asia/Dubai",
      icon: "🇦🇪",
    },
  ];

  const clocks = weather?.timeZone
    ? [
        {
          name: `${weather.name}${
            weather.country ? `, ${weather.country}` : ""
          }`,
          timeZone: weather.timeZone,
          icon: "📍",
        },
        ...fixedClocks.filter(
          (clock) => clock.timeZone !== weather.timeZone
        ),
      ]
    : fixedClocks;

  return (
    <div className={`app ${backgroundClass}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">🌍</span>
          <span>WeatherWorld</span>
        </div>

        <div className="live-clock">
          <span>🕒</span>
          {currentTime.toLocaleTimeString("en-IN")}
        </div>
      </header>

      <main className="container">
        <section className="welcome">
          <p className="eyebrow">YOUR GLOBAL DAY PLANNER</p>
          <h1>Explore the world, one day at a time.</h1>
          <p>
            Weather, world clocks, and smart daily planning in one place.
          </p>
        </section>

        <form className="search-bar" onSubmit={handleSearch}>
          <span>🔎</span>

          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Search any city..."
            aria-label="Search city"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {searchResults.length > 0 && (
          <section className="location-results">
            <h3>🌍 Select a location</h3>
            <p>
              Choose the correct city, state/region, and country.
            </p>

            <div className="location-results-list">
              {searchResults.map((location, index) => (
                <button
                  className="location-result"
                  key={`${location.latitude}-${location.longitude}-${index}`}
                  type="button"
                  onClick={() => loadWeatherForLocation(location)}
                  disabled={loading}
                >
                  <span>
                    <strong>{location.name}</strong>
                    <small>
                      {[location.admin1, location.country]
                        .filter(Boolean)
                        .join(", ")}
                    </small>
                  </span>

                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {weather && (
          <section className="weather-card">
            <div className="weather-main">
              <div>
                <p className="location-label">CURRENT WEATHER</p>

                <h2>
                  {weather.name}
                  {weather.admin1 ? `, ${weather.admin1}` : ""}
                  {weather.country ? `, ${weather.country}` : ""}
                </h2>

                <p className="weather-description">
                  {getWeatherDescription(weather.code)}
                </p>

                <div className="temperature">
                  {Math.round(weather.temperature)}°
                </div>

                <p className="feels-like">
                  Feels like {Math.round(weather.feelsLike)}°C
                </p>
              </div>

              <div className="weather-emoji">
                {getWeatherIcon(weather.code)}
              </div>
            </div>

            <div className="weather-details">
              <div className="detail-item">
                <span>💧</span>
                <div>
                  <small>Humidity</small>
                  <strong>{weather.humidity}%</strong>
                </div>
              </div>

              <div className="detail-item">
                <span>💨</span>
                <div>
                  <small>Wind Speed</small>
                  <strong>{weather.wind} km/h</strong>
                </div>
              </div>

              <div className="detail-item">
                <span>🌡️</span>
                <div>
                  <small>Feels Like</small>
                  <strong>
                    {Math.round(weather.feelsLike)}°C
                  </strong>
                </div>
              </div>
            </div>

            <button
              className="favorite-button"
              type="button"
              onClick={addFavorite}
            >
              ❤️ Add to Favorites
            </button>
          </section>
        )}

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PLAN AHEAD</p>
              <h2>7-Day Forecast</h2>
            </div>

            <span className="section-icon">📅</span>
          </div>

          <div className="forecast-grid">
            {forecast.map((day, index) => (
              <div className="forecast-card" key={day.date}>
                <p>
                  {index === 0
                    ? "Today"
                    : new Date(
                        `${day.date}T12:00:00`
                      ).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                </p>

                <span className="forecast-icon">
                  {getWeatherIcon(day.code)}
                </span>

                <div className="forecast-temperatures">
                  <span className="forecast-high">
                    <small>High</small>
                    <strong>{Math.round(day.max)}°C</strong>
                  </span>

                  <span className="forecast-low">
                    <small>Low</small>
                    <strong>{Math.round(day.min)}°C</strong>
                  </span>
                </div>

                <small>
                  {getWeatherDescription(day.code)}
                </small>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="favorites">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR SAVED PLACES</p>
              <h2>Favorite Cities ❤️</h2>
            </div>

            <span className="section-icon">📍</span>
          </div>

          {favorites.length === 0 ? (
            <div className="empty-state">
              No favorite cities yet. Add a city using the heart button.
            </div>
          ) : (
            <div className="favorites-grid">
              {favorites.map((favorite) => (
                <div
                  className="favorite-card"
                  key={`${favorite.name}-${favorite.country}`}
                >
                  <div>
                    <h3>📍 {favorite.name}</h3>
                    <p>{favorite.country}</p>
                  </div>

                  <div className="favorite-actions">
                    <button
                      type="button"
                      onClick={() =>
                        favorite.latitude != null &&
                        favorite.longitude != null
                          ? loadWeatherForLocation(favorite)
                          : getWeather(favorite.name)
                      }
                    >
                      Check
                    </button>

                    <button
                      className="remove-button"
                      type="button"
                      onClick={() =>
                        removeFavorite(favorite.name)
                      }
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">TIME AROUND THE WORLD</p>
              <h2>World Clock 🌐</h2>
            </div>

            <span className="section-icon">🕰️</span>
          </div>

          <div className="clock-grid">
            {clocks.map((clock) => (
              <div className="clock-card" key={clock.name}>
                <span className="clock-flag">
                  {clock.icon}
                </span>

                <h3>{clock.name}</h3>

                <strong>
                  {getCityTime(currentTime, clock.timeZone)}
                </strong>

                <small>
                  {getCityDate(currentTime, clock.timeZone)}
                </small>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">WORK SMARTER</p>
              <h2>Smart Day Planner ✨</h2>
            </div>
          </div>

          <div className="smart-grid">
            <div className="smart-card call-planner">
              <div className="smart-icon">📞</div>

              <h3>Best Time to Call</h3>

              <p className="call-subtitle">
                Find a suitable meeting time between two cities.
              </p>

              <div className="call-selectors">
                <label>
                  First City

                  <select
                    value={callCity1}
                    onChange={(event) =>
                      setCallCity1(event.target.value)
                    }
                  >
                    {availableCallCities.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Second City

                  <select
                    value={callCity2}
                    onChange={(event) =>
                      setCallCity2(event.target.value)
                    }
                  >
                    {availableCallCities.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {!firstCallCity || !secondCallCity ? (
                <p className="call-message">
                  Please select valid cities.
                </p>
              ) : callCity1 === callCity2 ? (
                <p className="call-message">
                  Please select two different cities.
                </p>
              ) : (
                <>
                  <div className="call-time-box">
                    <div>
                      <span>{callCity1}</span>

                      <strong>
                        {getCityTime(
                          currentTime,
                          firstCallCity.timeZone
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>{callCity2}</span>

                      <strong>
                        {getCityTime(
                          currentTime,
                          secondCallCity.timeZone
                        )}
                      </strong>
                    </div>
                  </div>

                  {bestCallTime ? (
                    <div className="call-result">
                      <h4>✨ Suggested Call Time</h4>

                      <p>
                        {callCity1}:{" "}
                        {getCityTime(
                          bestCallTime,
                          firstCallCity.timeZone
                        )}
                      </p>

                      <p>
                        {callCity2}:{" "}
                        {getCityTime(
                          bestCallTime,
                          secondCallCity.timeZone
                        )}
                      </p>

                      <small>
                        Both cities are within the 9 AM–6 PM working-hour
                        window.
                      </small>

                      <p className="call-date">
                        {getCityDate(
                          bestCallTime,
                          firstCallCity.timeZone
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="call-message">
                      No suitable working-hour overlap was found in the
                      next 7 days.
                    </p>
                  )}
                </>
              )}
            </div>

            {suggestion && (
              <div className="smart-card suggestion-card">
                <div className="smart-icon">🌤️</div>

                <h3>Weather Suggestions</h3>

                <p className="call-subtitle">
                  Based on current weather in{" "}
                  {weather?.name || city}
                </p>

                <h4>{suggestion.title}</h4>

                <p>{suggestion.message}</p>

                <div className="tip-box">
                  💡 {suggestion.tip}
                </div>

                {activityGuide && (
                  <div className="activity-guide">
                    <h4>Today's Activity Guide</h4>

                    <div className="activity-row">
                      <span>🚶</span>

                      <div>
                        <small>Activity idea</small>
                        <strong>
                          {activityGuide.activity}
                        </strong>
                      </div>
                    </div>

                    <div className="activity-row">
                      <span>💧</span>

                      <div>
                        <small>Daily reminder</small>
                        <strong>
                          {activityGuide.hydration}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="smart-card">
              <div className="smart-icon">❤️</div>

              <h3>My Favorite Places</h3>

              <p>
                You have saved {favorites.length}{" "}
                {favorites.length === 1 ? "city" : "cities"}.
              </p>

              <button
                className="planner-button"
                type="button"
                onClick={() =>
                  document
                    .getElementById("favorites")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Favorites
              </button>
            </div>
          </div>
        </section>

        <footer className="footer">
          <p>WeatherWorld 🌍</p>
          <span>Made with ❤️ by Rafiya Sameera</span>
          <small>Learn • Explore • Plan</small>
        </footer>
      </main>
    </div>
  );
}

export default App;