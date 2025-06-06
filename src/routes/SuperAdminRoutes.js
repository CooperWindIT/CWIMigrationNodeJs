
const express = require('express');
const multer = require('multer');
const SuperAdminController = require('../controllers/SuperAdminController');
//const uploadController = require('../controllers/UploadController');


const router = express.Router();
//region ContentTypes

router.post('/Addcontenttype', SuperAdminController.CreateContentType);     // Add new content type
router.post('/Updtcontenttype', SuperAdminController.UpdateContentType);  // Update existing content type
//router.get('/getcontenttype', SuperAdminController.GetContentTypes);   // Get all content types for an org

//endregion ContentTypes


//region ContentsL

router.post('/Addcontents', SuperAdminController.CreateContent);            // Add new content
router.post('/Updtcontents', SuperAdminController.UpdateContent);         // Update content by ID
//router.get('/getcontents', SuperAdminController.GetContents); // List contents by Org & Type

//endregion Contents


//region Products

router.post('/AddProducts', SuperAdminController.CreateProduct);            // Add new content
router.post('/UpdtProducts', SuperAdminController.UpdateProduct);         // Update content by ID
//router.get('/getcontents', SuperAdminController.GetContents); // List contents by Org & Type

//endregion Products

//region Categories

router.post('/AddCategories', SuperAdminController.CreateCategories);            // Add new content
router.post('/UpdtCategories', SuperAdminController.UpdateCategories);         // Update content by ID
//router.get('/getcontents', SuperAdminController.GetContents); // List contents by Org & Type

//endregion Categories

router.get('/GetDDLItems', SuperAdminController.GetDDLItems); 

// //region Images
// router.post('/Imageupload', upload.single('image'), uploadController.uploadImage);
//router.get('/deleteImage', uploadController.deleteImage);
// //endregion Images





module.exports = router;

// const apiResponses = require("../utils/ApiResponses");

// const aws = require('aws-sdk');
// const s3 = new aws.S3();
// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// router.post('/imageUploader', uploadController.imageUploader);
// router.post('/multipleImageUploader', uploadController.multipleImageUploader);

// router.delete('/deleteImageInAWSS3BucketByFilename/:fileKey', async (req, res) => {
//     const filename = req.params.fileKey;
//     console.log("🚀 ~ file: file.upload.route.js:16 ~ router.delete ~ filename:", filename)
//     await s3.deleteObject({ Bucket: bucket, Key: filename }).promise();
//     return apiResponses.successResponseWithData(res, 'S3 Bucket Image Deleted Successfully')
    
// })

// router.delete('/deleteImagesInS3Bucket', async (req, res) => {
//     const filenames = req.body.images; // Assuming image names are sent in an array of objects in the request body
//     // Extract filenames from the array of objects
//     const fileKeys = filenames.map(item => item.fileKey);

//     // Use Promise.all() to execute deletion promises concurrently
//     const deletePromises = fileKeys.map(key =>
//         s3.deleteObject({ Bucket: bucket, Key: key }).promise()
//     );
//     try {
//         await Promise.all(deletePromises);
//         return apiResponses.successResponseWithData(res, 'S3 Bucket Images Deleted Successfully')
//     } catch (error) {
//         return apiResponses.errorResponse(res, "Error deleting images")
        
//     }
// });