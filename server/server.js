const winston = require('winston');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
// require('dotenv').config(); // Load environment variables from .env file
const neo4j = require('neo4j-driver');
const AWS = require('aws-sdk');
const multer = require('multer');
const stream = require('stream');
const csv = require('csv-parser');
const OpenAI = require('openai');
const dotenv = require('dotenv');
const axios = require('axios'); // Import axios
const { CohereClientV2 } = require('cohere-ai');
const { ChromaClient } = require('chromadb');

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

const s3 = new AWS.S3({
  endpoint: 'http://localhost:9000',
  accessKeyId: 'minioadmin',
  secretAccessKey: 'minioadmin',
  s3ForcePathStyle: true, // Required for MinIO
  signatureVersion: 'v4',
});

s3.headBucket({ Bucket: 'luce-files' }, async (err) => {
  if (err && err.statusCode === 404) {
    await s3.createBucket({ Bucket: 'luce-files' }).promise();
    console.log('Bucket luce-files created');
  } else {
    console.log('Bucket luce-files already exists');
  }
});

const upload = multer(); // store files in memory

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

const openai = new OpenAI({
  apiKey:
    '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', // Ensure your key is in the .env file
});

const cohere = new CohereClientV2({
  token: 'cohere_token',
});

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

// Create a Data Card (stored in Neo4j DB2)
app.post('/create-datacard', async (req, res) => {
  const { title, description, creator, source } = req.body;

  if (!description || !title || !creator) {
    return res.status(400).send('Missing required fields: dataset_id, title, or creator');
  }

  const session = driver2.session(); // ← using DB2
  try {
    await session.run(
      `CREATE (c:DataCard {
        title: $title,
        description: $description,
        creator: $creator,
        source: $source,
        last_updated: datetime()
      })`,
      {
        title: '',
        description: '',
        creator: '',
        source: '',
      },
    );
    logger.info(`Created DataCard in DB2 for ${title}`);
    res.status(201).send('DataCard created');
  } catch (error) {
    logger.error('Error creating DataCard in DB2:', error);
    res.status(500).send('Failed to create DataCard');
  } finally {
    await session.close();
  }
});

app.post('/upload-datacard-minio', async (req, res) => {
  const { filename = 'datacard.json', email, ...datacard } = req.body;

  if (!email) return res.status(400).send('Missing the user email');

  const key = `${email}/data-card/${filename}`;
  const fileBuffer = Buffer.from(JSON.stringify(datacard, null, 2));

  try {
    await s3
      .upload({
        Bucket: 'luce-files',
        Key: key,
        Body: fileBuffer,
        ContentType: 'application/json',
      })
      .promise();

    console.log(`Uploaded datacard to ${key}`);
    res.status(200).send('Data card uploaded');
  } catch (err) {
    console.error('MinIO upload error:', err);
    res.status(500).send('Failed to upload data card');
  }
});

// Retrieve all Data Cards from Neo4j DB2
app.get('/datacards/:dataset_id', async (req, res) => {
  const session = driver2.session(); // ← using DB2
  const { dataset_id } = req.params;

  try {
    const result = await session.run(
      'MATCH (c:DataCard {dataset_id: $dataset_id}) RETURN c LIMIT 1',
      { dataset_id },
    );

    if (result.records.length === 0) {
      return res.status(404).send('DataCard not found');
    }

    const card = result.records[0].get('c').properties;
    res.json(card);
  } catch (err) {
    logger.error('Error fetching DataCard ${dataset_id} from DB2:', err);
    res.status(500).send('Failed to fetch DataCard');
  } finally {
    await session.close();
  }
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
  const filePath = path.join(__dirname, 'storage', 'form_datatest4.json');
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Failed to read form_data.json:', err);
      return res.status(500).send('Error while reading stored form');
    }
    res.json(JSON.parse(data));
  });
});

app.post('/init-user-folder', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send('Email is required');

  const basePath = `${email}/`;
  const subfolders = ['form/', 'dataset/', 'data-card/'];

  try {
    await Promise.all(
      subfolders.map((folder) =>
        s3
          .putObject({
            Bucket: 'luce-files',
            Key: `${basePath}${folder}`,
            Body: '',
          })
          .promise(),
      ),
    );
    console.log(`Created folder structure for ${email}`);
    res.status(200).send(`Folders created for ${email}`);
  } catch (error) {
    console.error('Error creating folders:', error);
    res.status(500).send('Failed to create user folders');
  }
});

