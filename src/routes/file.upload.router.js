const express = require('express');
// var router = express.Router();
const fileUploadApi = require('../controllers/file.upload.controller');
const apiResponses = require('../utils/ApiResponses');
const bucket = process.env.AWS_BUCKET_ACCESS_IMAGES;
const aws = require('aws-sdk');
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID
});

const s3 = new aws.S3();
const router = express.Router();

router.post('/imageUploader', fileUploadApi.imageUploader);
router.post('/AddProduct', fileUploadApi.CreateProduct);
router.post('/EditProduct', fileUploadApi.EditProduct);
router.post('/AddCategories', fileUploadApi.CreateCategories);
router.post('/EditCategories', fileUploadApi.EditCategories);
router.post('/AddContent', fileUploadApi.CreateContent);
router.post('/EditContent', fileUploadApi.EditContent);
router.post('/AddOrganization', fileUploadApi.CreateOrganization);
router.post('/EditOrganization', fileUploadApi.EditOrganization);
router.post('/multipleImageUploader', fileUploadApi.multipleImageUploader);
router.delete('/deleteImageInAWSS3BucketByFilename/:fileKey', async (req, res) => {
    const filename = req.params.fileKey;
    console.log("🚀 ~ file: file.upload.route.js:16 ~ router.delete ~ filename:", filename)
    await s3.deleteObject({ Bucket: bucket, Key: filename }).promise();
    return apiResponses.successResponseWithData(res, 'S3 Bucket Image Deleted Successfully');    
})

router.delete('/deleteImagesInS3Bucket', async (req, res) => {
    const filenames = req.body.images; // Assuming image names are sent in an array of objects in the request body
    // Extract filenames from the array of objects
    const fileKeys = filenames.map(item => item.fileKey);

    // Use Promise.all() to execute deletion promises concurrently
    const deletePromises = fileKeys.map(key =>
        s3.deleteObject({ Bucket: bucket, Key: key }).promise()
    );
    try {
        await Promise.all(deletePromises);
        return apiResponses.successResponseWithData(res, 'S3 Bucket Images Deleted Successfully')
    } catch (error) {
        return apiResponses.errorResponse(res, "Error deleting images")
        
    }
});

module.exports = router;