import Resource from "../models/Resource.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const getResources = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category && category.trim() ? { category: category.trim() } : {};

    const resources = await Resource.find(query)
      .populate("uploadedBy", "fullName email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (err) {
    next(err);
  }
};

export const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate("uploadedBy", "fullName email")
      .lean();

    if (!resource) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (err) {
    next(err);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const { category, heading, description, fileType } = req.body;

    if (!category || !heading || !fileType) {
      const error = new Error("Category, heading and file type are required");
      error.statusCode = 400;
      throw error;
    }

    if (!["pdf", "docx"].includes(fileType)) {
      const error = new Error("File type must be pdf or docx");
      error.statusCode = 400;
      throw error;
    }

    if (!req.file || !req.file.buffer) {
      const error = new Error("File upload is required");
      error.statusCode = 400;
      throw error;
    }

    const { url: fileUrl, publicId } = await uploadToCloudinary(
      req.file.buffer,
      "campus-connect/resources",
      { resource_type: "raw", originalFilename: req.file.originalname }
    );

    const resource = await Resource.create({
      category: category.trim(),
      heading: heading.trim(),
      description: description ? description.trim() : "",
      fileUrl,
      fileType,
      uploadedBy: req.user.id,
      publicId,
    });

    const populated = await Resource.findById(resource._id)
      .populate("uploadedBy", "fullName email")
      .lean();

    res.status(201).json({
      success: true,
      message: "Resource created",
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateResource = async (req, res, next) => {
  try {
    const { category, heading, description, fileType } = req.body;

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }

    if (category !== undefined) resource.category = category.trim();
    if (heading !== undefined) resource.heading = heading.trim();
    if (description !== undefined) resource.description = description.trim();
    if (fileType !== undefined) {
      if (!["pdf", "docx"].includes(fileType)) {
        const error = new Error("File type must be pdf or docx");
        error.statusCode = 400;
        throw error;
      }
      resource.fileType = fileType;
    }

    if (req.file && req.file.buffer) {
      if (resource.publicId) {
        try {
          await deleteFromCloudinary(resource.publicId, "raw");
        } catch (e) {
          // ignore delete errors
        }
      }
      const { url: fileUrl, publicId } = await uploadToCloudinary(
        req.file.buffer,
        "campus-connect/resources",
        { resource_type: "raw", originalFilename: req.file.originalname }
      );
      resource.fileUrl = fileUrl;
      resource.publicId = publicId;
    }

    await resource.save();

    const populated = await Resource.findById(resource._id)
      .populate("uploadedBy", "fullName email")
      .lean();

    res.status(200).json({
      success: true,
      message: "Resource updated",
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      const error = new Error("Resource not found");
      error.statusCode = 404;
      throw error;
    }

    if (resource.publicId) {
      try {
        await deleteFromCloudinary(resource.publicId, "raw");
      } catch (e) {
        // ignore delete errors
      }
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Resource deleted",
    });
  } catch (err) {
    next(err);
  }
};
