// utils/sendEmail.js

import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * sendEmail({
 *   to,
 *   subject,
 *   template,
 *   variables
 * })
 */
export const sendEmail = async ({ to, subject, template, variables = {} }) => {

  try {

    const isOverride =
      String(process.env.EMAIL_OVERRIDE || "false").toLowerCase() === "true";

    const devEmail = process.env.DEV_EMAIL || "";
    const recipient = isOverride ? devEmail : to;

    if (!recipient) {
      throw new Error("No recipient specified for outgoing email");
    }

    const fromAddress = process.env.EMAIL_FROM;

    // Replace template variables
    let html = template;

    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, variables[key]);
    });

    const msg = {
      to: recipient,
      from: fromAddress,
      subject: subject,
      html: html,
    };

    await sgMail.send(msg);

    console.log("✅ Email sent via SendGrid →", recipient);

  } catch (error) {

    console.error("❌ SendGrid email error:", error.response?.body || error.message);

    throw error;

  }

};