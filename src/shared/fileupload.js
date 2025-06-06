const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Configure AWS S3
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    region: process.env.AWS_REGION
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const awsStorage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_ACCESS_IMAGES,
    key: function (req, file, cb) {
        const fileName = Date.now() + '-' + file.originalname;
        cb(null, fileName);
    }
});

module.exports = {
    getS3MulterUploader() {
        return multer({
            storage: awsStorage,
            fileFilter,
            limits: {
                // fileSize: 2 * 1024 * 1024 // 2MB limit
                fileSize: 7 * 1024 * 1024 // 3MB limit
            }
        });
    }
};

// const aws = require('aws-sdk');
// const multer = require('multer')
// const multerS3 = require('multer-s3');

// module.exports = {
//     s3FileUploadAPI() {
//         aws.config.update({
//             accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
//             region: process.env.AWS_REGION
//         });
//         const s3 = new aws.S3();
//         const awsStorage = multerS3({
//             s3: s3,
//             bucket: process.env.AWS_BUCKET_ACCESS_IMAGES,
//             key: function (req, file, cb) {
//                 cb(null, Date.now() + '.' + file.originalname);
//             }
//         });
//         return multer({
//             storage: awsStorage
//         });
//     }
// }