app.post('/upload-dataset', upload.single('file'), async (req, res) => {
  const { email, filename } = req.body;
  const file = req.file;

  if (!email) return res.status(400).send('Email is required');
  if (!file) return res.status(400).send('No file uploaded');

  const keyPath = `${email}/dataset/${filename}`;

  const params = {
    Bucket: 'luce-files',
    Key: keyPath,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const result = await s3.upload(params).promise();
    console.log(`Uploaded ${file.originalname} to ${keyPath}`);
    console.log('Upload result:', result);
    res.status(200).send(`File uploaded to ${keyPath}`);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Failed to upload file');
  }
});

app.post('/upload-form', upload.single('file'), async (req, res) => {
  const { email } = req.body;
  const file = req.file;

  if (!email) return res.status(400).send('Email is required');
  if (!file) return res.status(400).send('No file uploaded');

  const keyPath = `${email}/form/${file.originalname}`;

  const params = {
    Bucket: 'luce-files',
    Key: keyPath,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const result = await s3.upload(params).promise();
    console.log(`Uploaded ${file.originalname} to ${keyPath}`);
    console.log('Upload result:', result);
    res.status(200).send(`Form uploaded to ${keyPath}`);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Failed to upload form');
  }
});

const { gql, request } = require('graphql-request');

app.get('/all-user-datasets', async (req, res) => {
  try {
    const endpoint = 'http://localhost:4000/';
    const query = gql`
      query {
        users {
          email
        }
      }
    `;
    const data = await request(endpoint, query);
    const emails = data.users.map((u) => u.email);

    const results = [];

    for (const email of emails) {
      const prefix = `${email}/dataset/`;

      const listed = await s3.listObjectsV2({ Bucket: 'luce-files', Prefix: prefix }).promise();

      const files = (listed.Contents || []).map((file) => ({
        email,
        filename: file.Key.replace(prefix, ''),
        fullPath: file.Key,
        size: file.Size,
        lastModified: file.LastModified,
      }));
      results.push(...files);
    }

    res.json(results);
  } catch (err) {
    console.error('Error fetching datasets: ', err);
    res.status(500).send('Error retrieving datasets');
  }
});

app.get('/get-datacard', async (req, res) => {
  const { path } = req.query;
  if (!path) return res.status(400).send('Missing required path parameter');

  const params = {
    Bucket: 'luce-files',
    Prefix: path,
  };

  try {
    const listed = await s3.listObjectsV2(params).promise();
    if (!listed.Contents || listed.Contents.length === 0) {
      return res.status(404).send('No files found in that folder');
    }

    const files = await Promise.all(
      listed.Contents.map(async (obj) => {
        const fileData = await s3.getObject({ Bucket: 'luce-files', Key: obj.Key }).promise();
        const rawContent = fileData.Body.toString('utf-8').trim();

        // Skip empty files
        if (!rawContent) return null;

        let parsed;
        try {
          parsed = JSON.parse(rawContent);
        } catch (err) {
          console.warn(`Skipping non-JSON file: ${obj.Key}`);
          return null;
        }

        return {
          filename: obj.Key.replace(path, ''),
          fullPath: obj.Key,
          modified: obj.LastModified,
          content: parsed,
        };
      }),
    );

    const validFiles = files.filter(Boolean); // remove nulls
    if (validFiles.length === 0) {
      return res.status(404).send('No valid JSON files found in folder');
    }

    res.status(200).json(validFiles);
  } catch (err) {
    console.error('Error retrieving folder contents:', err);
    res.status(500).send('Failed to retrieve folder contents');
  }
});

