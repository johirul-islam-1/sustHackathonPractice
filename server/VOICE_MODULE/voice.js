const express =
  require("express");

const multer =
  require("multer");

const fs =
  require("fs");

const os =
  require("os");

const path =
  require("path");

const {
  transcribeAudio,
} = require(
  "./services/whisper.service"
);

const Patient = 
    require("../MONGODB_MODULE/models/patient");

const router =
  express.Router();

const upload =
  multer({
    storage:
      multer.memoryStorage(),
  });

router.post(
  "/",
  upload.single(
    "audio"
  ),
  async (
    req,
    res
  ) => {

    let tempPath;

    try {

      if (
        !req.file
      ) {
        return res
          .status(
            400
          )
          .json({
            success:
              false,
            error:
              "No audio uploaded",
          });
      }

      tempPath =
        path.join(
          os.tmpdir(),
          `${Date.now()}-${req.file.originalname}`
        );

      fs.writeFileSync(
        tempPath,
        req.file.buffer
      );

      const transcript =
        await transcribeAudio(
          tempPath
        );

        // patient_id is in body
      const patient_id = req.body.patient_id;
      await Patient.findByIdAndUpdate(
        patient_id,
        {
            patient_voice: transcript
        },
        {
            new: true,
            runValidators: true
        }
      );

      return res.json(
        {
          success:
            true,
          transcript,
        }
      );

    } catch (
      error
    ) {

      console.error(
        error
      );

      return res
        .status(
          500
        )
        .json({
          success:
            false,
          error:
            error.message,
        });

    } finally {

      if (
        tempPath &&
        fs.existsSync(
          tempPath
        )
      ) {
        fs.unlinkSync(
          tempPath
        );
      }
    }
  }
);

module.exports =
  router;