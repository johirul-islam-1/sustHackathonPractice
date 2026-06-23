const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patient_id: {
      type: String,
      required: true,
    },
    // Raw Inputs
    patient_voice: {
      type: String,
      trim: true
    },

    ocr_report: {
      type: String,
    },

    raw_vitals: {
      type: String,
    },

    // Parsed Vitals
    vitals: [
        {
            recorded_at: {
            type: Date,
            default: Date.now
            },

            systolic_bp: Number,
            diastolic_bp: Number,
            heart_rate: Number,
            temperature: Number,
            spo2: Number,
            blood_glucose: Number
        }
    ],

    // AI Triage Result
    triage_score: {
      type: String,
      enum: ["Green", "Yellow", "Red", "Black"],
    //   required: true
    },

    confidence: {
      type: Number,
    //   required: true,
      min: 0,
      max: 100
    },

    // Clinical Reasoning
    clinical_reasoning: {
      supporting_findings: [String],
      missing_information: [String],
      uncertainties: [String],

      why_not_lower_triage: String,
      why_not_higher_triage: String
    },

    // Differential Diagnoses
    differential_diagnoses: [
      {
        condition: {
          type: String,
        //   required: true
        },

        confidence: {
          type: Number,
        //   required: true
        },

        supporting_evidence: [String],

        missing_or_contradictory_evidence: [String]
      }
    ],

    // First Aid
    first_aid_steps: [String],

    // Referral
    referral: {
      required: {
        type: Boolean,
        default: false
      },

      urgency: {
        type: String,
        enum: [
          "None",
          "Routine",
          "Urgent",
          "Immediate Emergency"
        ]
      },

      specialist: String,

      reason: String
    },

    // Safety Flags
    safety_flags: [String],

    disclaimer: String,

    anomalies: [
        {
            metric: String,
            value: Number,
            severity: String,
            z_score: mongoose.Schema.Types.Mixed
        }
    ],

    anomaly_triage: {
        type: String,
        enum: [
            "Green",
            "Yellow",
            "Red",
            "Black"
        ]
    },

    final_triage: {
    type: String,
        enum: [
            "Green",
            "Yellow",
            "Red",
            "Black"
        ]
    }
  },
  {
    timestamps: true
  },

  
);

module.exports = mongoose.model("Patient", patientSchema);