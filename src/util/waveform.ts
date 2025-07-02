export function interpolateArray(data: number[], fitCount: number) {
  let peak = 0;
  const newData = new Array(fitCount);
  const springFactor = data.length / fitCount;
  const leftFiller = data[0];
  const rightFiller = data[data.length - 1];
  for (let i = 0; i < fitCount; i++) {
    const idx = Math.floor(i * springFactor);
    const val = ((data[idx - 1] ?? leftFiller) + (data[idx] ?? leftFiller) + (data[idx + 1] ?? rightFiller)) / 3;
    newData[i] = val;
    if (peak < val) {
      peak = val;
    }
  }
  return { data: newData, peak };
}
