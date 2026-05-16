const { GoogleGenAI, Behavior } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .describe(
      "A score between 0 and 100 indicating how well the candidate's profile matches the job description.",
    ),

  technicalQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe("A technical question can be asked in the interview."),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking this question.",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Technical questions that can be asked in the interview along with their intention how to answer them.",
    ),

  behavioralQuestions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "A behavioral question that assesses the candidate's soft skills and cultural fit.",
          ),
        intention: z
          .string()
          .describe(
            "The intention of interviewer behind asking this question.",
          ),
        answer: z
          .string()
          .describe(
            "How to answer this question, what points to cover, what approach to take etc.",
          ),
      }),
    )
    .describe(
      "Behavioral questions that can be asked in the interview along with their intention how to answer them.",
    ),

  skillGaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe(
            "A skill that the candidate is lacking based on their resume and self description.",
          ),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("The severity of the skill gap."),
      }),
    )
    .describe(
      "List of skill gaps in candidate profile along with their severity.",
    ),

  preparationPlan: z
    .array(
      z.object({
        day: z
          .number()
          .describe("Day number in the preparation plan, starting from 1."),
        focus: z
          .string()
          .describe("The focus area for that day in the preparation plan."),
        tasks: z
          .array(z.string())
          .describe(
            "List of tasks to be completed on that day to prepare for the interview.",
          ),
      }),
    )
    .describe(
      "A day-wise preparation plan for the candidate to prepare for the interview, covering all important topics and skills.",
    ),
});

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
 const prompt = `
You MUST return ONLY valid JSON.

Follow this EXACT structure (example included):

{
  "matchScore": 90,
  "technicalQuestions": [
    {
      "question": "Sample question",
      "intention": "Why interviewer asks this",
      "answer": "How to answer"
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Sample question",
      "intention": "Why interviewer asks this",
      "answer": "How to answer"
    }
  ],
  "skillGaps": [
    {
      "skill": "Example skill",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "Topic",
      "tasks": ["Task 1", "Task 2"]
    }
  ]
}

STRICT RULES:
- Arrays must contain OBJECTS, not strings
- Do NOT use key-value pairs like ["question", "..."]
- Each item must be a proper JSON object
- Do NOT add extra fields
- Do NOT return explanation

Now generate the report.

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  });

  return JSON.parse(response.text)

}


  


module.exports = generateInterviewReport;
