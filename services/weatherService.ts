
export interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  city: string;
  isDay: boolean;
  code: number;
}

export const weatherService = {
  async getWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,is_day,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await response.json();
      const current = data.current;

      return {
        temperature: current.temperature_2m,
        condition: getWeatherDescription(current.weather_code),
        windSpeed: current.wind_speed_10m,
        city: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
        isDay: current.is_day === 1,
        code: current.weather_code
      };
    } catch (error) {
      throw new Error('Weather data unavailable');
    }
  },

  async getCityName(lat: number, lng: number): Promise<string> {
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          return data.address.city || data.address.town || data.address.village || data.address.province || 'Konum';
      } catch {
          return 'Bilinmeyen Konum';
      }
  }
};

function getWeatherDescription(code: number): string {
  const codes: Record<number, string> = {
    0: 'Açık',
    1: 'Az Bulutlu',
    2: 'Parçalı Bulutlu',
    3: 'Kapalı',
    45: 'Sisli',
    48: 'Kırağı',
    51: 'Hafif Çiseleme',
    53: 'Çiseleme',
    55: 'Yoğun Çiseleme',
    61: 'Hafif Yağmur',
    63: 'Yağmur',
    65: 'Şiddetli Yağmur',
    71: 'Hafif Kar',
    73: 'Kar',
    75: 'Yoğun Kar',
    80: 'Sağanak',
    81: 'Şiddetli Sağanak',
    82: 'Aşırı Sağanak',
    95: 'Fırtına',
    96: 'Dolu & Fırtına',
    99: 'Şiddetli Dolu',
  };
  return codes[code] || 'Bilinmiyor';
}
