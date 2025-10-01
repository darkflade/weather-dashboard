/**
 * Возвращает URL фонового изображения в зависимости от погодных условий.
 * @param weatherMain - Основное погодное условие (e.g., "Clouds", "Rain").
 * @returns Строка с URL картинки.
 */
export function getBackgroundImage(weatherMain: string): string {
  switch (weatherMain) {
    case 'Thunderstorm':
      return 'https://images.unsplash.com/photo-1605727227659-e4ddd5853a23?auto=format&fit=crop&w=1920';
    case 'Drizzle':
    case 'Rain':
      return 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=1920';
    case 'Snow':
      return 'https://images.unsplash.com/photo-1544274411-05a8d3b3da62?auto=format&fit=crop&w=1920';
    case 'Mist':
    case 'Smoke':
    case 'Haze':
    case 'Dust':
    case 'Fog':
    case 'Sand':
    case 'Ash':
    case 'Squall':
    case 'Tornado':
      return 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?auto=format&fit=crop&w=1920';
    case 'Clear':
      return 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920';
    case 'Clouds':
      return 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920';
    default:
      // Картинка по умолчанию, если придет что-то неизвестное
      return 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?auto=format&fit=crop&w=1920';
  }
}
