import React from "react";
import { Language } from "../../../../hooks/useTranslations";
import { useTranslation } from "../../../../constants/translations";
import Box from "../../../../components/ui/Box/Box";
import Dropdown from "../../../../components/ui/Dropdown/Dropdown";
import AudioButton from "../../../../components/ui/AudioButton/AudioButton";

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    temp_max: number;
    temp_min: number;
    pressure: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
}

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  germanCities: readonly string[];
  language: Language;
}

// Weather part interface for colored display
interface WeatherPart {
  text: string;
  type: "prefix" | "city" | "temperature" | "unit" | "condition" | "space";
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  loading,
  error,
  selectedCity,
  setSelectedCity,
  germanCities,
  language,
}) => {
  const t = useTranslation(language);

  // Color mapping for different weather parts
  const getColorClass = (type: WeatherPart["type"]) => {
    switch (type) {
      case "prefix":
        return "text-neutral-600 dark:text-neutral-400";
      case "city":
        return "text-blue-600 dark:text-blue-400";
      case "temperature":
        return "text-orange-600 dark:text-orange-400";
      case "unit":
        return "text-green-600 dark:text-green-400";
      case "condition":
        return "text-purple-600 dark:text-purple-400";
      case "space":
        return "text-neutral-700 dark:text-neutral-300";
      default:
        return "text-neutral-700 dark:text-neutral-300";
    }
  };

  // Convert weather data to German structured description
  const convertWeatherToGermanStructured = (
    weatherData: WeatherData
  ): WeatherPart[] => {
    if (!weatherData) return [];

    const temp = Math.round(weatherData.main.temp);
    const description = weatherData.weather[0].description;

    // German number mappings for temperature
    const germanNumbers: { [key: number]: string } = {
      0: "null",
      1: "eins",
      2: "zwei",
      3: "drei",
      4: "vier",
      5: "fünf",
      6: "sechs",
      7: "sieben",
      8: "acht",
      9: "neun",
      10: "zehn",
      11: "elf",
      12: "zwölf",
      13: "dreizehn",
      14: "vierzehn",
      15: "fünfzehn",
      16: "sechzehn",
      17: "siebzehn",
      18: "achtzehn",
      19: "neunzehn",
      20: "zwanzig",
      21: "einundzwanzig",
      22: "zweiundzwanzig",
      23: "dreiundzwanzig",
      24: "vierundzwanzig",
      25: "fünfundzwanzig",
      26: "sechsundzwanzig",
      27: "siebenundzwanzig",
      28: "achtundzwanzig",
      29: "neunundzwanzig",
      30: "dreißig",
      31: "einunddreißig",
      32: "zweiunddreißig",
      33: "dreiunddreißig",
      34: "vierunddreißig",
      35: "fünfunddreißig",
      36: "sechsunddreißig",
      37: "siebenunddreißig",
      38: "achtunddreißig",
      39: "neununddreißig",
      40: "vierzig",
    };

    const tempWord =
      temp >= 0 && temp <= 40 ? germanNumbers[temp] : temp.toString();

    // Weather description mappings
    const weatherDescriptions: { [key: string]: string } = {
      "clear sky": "klarer Himmel",
      "few clouds": "wenige Wolken",
      "scattered clouds": "verstreute Wolken",
      "broken clouds": "bewölkt",
      "overcast clouds": "bedeckt",
      "light rain": "leichter Regen",
      "moderate rain": "mäßiger Regen",
      "heavy rain": "starker Regen",
      "light snow": "leichter Schnee",
      "moderate snow": "mäßiger Schnee",
      "heavy snow": "starker Schnee",
      mist: "Nebel",
      fog: "Nebel",
      haze: "Dunst",
      smoke: "Rauch",
      dust: "Staub",
      sand: "Sand",
      ash: "Asche",
      squall: "Böen",
      tornado: "Tornado",
      thunderstorm: "Gewitter",
      drizzle: "Nieselregen",
      rain: "Regen",
      snow: "Schnee",
      sleet: "Schneeregen",
      "freezing rain": "gefrierender Regen",
      "shower rain": "Regenschauer",
      "thunderstorm with light rain": "Gewitter mit leichtem Regen",
      "thunderstorm with rain": "Gewitter mit Regen",
      "thunderstorm with heavy rain": "Gewitter mit starkem Regen",
    };

    const weatherWord =
      weatherDescriptions[description.toLowerCase()] || description;

    const parts: WeatherPart[] = [
      { text: "In", type: "prefix" },
      { text: " ", type: "space" },
      { text: selectedCity, type: "city" },
      { text: " ", type: "space" },
      { text: "ist es", type: "prefix" },
      { text: " ", type: "space" },
      { text: tempWord, type: "temperature" },
      { text: " ", type: "space" },
      { text: "Grad Celsius", type: "unit" },
      { text: " ", type: "space" },
      { text: "mit", type: "prefix" },
      { text: " ", type: "space" },
      { text: weatherWord, type: "condition" },
    ];

    return parts;
  };

  // Convert WeatherParts to simple text for speech
  const convertWeatherPartsToText = (parts: WeatherPart[]): string => {
    return parts.map((part) => part.text).join("");
  };

  // Speech synthesis function
  const speakText = (parts: WeatherPart[]) => {
    if ("speechSynthesis" in window) {
      const text = convertWeatherPartsToText(parts);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <Box
        titleKey="wetter"
        language={language}
        headerColor="primary"
        description={
          language === "de"
            ? "Wetterbeschreibungen auf Deutsch"
            : "Weather descriptions in German"
        }
      >
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        titleKey="wetter"
        language={language}
        headerColor="primary"
        description={
          language === "de"
            ? "Wetterbeschreibungen auf Deutsch"
            : "Weather descriptions in German"
        }
      >
        <div className="text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </Box>
    );
  }

  if (!weather) {
    return (
      <Box
        titleKey="wetter"
        language={language}
        headerColor="primary"
        description={
          language === "de"
            ? "Wetterbeschreibungen auf Deutsch"
            : "Weather descriptions in German"
        }
      >
        <div className="text-center text-neutral-600 dark:text-neutral-400">
          {t.weather.stadtAuswaehlen}
        </div>
      </Box>
    );
  }

  return (
    <Box
      titleKey="wetter"
      language={language}
      headerColor="primary"
      description={
        language === "de"
          ? "Wetterbeschreibungen auf Deutsch"
          : "Weather descriptions in German"
      }
    >
      <div className="space-y-6">
        {/* City Selector Section */}
        <div className="space-y-2">
          {/* Label for city selector */}
          <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            {language === "de"
              ? t.weather.stadtWaehlen
              : t.weather.selectCityLabel}
          </label>

          <Dropdown
            value={selectedCity}
            onChange={setSelectedCity}
            options={germanCities.map((city) => ({
              value: city,
              label: city,
            }))}
          />
        </div>

        {/* Weather Display Section */}
        <div className="space-y-2">
          <div className="w-full px-4 py-3 text-lg border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            <div className="flex items-center justify-center gap-4">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="w-16 h-16"
              />
              <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 font-space-grotesk">
                {Math.round(weather.main.temp)}°C
              </p>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-lg sm:text-xl md:text-2xl font-semibold leading-relaxed break-words hyphens-auto">
                  {convertWeatherToGermanStructured(weather).map(
                    (part, index) => (
                      <span
                        key={index}
                        className={`${getColorClass(
                          part.type
                        )} transition-colors duration-200`}
                      >
                        {part.text}
                      </span>
                    )
                  )}
                </p>
              </div>

              <AudioButton
                onClick={() =>
                  speakText(convertWeatherToGermanStructured(weather))
                }
                title={t.ui.listen}
                size="lg"
              />
            </div>
          </div>

          {/* Color Legend */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              {t.ui.colorLegend}
            </h4>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-neutral-500"></div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {language === "de" ? "Präfix" : "Prefix"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {language === "de" ? "Stadt" : "City"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {language === "de" ? "Temperatur" : "Temperature"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {language === "de" ? "Einheit" : "Unit"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-neutral-600 dark:text-neutral-400">
                  {language === "de" ? "Bedingung" : "Condition"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-md p-3 border border-neutral-200 dark:border-neutral-600">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-ibm-plex">
              {t.weather.temperatur}
            </div>
            <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 font-space-grotesk">
              {Math.round(weather.main.temp)}°C
            </div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-md p-3 border border-neutral-200 dark:border-neutral-600">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-ibm-plex">
              {t.weather.luftfeuchtigkeit}
            </div>
            <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 font-space-grotesk">
              {weather.main.humidity}%
            </div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-md p-3 border border-neutral-200 dark:border-neutral-600">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-ibm-plex">
              {t.weather.windgeschwindigkeit}
            </div>
            <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 font-space-grotesk">
              {Math.round(weather.wind.speed)} m/s
            </div>
          </div>
          <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-md p-3 border border-neutral-200 dark:border-neutral-600">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-ibm-plex">
              {t.weather.beschreibung}
            </div>
            <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 capitalize font-space-grotesk">
              {weather.weather[0].description}
            </div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default WeatherWidget;