app.get('/extract-metadata', async (req, res) => {
  const { path } = req.query;
  if (!path) return res.status(400).send('Missing CSV path');

  const params = {
    Bucket: 'luce-files',
    Key: path,
  };

  try {
    const s3Stream = s3.getObject(params).createReadStream();
    const rows = [];
    let headers = [];

    s3Stream
      .pipe(csv())
      .on('headers', (hdrs) => {
        headers = hdrs;
      })
      .on('data', (data) => {
        rows.push(data);
      })
      .on('end', () => {
        const columnTypes = {};
        const missingValues = {};
        const uniqueValues = {};
        const numericSummary = {};

        headers.forEach((col) => {
          const values = rows.map((r) => r[col]).filter((v) => v !== undefined && v !== '');
          const numericValues = values.map((v) => parseFloat(v)).filter((v) => !isNaN(v));

          if (numericValues.length / values.length > 0.9) {
            columnTypes[col] = 'numeric';
          } else if (values.every((v) => !isNaN(Date.parse(v)))) {
            columnTypes[col] = 'date';
          } else {
            columnTypes[col] = 'categorical';
          }

          missingValues[col] = rows.filter((r) => !r[col] || r[col].trim() === '').length;
          uniqueValues[col] = new Set(values).size;

          if (columnTypes[col] === 'numeric' && numericValues.length > 0) {
            const sum = numericValues.reduce((a, b) => a + b, 0);
            numericSummary[col] = {
              min: numericValues.reduce((a, b) => Math.min(a, b), Infinity),
              max: numericValues.reduce((a, b) => Math.max(a, b), -Infinity),
              mean: +(sum / numericValues.length).toFixed(2),
            };
          }
        });

        const metadata = {
          shape: { rows: rows.length, columns: headers.length },
          total_records: rows.length,
          attributes: headers,
          n_of_missing_values_per_column: missingValues,
          unique_values: uniqueValues,
          columnTypes: columnTypes,
          numeric_summary: numericSummary,
          sample: rows.slice(0, 3),
        };
        res.json(metadata);
      });
  } catch (err) {
    console.error('Metadata extraction error:', err);
    res.status(500).send('Failed to extract metadata');
  }
});

app.get('/get-form', async (req, res) => {
  const { path } = req.query;
  if (!path) return res.status(400).send('Missing required path parameter');

  const params = {
    Bucket: 'luce-files',
    Prefix: path,
  };

  try {
    const listed = await s3.listObjectsV2(params).promise();
    if (!listed.Contents || listed.Contents.length === 0) {
      return res.status(404).send('No files found in that folder');
    }

    const files = await Promise.all(
      listed.Contents.map(async (obj) => {
        const fileData = await s3.getObject({ Bucket: 'luce-files', Key: obj.Key }).promise();
        const rawContent = fileData.Body.toString('utf-8').trim();

        // Skip empty files
        if (!rawContent) return null;

        let parsed;
        try {
          parsed = JSON.parse(rawContent);
        } catch (err) {
          console.warn(`Skipping non-JSON file: ${obj.Key}`);
          return null;
        }

        return {
          filename: obj.Key.replace(path, ''),
          fullPath: obj.Key,
          modified: obj.LastModified,
          content: parsed,
        };
      }),
    );

    const validFiles = files.filter(Boolean); // remove nulls
    if (validFiles.length === 0) {
      return res.status(404).send('No valid JSON files found in folder');
    }

    res.status(200).json(validFiles);
  } catch (err) {
    console.error('Error retrieving folder contents:', err);
    res.status(500).send('Failed to retrieve folder contents');
  }
});

app.post('/query-llm', async (req, res) => {
  const { prompt } = req.body;
  console.log('OpenAI API Key:', process.env.OPENAI_API_KEY);
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or use gpt-4o-mini-2024-07-18
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ response: response.choices[0].message.content });
  } catch (err) {
    console.error('Error querying OpenAI:', err);
    res.status(500).send('Error querying OpenAI API');
  }
});

