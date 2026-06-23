const router = require("express").Router();

const Patient =
  require("../MONGODB_MODULE/models/patient");

const {
  detectVitalAnomalies
} = require("./services/anomaly.service");

const {
  deriveTriage
} = require("./services/triageOverride.service");

const { updatePatientStatus } = require("../PATIENT_MODULE/services/patientStatus.service");

router.post("/", async (req, res) => {
  try {

    const {
      patient_id,
      ...currentVitals
    } = req.body;

    const patient =
      await Patient.findById(
        patient_id
      );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: "Patient not found"
      });
    }

    const anomalies =
      detectVitalAnomalies(
        currentVitals,
        patient.vitals
      );

    const anomalyTriage =
      deriveTriage(
        anomalies
      );

    await Patient.findByIdAndUpdate(
      patient_id,
      {
        $push: {
          vitals: currentVitals
        },

        anomalies,
        anomaly_triage:
          anomalyTriage
      }
    );

    await updatePatientStatus(
      patient_id
    );

    res.json({
      success: true,
      anomalies,
      anomalyTriage
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

module.exports = router;