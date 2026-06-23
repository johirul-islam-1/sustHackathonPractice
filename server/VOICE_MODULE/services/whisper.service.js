const { pipeline } =
  require("@xenova/transformers");

const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } =
  require("child_process");

const ffmpeg =
  require("ffmpeg-static");

const {
  WaveFile,
} = require("wavefile");

let transcriber = null;

async function getModel() {

  if (!transcriber) {

    console.log(
      "Loading Whisper model..."
    );

    transcriber =
      await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-small"
      );

    console.log(
      "Whisper model loaded."
    );
  }

  return transcriber;
}

async function convertToWav(
  inputPath
) {

  const outputPath =
    path.join(
      os.tmpdir(),
      `${Date.now()}-audio.wav`
    );

  await new Promise(
    (resolve, reject) => {

      const cmd =
        `"${ffmpeg}" -y -i "${inputPath}" -ar 16000 -ac 1 "${outputPath}"`;

      exec(
        cmd,
        (error) => {

          if (error) {
            return reject(error);
          }

          resolve();
        }
      );
    }
  );

  return outputPath;
}

async function transcribeAudio(
  inputPath
) {

  const model =
    await getModel();

  const wavPath =
    await convertToWav(
      inputPath
    );

  try {

    const buffer =
      fs.readFileSync(
        wavPath
      );

    const wav =
      new WaveFile(
        buffer
      );

    wav.toBitDepth(
      "32f"
    );

    wav.toSampleRate(
      16000
    );

    const samples =
      wav.getSamples();

    const audio =
      Float32Array.from(
        Array.isArray(
          samples
        )
          ? samples[0]
          : samples
      );

    const result =
      await model(
        audio
      );

    return result.text;

  } finally {

    if (
      fs.existsSync(
        wavPath
      )
    ) {
      fs.unlinkSync(
        wavPath
      );
    }
  }
}

module.exports = {
  transcribeAudio,
};