app.post('/query-cohere', async (req, res) => {
  const { prompt } = req.body;
  console.log('Received prompt for Cohere:', prompt); // Debug log

  try {
    // Call Cohere API for text generation
    const response = await cohere.chat({
      model: 'command-a-03-2025', // Use an available model, change if needed
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('Full response from Cohere:', response.body);
    if (
      response.body &&
      response.body.message &&
      response.body.message.content &&
      response.body.message.content.length > 0
    ) {
      const generatedText = response.body.message.content[0].text;
      res.json({ response: generatedText });
    } else {
      console.error('Unexpected response structure from Cohere:', response.body);
      res.status(500).send('Error: Unexpected response structure from Cohere');
    }
  } catch (err) {
    console.error('Error querying Cohere:', err.response || err.message);
    res.status(500).send('Error querying Cohere API');
  }
});

app.get('/modelcards', async (req, res) => {
  const session = driver3.session();
  try {
    // Get each ModelCard and its linked fields and values
    const result = await session.run(`
      MATCH (m:ModelCard)-[r:HAS_VALUE]->(f:Field)
      RETURN m, collect({field: f.name, value: r.value}) as fields
    `);

    const cards = result.records.map((rec) => ({
      ...rec.get('m').properties,
      fields: rec.get('fields'),
    }));

    res.json(cards);
  } catch (err) {
    console.error('Error fetching model cards:', err);
    res.status(500).send('Failed to fetch model cards');
  } finally {
    await session.close();
  }
});

async function getModelCardFields(modelCardName) {
  const session = driver3.session();

  const query = `
    MATCH (m:ModelCard {name: $modelcard_name})-[r:HAS_VALUE]->(f:Field)
    RETURN m.name AS modelName, f.name AS fieldName, r.value AS fieldValue
  `;

  const result = await session.run(query, { modelcard_name: modelCardName });

  let modelName = '';
  const fieldLines = [];

  result.records.forEach((record) => {
    modelName = record.get('modelName');
    const fieldName = record.get('fieldName');
    const fieldValue = record.get('fieldValue');
    fieldLines.push(`- ${fieldName}: ${fieldValue}`);
  });

  await session.close();
  return { modelName, fieldText: fieldLines.join('\n') };
}

// const client = new ChromaClient();
// let collection;

// async function initChroma() {
//   try {
//     collection = await client.createCollection({ name: 'model_card_summaries', getOrCreate: true });
//     console.log('Chroma collection ready');
//   } catch (err) {
//     console.log('Failed to initialize ChromaDB:', err);
//   }
// }

// initChroma();

// async function storeSummaryInChromaDB(modelCardName, summary) {
//   try {
//     await collection.add({
//       ids: [modelCardName], // Unique ID for the model card
//       documents: [summary], // The generated summary
//     });
//     console.log('Summary stored in ChromaDB');
//   } catch (error) {
//     console.error('Error storing in ChromaDB:', error);
//   }
// }

async function storeSummaryInMinIO(modelCardName, summary) {
  const key = `ChromaDBSummaries/${modelCardName}`;
  const data = {
    modelCardName,
    summary,
  };
  const fileBuffer = Buffer.from(JSON.stringify(data, null, 2));

  try {
    await s3
      .upload({
        Bucket: 'luce-files',
        Key: key,
        Body: fileBuffer,
        ContentType: 'application/json',
      })
      .promise();

    console.log(`Uploaded summary to ${key}`);
  } catch (err) {
    console.error('MinIO upload error:', err);
  }
}

app.post('/generate-summary', async (req, res) => {
  const { modelCardName } = req.body;

  if (!modelCardName) {
    return res.status(400).send('Model card name is required');
  }

  try {
    const { modelName, fieldText } = await getModelCardFields(modelCardName);

    // Generate the summary using OpenAI
    const prompt = `
    You are a data scientist that writes summaries of machine learning model cards.

    Model Name: ${modelName}
    Fields:
    ${fieldText}

    Write a 2 or 3 sentence summary of this model card.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = response.choices[0].message.content;
    console.log(summary);

    // // Store the summary in ChromaDB
    // await client.database('model_card_summaries').add({
    //   ids: [modelCardName],
    //   documents: [summary],
    // });

    // storeSummaryInChromaDB(modelCardName, summary);
    storeSummaryInMinIO(modelCardName, summary);

    res.json({ modelCardName, summary });
    // winston.info(`Summary for '${modelCardName}' stored in ChromaDB`);
  } catch (err) {
    // winston.error('Error generating or storing summary:', err);
    res.status(500).send('Error generating or storing summary');
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
