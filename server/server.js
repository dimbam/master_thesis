const winston = require('winston');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file
const neo4j = require('neo4j-driver');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

const app = express();
app.use(cors());
app.use(express.json());

// Connect to local Docker Neo4j using Bolt
const driver1 = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'testpass1'));
const driver2 = neo4j.driver('bolt://localhost:7688', neo4j.auth.basic('neo4j', 'testpass2'));
const driver3 = neo4j.driver('bolt://localhost:7689', neo4j.auth.basic('neo4j', 'testpass3'));

const transporter = nodemailer.createTransport({
  pool: true,
  host: 'mail.imedphys.med.auth.gr',
  port: 465,
  secure: true,
  auth: {
    user: 'assos-developer@imedphys.med.auth.gr',
    pass: 'Dbue56tgKj09SnEnMIi7XuBo8NF80lx2Iy4F',
  },
  logger: true,
  debug: true,
});

async function checkEmailExists(email) {
  const session = driver1.session();
  try {
    const result = await session.run(
      `RETURN EXISTS {
        MATCH (u:User {email: $email})
      } AS emailExists`,
      { email },
    );
    return result.records[0].get('emailExists');
    console.log(result);
  } catch (err) {
    console.error('Error checking email:', err);
    return false;
  } finally {
    await session.close();
  }
}

// Email sending route
app.post('/send-email', (req, res) => {
  console.log(req.body);
  const { email } = req.body;

  logger.info('Received email:', { email });

  if (!email) {
    return res.status(400).send('No email address provided');
  }

  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }

  const mailOptions = {
    from: 'assos-developer@imedphys.med.auth.gr',
    to: email,
    subject: 'Registration Confirmation',
    text: 'Your One Time Password is: ' + OTP,
  };

  logger.info(`Sending mail to - ${email}`);

  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      logger.error('Error sending email:', error);
      return res.status(500).send('Error sending email');
    }

    const session = driver1.session();

    try {
      await session.run('CREATE (u:User {email: $email, otp: $otp})', { email, otp: OTP });
      logger.info(`Stored ${email} and OTP in Neo4j`);
      res.status(200).send('Email sent: ' + info.response);
    } catch (err) {
      logger.error('Error saving to Neo4j:', err);
    } finally {
      await session.close();
    }
  });
});

app.post('/check-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('No email address provided');
  }

  const exists = await checkEmailExists(email);
  return res.json({ exists });
});

app.post('/store-string', async (req, res) => {
  const { user_string } = req.body;
  if (!user_string) return res.status(400).send('No string provided');

  const drivers = [
    { driver: driver2, label: 'StoredStringDB2' },
    { driver: driver3, label: 'StoredStringDB3' },
  ];

  for (const { driver, label } of drivers) {
    const session = driver.session();
    try {
      await session.run(`CREATE (s:${label} {value: $value})`, { value: user_string });
      console.log(`Stored string in ${label} successfully`);
    } catch (err) {
      console.error('Error writing to database ${label}:', err);
    } finally {
      await session.close();
    }
  }
});

app.get('/get-emails', async (req, res) => {
  const session = driver1.session();
});

const fs = require('fs');
const path = require('path');

app.get('/form', (req, res) => {
  const filePath = path.join(__dirname, 'storage', 'form_datatest3.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Failed to read form_data.json:', err);
      return res.status(500).send('Error while reading stored form');
    }
    res.json(JSON.parse(data));
  });
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
