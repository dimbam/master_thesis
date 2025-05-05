import nodemailer from 'nodemailer';
import winston from 'winston';
import dotenv from 'dotenv';
dotenv.config();

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

export const sendMail = async (from: string, to: string, subject: string, text: string) => {
  const transporter = nodemailer.createTransport({
    pool: true,
    host: 'mail.imedphys.med.auth.gr',
    port: 465,
    secure: true,
    auth: {
      user: 'assos-developer@imedphys.med.auth.gr',
      pass: 'Dbue56tgKj09SnEnMIi7XuBo8NF80lx2Iy4F',
    },
  });

  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: 'Hello',
  };

  logger.info(`Sending mail to - ${to}`);
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error(error);
    } else {
      logger.info('Email sent: ' + info.response);
    }
  });
};
