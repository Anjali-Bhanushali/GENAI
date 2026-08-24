const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    }),
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    }),
  ),
});

const interviewReportJsonSchema = {
  type: "object",
  properties: {
    matchScore: {
      type: "number",
    },

    technicalQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
          },
          intention: {
            type: "string",
          },
          answer: {
            type: "string",
          },
        },
        required: ["question", "intention", "answer"],
      },
    },

    behavioralQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
          },
          intention: {
            type: "string",
          },
          answer: {
            type: "string",
          },
        },
        required: ["question", "intention", "answer"],
      },
    },

    skillGaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: {
            type: "string",
          },
          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
        },
        required: ["skill", "severity"],
      },
    },

    preparationPlan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: {
            type: "number",
          },
          focus: {
            type: "string",
          },
          tasks: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },

  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
Generate an interview preparation report.

IMPORTANT:
Every item inside technicalQuestions MUST be an object.
Every item inside behavioralQuestions MUST be an object.
Every item inside skillGaps MUST be an object.
Every item inside preparationPlan MUST be an object.

Do not flatten objects into arrays.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: interviewReportJsonSchema,
    },
  });

  console.log("RAW AI RESPONSE:");
  console.log(response.text);

  const parsedResponse = JSON.parse(response.text);

  // Validate Gemini output
  const validatedResponse = interviewReportSchema.parse(parsedResponse);

  return validatedResponse;
}

module.exports = {
  generateInterviewReport,
};
