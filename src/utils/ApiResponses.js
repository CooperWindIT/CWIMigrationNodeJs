const { validationResult } = require("express-validator");

exports.successResponse = (res, msg) => {
	return res.status(200).json({
		status: 200,
		result: "success",
		response: msg,
	});
};

exports.successResponseWithData = (res, msg, data) => {
	return res.status(200).json({
		status: 200,
		result: "success",
		response: msg,
		data: data,
	});
};

exports.successResponseInitialWithData = (res, msg, data) => {
	return res.status(201).json({
		status: 201,
		result: "success",
		response: msg,
		data: data,
	});
};

exports.notAllowed = (res, msg) => {
	return res.status(406).json({
		status: 406,
		result: "Not Allowed",
		message: msg,
	});
};

exports.errorResponse = (res, msg) => {
	return res.status(500).json({
		status: 500,
		result: "error",
		response: msg,
	});
};

exports.throwErrorResponse = (res, error) => {
	return res.status(400).json({
		status: 400,
		result: "error",
		response: { message: error },
	});
};

exports.notFoundResponse = (res, msg) => {
	return res.status(404).json({
		status: 404,
		result: "not found",
		message: msg,
	});
};

exports.validationErrorWithData = (res, msg, data) => {
	return res.status(400).json({
		status: 400,
		result: "validation error",
		response: msg,
		data: data,
	});
};

exports.unauthorizedResponse = (res, msg) => {
	return res.status(401).json({
		status: 401,
		result: "unauthorized",
		response: msg,
	});
};

exports.invalidPermissions = (res, msg) => {
	return res.status(406).json({
		status: 406,
		result: "Invalid",
		response: msg,
	});
};

exports.alreadyExist = (res, msg) => {
	return res.status(409).json({
		status: 409,
		result: "Already exists",
		response: msg,
	});
};

exports.assigned = (res, msg) => {
	return res.status(409).json({
		status: 409,
		result: "Already Assigned",
		response: msg,
	});
};

exports.expressValidatorCheck = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({
			status: 422,
			result: "validation error",
			errors: errors.array(),
		});
	}
	next();
};