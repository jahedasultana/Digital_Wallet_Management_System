/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import nodemailer from "nodemailer";
import path from "path";
import AppError from "../errorHelpers/AppError";
import envConfig from "../config/env";

const transporter = nodemailer.createTransport({
  // port: envVars.EMAIL_SENDER.SMTP_PORT,
  secure: true,
  auth: {
    user: envConfig.EMAIL_SENDER.SMTP_USER,
    pass: envConfig.EMAIL_SENDER.SMTP_PASS,
  },
  port: Number(envConfig.EMAIL_SENDER.SMTP_PORT),
  host: envConfig.EMAIL_SENDER.SMTP_HOST,
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);

    const html = await ejs.renderFile(templatePath, templateData);
    const info = await transporter.sendMail({
      from: envConfig.EMAIL_SENDER.SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
    console.log(`\u2709\uFE0F Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    console.log("email sending error", error.message);
    throw new AppError(401, "Email error");
  }
};
