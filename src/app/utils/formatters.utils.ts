export function getTempColor(temp: number): string {
  if (temp <= 20) {
    // от -40 (синий) до 20 (зеленый)
    const percent = Math.max(0, (temp + 40) / 60); // % от -40 до 20
    const red = Math.round(144 * percent);
    const green = Math.round(100 * (1 - percent) + 238 * percent);
    const blue = Math.round(255 * (1 - percent) + 144 * percent);
    return `rgb(${red}, ${green}, ${blue})`;
  } else {
    // от 20 (зеленый) до 35 (красный)
    const percent = Math.min(1, (temp - 20) / 15); // % от 20 до 35
    const red = Math.round(144 * (1 - percent) + 255 * percent);
    const green = Math.round(238 * (1 - percent) + 69 * percent);
    const blue = Math.round(144 * (1 - percent) + 81 * percent);
    return `rgb(${red}, ${green}, ${blue})`;
  }
}

export function getPressureHint(pressureHpa: number): { text: string; className: string } {
  if (pressureHpa < 1009) return { text: 'common.pressure_low', className: 'low' };
  if (pressureHpa > 1022) return { text: 'common.pressure_high', className: 'high' };
  return { text: 'common.pressure_normal', className: 'normal' };
}
