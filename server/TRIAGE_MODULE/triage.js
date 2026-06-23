const router = require("express").Router()
const { Triage } = require("./services/gemeni.service");
const Patient = require("../MONGODB_MODULE/models/patient")
const { updatePatientStatus } = require("../PATIENT_MODULE/services/patientStatus.service");



// dummy patient data
// const patient_data = {
//     patient_voice: "I have high fever, feeling chest pain, head ache",
//     ocr_report: "CASE NON-PRODUCTIVE (DRY) COUGH\nC/o:-\n* Dry Cough\n* Throat irritation\n* Night worsening\n* No sputum\n\nMost probable diagnosis\nUpper Airway Cough Syndrome/viral URTI\n\nAdvice\n* Chest X-ray\n* Spirometry\n\nRx\n1) Syp. Dextromethorphan + chlorpheniramine\n(Corez-DX/Benadryl-DR) x 10ml x TDS x 5 days\n2) Tab. Levocetirizine x 5mg (1tab) x 5 days\n(LCZ/Levocet)\n3) Tab. Pantoprazole x 40mg x 1 tab OD x 7 days\n(Pan-40/Pantocid)\n4) Warm Saline gargles XBD\n5) voice rest + hydration advice\n6) No antibiotics\n7) Avoid expectorants\n\nR/A 1 week\n\nComplications\n* chronic cough\n* Sleep disturbance\n* Anxiety\n\nDisclaimer- \"This handbook is intended as a clinical reference\nguide and does nScanned by Camera Scanner al judgment.\"\ndr. loven / Supty",
//     vitals: `Blood Pressure: 182/115 mmHg,
// Heart Rate: 128 bpm,
// Temperature: 39.6 °C,
// Oxygen Saturation: 89 %,
// Blood Glucose: 278 mg/dL`
// }


router.post("/", async (req, res) => {
  try {
    console.log("/triage api hit")
    // patient_id comes from body
    const patient_id =req.body.patient_id;

    const patient_data = await Patient.findById(patient_id)
        .select(`
            patient_voice
            ocr_report
            raw_vitals
            anomalies
            anomaly_triage
        `)
        .lean();
    
    if (!patient_data) {
        return res.status(404).json({
            success: false,
            error: "Patient not found"
        });
    }

    const result = await Triage(patient_data);

    const patient = await Patient.findByIdAndUpdate(
      patient_id,
      {
        ...result.data
      },
      {
        new: true,
        runValidators: true
      }
    );

    await updatePatientStatus(
          patient_id
        );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error)

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router
