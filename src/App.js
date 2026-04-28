import { useState } from "react";
import "./App.css";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [advice, setAdvice] = useState("");

  const API = process.env.REACT_APP_WEATHER_API_KEY;

  // 🔍 SEARCH FIX
  const getWeather = async (customCity) => {
    const q = (customCity || city).trim();
    if (!q) return;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${q},IN&appid=${API}&units=metric`
      );

      const data = await res.json();

      if (data.cod !== 200) {
        alert("City not found ❌");
        return;
      }

      setWeather(data);
      setAdvice(generateAdvice(data));
      getForecast(data.name);
    } catch {
      alert("Error fetching weather 😅");
    }
  };

  const getForecast = async (cityName) => {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API}&units=metric`
    );
    const data = await res.json();
    setForecast(data);
  };

  // 📍 LOCATION FIX
  const getLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API}&units=metric`
      );

      const data = await res.json();

      setWeather(data);
      setAdvice(generateAdvice(data));
      getForecast(data.name);
    });
  };

  // 😂 SUPER FUNNY ADVICE (UPGRADED)
  const generateAdvice = (data) => {
    const temp = data.main.temp;
    const type = data.weather[0].main;

    if (type.includes("Rain"))
      return "Free shower chal raha 😂🌧\nPhone ko bhi raincoat pehna de bhai 😭📱";

    if (type.includes("Clouds"))
      return "Sky ne blanket le liya ☁️😂\nTu bhi thoda chill maar 😎";

    if (temp >= 40)
      return "Bhai tu oven me reh raha hai 🔥😂\nBahar gaya = roasted human 🍗";

    if (temp >= 30)
      return "AC dhund warna tu pighal jayega 😂🥵\nPaani peete reh warna jal jayga 💀";

    if (temp >= 20)
      return "Perfect weather 😎\nCrush ko message maar de 😏🔥";

    return "Thand itni ki fridge jealous ho gaya 🥶😂\nJacket pehen warna statue ban jayega 🧊";
  };

  const chartData =
    forecast?.list && weather
      ? {
          labels: forecast.list.slice(0, 8).map((i) =>
            new Date(i.dt * 1000).toLocaleTimeString()
          ),
          datasets: [
            {
              label: "Temp",
              data: forecast.list.slice(0, 8).map((i) => i.main.temp),
              borderColor: "#00eaff",
              tension: 0.4,
            },
          ],
        }
      : null;

  // 🎨 ORIGINAL BG BACK (UNCHANGED)
  let bg = "app";
  if (!weather) bg = "app welcome";
  else {
    const t = weather.weather[0].main;
    const temp = weather.main.temp;

    if (t.includes("Rain")) bg = "app rain";
    else if (t.includes("Clouds")) bg = "app clouds";
    else if (t === "Clear" && temp >= 30) bg = "app clear";
    else bg = "app defaultBg";
  }

  return (
    <div className={bg}>
      <h1>🌦 Weather AI</h1>

      {!weather && (
        <div className="welcomeBox">
          <h2>Welcome 👋</h2>
         <p>Smart Weather Updates, Instantly ⚡</p>
        </div>
      )}

      {/* SEARCH */}
      <div className="searchBox">
        <input
          placeholder="Search city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <div className="icons">
          <span onClick={() => getWeather()}>🔍</span>
          <span>🎤</span>
          <span onClick={getLocationWeather}>📍</span>
        </div>
      </div>

      {/* TOP */}
      <div className="topGrid">
        {weather && (
          <div className="card big">
            <h2>📍 {weather.name}</h2>
            <h1>{weather.main.temp}°C</h1>
            <p>{weather.weather[0].description}</p>
          </div>
        )}

        {advice && (
          <div className="card">
            <h3>😂 Funny Advice</h3>
            <p style={{ whiteSpace: "pre-line" }}>{advice}</p>
          </div>
        )}

        {chartData && (
          <div className="card">
            <Line data={chartData} />
          </div>
        )}
      </div>

      {/* EXTRA */}
      {weather && (
        <div className="extraGrid">

          {/* 🌅 DAY CYCLE IMPROVED */}
          <div className="card wide">
            <h3>🌅 Day Cycle</h3>

            <div className="sunTimes">
              <span>
                🌄 {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
              </span>
              <span>
                🌇 {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
              </span>
            </div>

            <div className="sunBar">
              <div
                className="sunFill"
                style={{
                  width: `${
                    ((Date.now() / 1000 - weather.sys.sunrise) /
                      (weather.sys.sunset - weather.sys.sunrise)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* 🔥 FIXED SPACING */}
          <div className="miniCards">

            <div className="card mini">
              <h4>🌬 Wind</h4>
              <p>{weather.wind.speed} m/s</p>
            </div>

            <div className="card mini">
              <h4>👀 Visibility</h4>
              <p>{weather.visibility / 1000} km</p>
            </div>

            <div className="card mini">
              <h4>💧 Humidity</h4>
              <p>{weather.main.humidity}%</p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default App;