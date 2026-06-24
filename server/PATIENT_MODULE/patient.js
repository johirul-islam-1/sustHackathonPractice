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

router.get("/all", async (req, res) => {

  try {

    const patients =
      await Patient.find()
        .sort({
          updatedAt: -1
        });

    res.json(patients);

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

function escapeRegex(value) {

  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

}

router.get("/search", async (req, res) => {

  try {

    const query = {};

    if (req.query.q) {

      const safe =
        escapeRegex(
          String(req.query.q).trim()
        );

      if (safe) {
        query.patient_id = {
          $regex: safe,
          $options: "i"
        };
      }

    }

    if (
      req.query.status === "OPEN" ||
      req.query.status === "CLOSED"
    ) {
      query.status = req.query.status;
    }

    const triage =
      req.query.triage;

    if (
      triage === "Green" ||
      triage === "Yellow" ||
      triage === "Red" ||
      triage === "Black"
    ) {
      query.$or = [
        { final_triage: triage },
        { triage_score: triage }
      ];
    }

    const results =
      await Patient.find(query)
        .sort({
          updatedAt: -1
        });

    res.json({
      success: true,
      total: results.length,
      results
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

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