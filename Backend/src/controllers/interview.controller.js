const pdfParse = require("pdf-parse");
const PDFDocument = require("pdfkit");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

function getPositionTitle(jobDescription) {
  const heading = jobDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (!heading) {
    return "Interview Position";
  }

  return heading
    .replace(/^(job title|position|role)\s*:\s*/i, "")
    .slice(0, 100);
}

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
  try {
    const { selfDescription = "", jobDescription = "" } = req.body;

    if (!jobDescription.trim()) {
      return res.status(400).json({
        message: "Job description is required.",
      });
    }

    if (!req.file && !selfDescription.trim()) {
      return res.status(400).json({
        message: "Please upload a resume or provide a self-description.",
      });
    }

    let resumeText = "";

    if (req.file) {
      const resumeContent = await new pdfParse.PDFParse(
        Uint8Array.from(req.file.buffer),
      ).getText();

      resumeText = resumeContent.text;
    }

    const interViewReportByAi = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    });

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      title: getPositionTitle(jobDescription),
      resume: resumeText,
      selfDescription,
      jobDescription,
      ...interViewReportByAi,
    });

    return res.status(201).json({
      message: "Interview report generated successfully.",
      interviewReport,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Something went wrong while generating interview report.",
    });
  }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
  const { interviewId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  res.status(200).json({
    message: "Interview report fetched successfully.",
    interviewReport,
  });
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
  const interviewReports = await interviewReportModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const summaries = interviewReports.map((report) => {
    const {
      resume,
      selfDescription,
      jobDescription,
      __v,
      technicalQuestions,
      behavioralQuestions,
      skillGaps,
      preparationPlan,
      ...summary
    } = report;

    return {
      ...summary,
      title: report.title || getPositionTitle(jobDescription),
    };
  });

  res.status(200).json({
    message: "Interview reports fetched successfully.",
    interviewReports: summaries,
  });
}

/**
 * @description Download an interview report as a PDF.
 */
async function downloadInterviewReportPdfController(req, res) {
  const { interviewReportId } = req.params;

  const interviewReport = await interviewReportModel.findOne({
    _id: interviewReportId,
    user: req.user.id,
  });

  if (!interviewReport) {
    return res.status(404).json({
      message: "Interview report not found.",
    });
  }

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename=interview_report_${interviewReportId}.pdf`,
  });

  const pdf = new PDFDocument({ margin: 50 });
  pdf.pipe(res);

  const addSectionTitle = (title) => {
    pdf.moveDown();
    pdf.font("Helvetica-Bold").fontSize(16).fillColor("#ff2d78").text(title);
    pdf.moveDown(0.4);
  };

  pdf
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor("#161b22")
    .text("Interview Preparation Report");
  pdf.moveDown(0.5);
  pdf
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#4b5563")
    .text(
      `Generated: ${new Date(interviewReport.createdAt).toLocaleDateString()}`,
    );

  addSectionTitle("Match Score");
  pdf
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#161b22")
    .text(`${interviewReport.matchScore}%`);

  const addQuestions = (title, questions) => {
    addSectionTitle(title);
    questions.forEach((item, index) => {
      pdf
        .font("Helvetica-Bold")
        .fontSize(12)
        .fillColor("#161b22")
        .text(`${index + 1}. ${item.question}`);
      pdf
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#374151")
        .text("Intention:", { continued: true });
      pdf.font("Helvetica").text(` ${item.intention}`);
      pdf.font("Helvetica-Bold").text("Model Answer:", { continued: true });
      pdf.font("Helvetica").text(` ${item.answer}`);
      pdf.moveDown(0.7);
    });
  };

  addQuestions("Technical Questions", interviewReport.technicalQuestions);
  addQuestions("Behavioral Questions", interviewReport.behavioralQuestions);

  addSectionTitle("Skill Gaps");
  pdf
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#161b22")
    .text(
      interviewReport.skillGaps
        .map((gap) => `${gap.skill} (${gap.severity})`)
        .join(", "),
    );

  addSectionTitle("Preparation Road Map");
  interviewReport.preparationPlan.forEach((day) => {
    pdf
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#161b22")
      .text(`Day ${day.day}: ${day.focus}`);
    pdf.font("Helvetica").fontSize(10).list(day.tasks, { bulletRadius: 2 });
    pdf.moveDown(0.5);
  });

  pdf.end();
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  downloadInterviewReportPdfController,
};
