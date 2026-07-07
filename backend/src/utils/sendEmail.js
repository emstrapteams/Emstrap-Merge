import nodemailer from "nodemailer";

// ===============================
// Create Mail Transporter
// ===============================
const transporter = nodemailer.createTransport(
  process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? process.env.EMAIL_HOST
      ? {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 465,
          secure:
            process.env.EMAIL_SECURE === "true" ||
            Number(process.env.EMAIL_PORT) === 465,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false,
          },
          family: 4,
        }
      : {
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          family: 4,
        }
    : {
        jsonTransport: true,
      }
);

// ===============================
// Send Email
// ===============================
const sendEmail = async ({
  email,
  subject,
  message,
  htmlMessage,
}) => {
  try {
    const mailOptions = {
      from: `"EMSTRAP" <${process.env.EMAIL_USER || "no-reply@emstrap.com"}>`,
      to: email,
      subject,
      text: message,
      html: htmlMessage || `<p>${message}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    // Development Mode
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("\n========== EMAIL (DEV MODE) ==========");
      console.log("To      :", email);
      console.log("Subject :", subject);
      console.log("Message :", message);
      console.log("======================================\n");
    }

    return info;
  } catch (error) {
    console.error("Email Error:", error.message);
    throw new Error("Failed to send email.");
  }
};

export default sendEmail;