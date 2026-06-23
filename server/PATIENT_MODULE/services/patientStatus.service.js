const Patient =
  require("../../MONGODB_MODULE/models/patient");

async function updatePatientStatus(
  patientId
) {

  const patient =
    await Patient.findById(
      patientId
    );

  if (!patient)
    return;

  let finalTriage =
    patient.triage_score;

  /*
    anomaly severity wins
  */

  if (
    patient.anomaly_triage ===
    "Black"
  ) {

    finalTriage =
      "Black";

  } else if (

    patient.anomaly_triage ===
    "Red" &&

    (
      !finalTriage ||
      finalTriage === "Green" ||
      finalTriage === "Yellow"
    )

  ) {

    finalTriage =
      "Red";

  }

  const priorityMap = {
    Black: 4,
    Red: 3,
    Yellow: 2,
    Green: 1
  };

  // await Patient.findByIdAndUpdate(
  //   patientId,
  //   {
  //     final_triage:
  //       finalTriage
  //   }
  // );

  await Patient.findByIdAndUpdate(
    patientId,
    {
      final_triage: finalTriage,
      triage_priority:
        priorityMap[finalTriage] || 0
    }
  );
}

module.exports = {
  updatePatientStatus
};