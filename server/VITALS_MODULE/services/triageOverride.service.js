function deriveTriage(
  anomalies
) {

  const hasCritical =
    anomalies.some(
      a =>
        a.severity ===
        "Critical"
    );

  const hasHigh =
    anomalies.some(
      a =>
        a.severity ===
        "High"
    );

  if (hasCritical)
    return "Black";

  if (hasHigh)
    return "Red";

  return null;
}

module.exports = {
  deriveTriage
};