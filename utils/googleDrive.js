const { google } = require('googleapis');
const stream = require('stream');

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  },
  scopes: ['https://www.googleapis.com/auth/drive'], // بدل drive.file
});

const drive = google.drive({ version: 'v3', auth });

const uploadFileToGoogleDrive = async (req, res, next) => {
  try {
    if (!req.file) {
      console.log("no file");
      return next();
    }

    const FOLDER_ID = '1uzS7iTTCNxwG4R-PeuSIZ9XjiICZGRQi';

    const fileMetadata = {
      name: req.file.originalname,
      parents: [FOLDER_ID],
    };

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const media = {
      mimeType: req.file.mimetype,
      body: bufferStream,
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
      supportsAllDrives: true, // مهم جدا
    });

    if (!response.data.id) {
      console.log("file not uploaded");
      return next();
    }

    const fileId = response.data.id;
    const fileUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    req.fileId = fileId;
    req.fileUrl = fileUrl;
    console.log("file uploaded");
    console.log(req.fileId);
    console.log(req.fileUrl);

    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

module.exports = uploadFileToGoogleDrive;
