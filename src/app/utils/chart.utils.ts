import { ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { UserSettings } from '../services/settings';
import { getTempColor } from './formatters.utils';

// Регистрируем компоненты Chart.js один раз при загрузке этого модуля
Chart.register(...registerables);

/**
 * Создает и настраивает график прогноза погоды.
 * @param canvasRef - Ссылка на HTML-элемент <canvas>.
 * @param forecastData - Массив с данными прогноза.
 * @param settings - Текущие пользовательские настройки для адаптации единиц.
 * @returns Экземпляр созданного графика Chart.js.
 */
export function createForecastChart(
  canvasRef: ElementRef<HTMLCanvasElement>,
  forecastData: any[],
  settings: UserSettings
): Chart {
  const context = canvasRef.nativeElement.getContext('2d');
  if (!context) {
    throw new Error('Не удалось получить 2D-контекст для canvas.');
  }

  const labels = forecastData.map(item =>
    new Date(item.dt_txt).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  // Данные для графика. Если выбраны Фаренгейты, сразу конвертируем.
  const displayData = forecastData.map(item => {
    const tempC = item.main.temp;
    return settings.tempUnit === 'F' ? tempC * 9/5 + 32 : tempC;
  });

  return new Chart(context, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `Температура, °${settings.tempUnit}`,
          data: displayData,
          fill: false,
          borderWidth: 4,
          tension: 0.4,
          segment: {
            borderColor: ctx => {
              const originalTemp1 = forecastData[ctx.p0DataIndex].main.temp;
              const originalTemp2 = forecastData[ctx.p1DataIndex].main.temp;

              const gradient = context.createLinearGradient(ctx.p0.x, 0, ctx.p1.x, 0);
              gradient.addColorStop(0, getTempColor(originalTemp1));
              gradient.addColorStop(1, getTempColor(originalTemp2));
              return gradient;
            },
          },
          pointBackgroundColor: (ctx) => getTempColor(forecastData[ctx.dataIndex].main.temp),
          pointBorderColor: (ctx) => getTempColor(forecastData[ctx.dataIndex].main.temp),
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${Number(context.formattedValue).toFixed(0)}°${settings.tempUnit}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: false,
          ticks: {
            callback: (value) => `${Number(value).toFixed(0)}°`,
          },
        },
      },
    },
  });
}
