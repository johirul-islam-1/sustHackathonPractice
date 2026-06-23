const { GoogleGenAI } = require("@google/genai");
// require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function validateAndStructureOCR(ocrText) {
//   const prompt = `
// You are a medical OCR structuring assistant.

// Correct OCR mistakes and organize the information.

// Return EXACTLY TWO SECTIONS.

// ========================
// SECTION 1: HUMAN REPORT
// =======================

// Provide a clean, professional medical summary.

// Include:

// * Complaints
// * Symptoms
// * Diagnosis
// * Medicines
// * Tests
// * Advice
// * Follow-up
// * Risks

// ========================
// SECTION 2: MACHINE TAGS
// =======================

// Use ONLY the following format.

// SYMPTOMS:
// symptom1
// symptom2

// DIAGNOSIS:
// diagnosis1
// diagnosis2

// MEDICINES:
// medicine_name|strength|frequency|duration
// medicine_name|strength|frequency|duration

// TESTS:
// test_name
// test_name

// INSTRUCTIONS:
// instruction1
// instruction2

// FOLLOWUP:
// followup_text

// RISKS:
// risk1
// risk2

// UNCERTAIN:
// uncertain_item1
// uncertain_item2

// SECTION 2 MUST FOLLOW THESE RULES:

// 1. One entity per line.
// 2. No markdown.
// 3. No bullet points.
// 4. No explanations.
// 5. Use exact prefixes.
// 6. Use :: as separator.

// Do not add explanations outside these sections.

// OCR TEXT:
// ${ocrText}

// EXAMPLE:
// CASE NON-PRODUCTIVE (DRY) COUGH

// C/o:
// Dry Cough
// Throat illitation
// Night worsening
// No sputum

// Most probable diagnosis
// Upper Airway Cough Syndrome/vival URTI

// Advice
// Chest X-ray
// Spirometry

// Rx
// Syp. Dextromethorphan + chlorpheniramine
// (Corez-DX/Benadryl-DR) x 10ml X TDS X 5 days

// Tab. Levocetirizine x Sing. (1tab) x 5 days

// Tab. Pantoprazate x 40mg x 1 tab OD X 7 days

// ========================
// SECTION 1: HUMAN REPORT
// ========================

// Patient presents with dry cough, throat irritation,
// night worsening symptoms and no sputum production.

// Probable diagnosis:
// Upper Airway Cough Syndrome (UACS) / Viral URTI.

// Medicines:
// - Dextromethorphan + Chlorpheniramine syrup
// - Levocetirizine
// - Pantoprazole

// Investigations:
// - Chest X-ray
// - Spirometry

// ========================
// SECTION 2: MACHINE TAGS
// ========================

// SYMPTOM::Dry cough
// SYMPTOM::Throat irritation
// SYMPTOM::Night worsening
// SYMPTOM::No sputum

// DIAGNOSIS::Upper Airway Cough Syndrome
// DIAGNOSIS::Viral URTI

// MEDICINE::Dextromethorphan + Chlorpheniramine::10ml::TDS::5days
// MEDICINE::Levocetirizine::5mg::OD::5days
// MEDICINE::Pantoprazole::40mg::OD::7days

// TEST::Chest X-ray
// TEST::Spirometry

// INSTRUCTION::Warm saline gargles
// INSTRUCTION::Voice rest
// INSTRUCTION::Hydration advice
// INSTRUCTION::Avoid expectorants
// INSTRUCTION::No antibiotics

// FOLLOWUP::1 week

// RISK::Chronic cough
// RISK::Sleep disturbance
// RISK::Anxiety

// UNCERTAIN::None
// `;

//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: prompt,
//   });
const prompt = `
You are a medical document extraction engine.

You receive OCR text from ANY medical document.

Possible document types include:

* Prescription
* Laboratory Report
* Discharge Summary
* Clinical Note
* Doctor Note
* Follow-up Note
* Radiology Report
* Medical Certificate
* Vital Signs Sheet
* Referral Letter
* Unknown Medical Document

PRIMARY GOAL

Convert OCR text into structured machine-readable medical entities.

STRICT RULES

* Correct obvious OCR mistakes.
* Preserve original medical meaning.
* Never invent information.
* Never infer missing values.
* If information is missing, use UNKNOWN.
* If text is unreadable or ambiguous, use UNCERTAIN.
* Ignore scanner watermarks, page numbers, headers, footers, advertisements, and signatures unless clinically relevant.
* Return ONLY machine-readable tags.
* No markdown.
* No bullet points.
* No explanations.
* No headings.
* No code blocks.
* One entity per line.

DOCUMENT CLASSIFICATION

Always start output with:

DOCUMENT_TYPE::value

Possible values:

DOCUMENT_TYPE::Prescription
DOCUMENT_TYPE::LabReport
DOCUMENT_TYPE::DischargeSummary
DOCUMENT_TYPE::DoctorNote
DOCUMENT_TYPE::ClinicalNote
DOCUMENT_TYPE::RadiologyReport
DOCUMENT_TYPE::VitalSheet
DOCUMENT_TYPE::MedicalCertificate
DOCUMENT_TYPE::Unknown

NORMALIZATION

Frequency:

OD
BD
TDS
QID
SOS
UNKNOWN

Duration:

1day
3days
5days
7days
14days
21days
30days
UNKNOWN

Follow-up:

1 week → 7days
2 weeks → 14days
3 weeks → 21days
1 month → 30days

ALLOWED TAGS

PATIENT_NAME::value

PATIENT_AGE::value

PATIENT_GENDER::value

DOCUMENT_TYPE::value

SYMPTOM::value

DIAGNOSIS::value

MED_HISTORY::value

FAMILY_HISTORY::value

ALLERGY::value

MEDICINE::generic_name::brand_names::strength::dose::frequency::duration

TEST::value

LAB_RESULT::test_name::value

LAB_RANGE::test_name::range

LAB_FLAG::test_name::LOW|NORMAL|HIGH|CRITICAL

VITAL::type::value

INSTRUCTION::value

FOLLOWUP::value

RISK::value

REDFLAG::value

PROCEDURE::value

RADIOLOGY_FINDING::value

IMPRESSION::value

UNCERTAIN::value

MEDICINE FIELD FORMAT

MEDICINE::
generic_name::
brand_names::
strength::
dose::
frequency::
duration

Examples:

MEDICINE::Pantoprazole::Pan-40|Pantocid::40mg::1tab::OD::7days

LAB EXAMPLES

LAB_RESULT::Hemoglobin::10.2 g/dL

LAB_RANGE::Hemoglobin::12-16 g/dL

LAB_FLAG::Hemoglobin::LOW

VITAL EXAMPLES

VITAL::Blood Pressure::140/90

VITAL::Heart Rate::120 bpm

VITAL::Temperature::39 C

REDFLAG EXAMPLES

REDFLAG::Chest Pain

REDFLAG::Severe Shortness Of Breath

REDFLAG::Low SpO2

FOLLOWUP EXAMPLES

FOLLOWUP::7days

FOLLOWUP::30days

OCR TEXT:
${ocrText}
`;
const response = await ai.models.generateContent({
  model: process.env.GEMINI_MODEL,
  contents: prompt,
});

  return response.text;
}

module.exports = {
  validateAndStructureOCR,
};