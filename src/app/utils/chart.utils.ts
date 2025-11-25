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
          label: `°${settings.tempUnit}`,
          data: displayData,
          fill: false,
          borderWidth: 3,
          hoverBorderWidth: 5,
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
          pointBorderWidth: 0.5,
          pointRadius: 3,
          pointHoverRadius: 8,
          pointHoverBorderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          //backdropFilter: 'blur(5px)',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 16, weight: 'bolder' },
          padding: 12,
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            title:
              (tooltipItems) => `${tooltipItems[0].label}`,
            label:
              (context) => `${Number(context.formattedValue).toFixed(0)}°${settings.tempUnit}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false }, // Убираем линию оси X
          ticks: { padding: 10 }
        },
        y: {
          grid: { display: false }, // Убираем горизонтальную сетку
          border: { display: false }, // Убираем линию оси Y
          beginAtZero: false,
          ticks: {
            padding: 10,
            callback: (value) => `${Number(value).toFixed(0)}°`,
          },
        },
      },
    },
  });
}
