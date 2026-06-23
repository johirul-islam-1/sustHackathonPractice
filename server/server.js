const express = require("express");
require("dotenv").config();

const ocrRouter = require("./OCR_MODULE/ocr");

const voiceRouter = require("./VOICE_MODULE/voice");

const Triage = require("./TRIAGE_MODULE/triage")
const connectDB = require("./MONGODB_MODULE/connection/mongo");
const vitalsRouter = require("./VITALS_MODULE/vitals");

const app = express();

app.use(express.json());
connectDB();

app.use("/ocr", ocrRouter);
app.use("/voice", voiceRouter);
app.use("/triage", Triage);
app.use("/vitals", vitalsRouter);


app.listen(3000, () => {
  console.log("Server running on port 3000");
});

