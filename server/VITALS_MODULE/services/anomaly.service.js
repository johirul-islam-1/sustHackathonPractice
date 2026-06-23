function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr) {
  const avg = mean(arr);

  const squareDiffs = arr.map(
    value => Math.pow(value - avg, 2)
  );

  return Math.sqrt(
    mean(squareDiffs)
  );
}

function zScore(value, history) {
  if (!history || history.length < 3)
    return null;

  const std = stdDev(history);

  if (std === 0)
    return 0;

  return (
    (value - mean(history)) /
    std
  );
}

function classifySeverity(metric, value) {

  switch (metric) {

    case "spo2":
      if (value < 85)
        return "Critical";

      if (value < 90)
        return "High";

      if (value < 95)
        return "Moderate";

      return "Normal";

    case "temperature":
      if (value >= 40)
        return "Critical";

      if (value >= 39)
        return "High";

      if (value >= 38)
        return "Moderate";

      return "Normal";

    case "heart_rate":
      if (value > 140)
        return "Critical";

      if (value > 120)
        return "High";

      if (value > 100)
        return "Moderate";

      return "Normal";

    case "blood_glucose":
      if (value > 300)
        return "Critical";

      if (value > 250)
        return "High";

      if (value > 180)
        return "Moderate";

      return "Normal";

    case "systolic_bp":
      if (value >= 180)
        return "Critical";

      if (value >= 160)
        return "High";

      if (value >= 140)
        return "Moderate";

      return "Normal";

    default:
      return "Normal";
  }
}

function detectVitalAnomalies(
  currentVitals,
  historicalVitals = []
) {

  const anomalies = [];

  const metrics = [
    "systolic_bp",
    "diastolic_bp",
    "heart_rate",
    "temperature",
    "spo2",
    "blood_glucose"
  ];

  for (const metric of metrics) {

    const current =
      currentVitals[metric];

    const history =
      historicalVitals
        .map(v => v[metric])
        .filter(Boolean);

    const z =
      zScore(
        current,
        history
      );

    const severity =
      classifySeverity(
        metric,
        current
      );

    if (
      severity !== "Normal"
    ) {

      anomalies.push({
        metric,
        value: current,
        severity,
        z_score:
          z === null
            ? "Insufficient Data"
            : Number(
                z.toFixed(2)
              )
      });

    }
  }

  return anomalies;
}

module.exports = {
  detectVitalAnomalies
};