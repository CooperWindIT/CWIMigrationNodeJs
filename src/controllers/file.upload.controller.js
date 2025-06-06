const fileUploader = require('../shared/fileupload');
const apiResponse = require('../utils/ApiResponses');
const { handleRecord } = require('../utils/recordHandler.js');
const { OperationEnums } = require('../utils/utilityEnum.js');
// Initialize multer upload handlers
const uploader = fileUploader.getS3MulterUploader();
const singleImageUpload = uploader.single('ImageUrl');
const multipleImageUpload = uploader.array('images', 10);

exports.imageUploader = (req, res) => {
    singleImageUpload(req, res, (err) => {
        if (err) {
            console.error("Upload Error:", err);
            return apiResponse.errorResponse(res, err.message || "Image upload failed");
        }
        console.log(req.file.key);
        //console.log(res.data.key);
        return apiResponse.successResponseWithData(res, "Image Uploaded Successfully.", {
            uploadedImagePath: req.file
        });
    });
};

exports.multipleImageUploader = (req, res) => {
    multipleImageUpload(req, res, (err) => {
        if (err) {
            console.error("Upload Error:", err);
            return apiResponse.errorResponse(res, err.message || "Multiple image upload failed");
        }
        return apiResponse.successResponseWithData(res, "Images Uploaded Successfully.", {
            uploadedImagePath: req.files
        });
    });
};


exports.CreateProduct = [singleImageUpload, async (req, res) => {
    try {
      const data = req.body;

      // Set the ImageUrl if file is uploaded
      if (req.file && req.file.key) {
        data.ImageUrl = req.file.key; // S3 file key
      }

      console.log(data);

      // Pass the final data to your DB handler
      handleRecord(req, res, data, OperationEnums().ADDPRDTS);
    } catch (error) {
      console.error("CreateProduct Error:", error);
      return apiResponse.errorResponse(res, "Failed to create product");
    }
  }
];

exports.EditProduct = [singleImageUpload, async (req, res) => {
    try {
      const data = req.body;

      // Set the ImageUrl if file is uploaded
      if (req.file && req.file.key) {
        data.ImageUrl = req.file.key; // S3 file key
      }

      console.log(data);

      // Pass the final data to your DB handler
      handleRecord(req, res, data, OperationEnums().UPDTPRDTS);
    } catch (error) {
      console.error("CreateProduct Error:", error);
      return apiResponse.errorResponse(res, "Failed to Update product");
    }
  }
];

exports.CreateCategories = [singleImageUpload, async (req, res) => {
    try {
      const data = req.body;

      // Set the ImageUrl if file is uploaded
      if (req.file && req.file.key) {
        data.ImageUrl = req.file.key; // S3 file key
      }

      console.log(data);

      // Pass the final data to your DB handler
      handleRecord(req, res, data, OperationEnums().ADDCATS);
    } catch (error) {
      console.error("CreateProduct Error:", error);
      return apiResponse.errorResponse(res, "Failed to create product");
    }
  }
];

exports.EditCategories = [singleImageUpload, async (req, res) => {
    try {
      const data = req.body;

      // Set the ImageUrl if file is uploaded
      if (req.file && req.file.key) {
        data.ImageUrl = req.file.key; // S3 file key
      }

      console.log(data);

      // Pass the final data to your DB handler
      handleRecord(req, res, data, OperationEnums().UPDTCATS);
    } catch (error) {
      console.error("CreateProduct Error:", error);
      return apiResponse.errorResponse(res, "Failed to Update product");
    }
  }
];

exports.CreateContent = [multipleImageUpload, async (req, res) => {
  try {
    const data = req.body;
    console.log(data);

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      data.ImageUrl1 = req.files[0]?.key || null;
      data.ImageUrl2 = req.files[1]?.key || null;
    }

    console.log(data);

    handleRecord(req, res, data, OperationEnums().INSRTCNTNT);
  } catch (error) {
    console.error("CreateContent Error:", error);
    return apiResponse.errorResponse(res, "Failed to create content");
  }
}];

exports.EditContent = [multipleImageUpload, async (req, res) => {
  try {
    const data = req.body;

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      data.ImageUrl1 = req.files[0]?.key || null;
      data.ImageUrl2 = req.files[1]?.key || null;
    }

    console.log(data);

    handleRecord(req, res, data, OperationEnums().UPDTCNTNT);
  } catch (error) {
    console.error("EditContent Error:", error);
    return apiResponse.errorResponse(res, "Failed to update content");
  }
}];


exports.CreateOrganization = [singleImageUpload, async (req, res) => {
    try {
      const data = req.body;

      // Set the ImageUrl if file is uploaded
      if (req.file && req.file.key) {
        data.ImageUrl = req.file.key; // S3 file key
      }

      console.log(data);

      // Pass the final data to your DB handler
      handleRecord(req, res, data, OperationEnums().INS_ORG);
    } catch (error) {
      console.error("CreateProduct Error:", error);
      return apiResponse.errorResponse(res, "Failed to create product");
    }
  }
];

exports.EditOrganization = [singleImageUpload, async (req, res) => {
    try {
      const data = req.body;

      // Set the ImageUrl if file is uploaded
      if (req.file && req.file.key) {
        data.ImageUrl = req.file.key; // S3 file key
      }

      console.log(data);

      // Pass the final data to your DB handler
      handleRecord(req, res, data, OperationEnums().UPD_ORG);
    } catch (error) {
      console.error("CreateProduct Error:", error);
      return apiResponse.errorResponse(res, "Failed to Update product");
    }
  }
];
