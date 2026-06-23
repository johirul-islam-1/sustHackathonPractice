const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const { validateAndStructureOCR } = require("./services/gemini.service");
const Patient = require("../MONGODB_MODULE/models/patient");
// require("dotenv").config();

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post(
  "/",
  upload.single("image"),
  async (req, res) => {
    console.log("/ocr api hit")
    try {
      if (!req.file) {
        console.log("No image uploaded")

        return res.status(400).json({
          success: false,
          error: "No image uploaded",
        });
      }

      const form = new FormData();

      form.append(
        "file",
        req.file.buffer,
        req.file.originalname
      );

      form.append(
        "apikey",
        process.env.OCR_SPACE_API_KEY
      );

      form.append("OCREngine", process.env.OCR_SPACE_OCR_ENGINE);
      form.append("language", process.env.OCR_SPACE_LANGUAGE);
      form.append("scale", "true");
      form.append("isTable", "false");

      const response = await axios.post(
        process.env.OCR_SPACE_API,
        form,
        {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
        }
      );

      const parsedText =
        response.data?.ParsedResults
          ?.map((item) => item.ParsedText)
          .join("\n") || "";

    // parsedText = "CASE NON-PRODUCTIVE (DRY) COUGH\nC/o:-\n* Dry Cough\n* Throat irritation\n* Night worsening\n* No sputum\n\nMost probable diagnosis\nUpper Airway Cough Syndrome/viral URTI\n\nAdvice\n* Chest X-ray\n* Spirometry\n\nRx\n1) Syp. Dextromethorphan + chlorpheniramine\n(Corez-DX/Benadryl-DR) x 10ml x TDS x 5 days\n2) Tab. Levocetirizine x 5mg (1tab) x 5 days\n(LCZ/Levocet)\n3) Tab. Pantoprazole x 40mg x 1 tab OD x 7 days\n(Pan-40/Pantocid)\n4) Warm Saline gargles XBD\n5) voice rest + hydration advice\n6) No antibiotics\n7) Avoid expectorants\n\nR/A 1 week\n\nComplications\n* chronic cough\n* Sleep disturbance\n* Anxiety\n\nDisclaimer- \"This handbook is intended as a clinical reference\nguide and does nScanned by Camera Scanner al judgment.\"\ndr. loven / Supty"

      const structured = await validateAndStructureOCR(parsedText);

      const patient_id = req.body.patient_id
      await Patient.findByIdAndUpdate(
        patient_id,
        {
            ocr_report: structured
        },
        {
            new: true,
            runValidators: true
        }
      );

    //   return res.json({
    //     success: true,
    //     rawText: parsedText,
    //     structured: JSON.parse(structured),
    //   });

    return res.json({
        success: true,
        rawText: parsedText,
        structured
    });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        error:
          error.response?.data ||
          error.message,
      });
    }
  }
);

module.exports = router;