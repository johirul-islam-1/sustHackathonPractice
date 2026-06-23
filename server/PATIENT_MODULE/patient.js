const router = require("express").Router();

const Patient =
  require("../MONGODB_MODULE/models/patient");
  

router.post("/create", async (req, res) => {

  try {

    const patient =
      await Patient.create({

        patient_id:
          req.body.patient_id,

        age:
          req.body.age,

        gender:
          req.body.gender

      });

    res.json({
      success: true,
      patient
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

router.get("/open", async (req, res) => {

  const patients =
    await Patient.find({
      status: "OPEN"
    })
    .sort({
      triage_priority: -1,
      updatedAt: -1
    });

  res.json(patients);
});

router.get("/:id", async (req, res) => {

  const patient =
    await Patient.findById(
      req.params.id
    );

  if (!patient) {
    return res.status(404).json({
      error:
        "Patient not found"
    });
  }

  res.json(patient);
});

router.patch("/:id/close", async (req, res) => {

  await Patient.findByIdAndUpdate(
    req.params.id,
    {
      status: "CLOSED"
    }
  );

  res.json({
    success: true
  });

});

module.exports = router;