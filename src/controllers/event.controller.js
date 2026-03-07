import Event from "../models/Event.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const getDateRange = (filter) => {
  const normalized = String(filter || "").toLowerCase();
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfDay = (d) => {
    const s = new Date(d);
    s.setHours(0, 0, 0, 0);
    return s;
  };
  const endOfDay = (d) => {
    const e = new Date(d);
    e.setHours(23, 59, 59, 999);
    return e;
  };

  switch (normalized) {
    case "today": {
      return { $gte: startOfToday, $lte: endOfToday };
    }
    case "7days": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 7);
      const end = new Date(startOfToday);
      end.setDate(end.getDate() + 7);
      return { $gte: startOfDay(start), $lte: endOfDay(end) };
    }
    case "30days": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 30);
      const end = new Date(startOfToday);
      end.setDate(end.getDate() + 30);
      return { $gte: startOfDay(start), $lte: endOfDay(end) };
    }
    default:
      return null;
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { filter } = req.query;
    const query = {};

    const dateRange = getDateRange(filter);
    if (dateRange) {
      query.date = dateRange;
    }

    const events = await Event.find(query)
      .populate("createdBy", "fullName email")
      .sort({ date: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("createdBy", "fullName email")
      .lean();

    if (!event) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { heading, description, date, location, image: imageUrl } = req.body;

    if (!heading || !description || !date || !location) {
      const error = new Error(
        "Heading, description, date and location are required",
      );
      error.statusCode = 400;
      throw error;
    }

    let image = imageUrl || null;
    if (req.file && req.file.buffer) {
      const { url } = await uploadToCloudinary(
        req.file.buffer,
        "campus-connect/events",
      );
      image = url;
    }

    const event = await Event.create({
      heading,
      description,
      date: new Date(date),
      location,
      image,
      createdBy: req.user.id,
    });

    const populated = await Event.findById(event._id)
      .populate("createdBy", "fullName email")
      .lean();

    res.status(201).json({
      success: true,
      message: "Event created",
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { heading, description, date, location, image } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    if (heading !== undefined) event.heading = heading;
    if (description !== undefined) event.description = description;
    if (date !== undefined) event.date = new Date(date);
    if (location !== undefined) event.location = location;
    if (req.file && req.file.buffer) {
      const { url } = await uploadToCloudinary(
        req.file.buffer,
        "campus-connect/events",
      );
      event.image = url;
    } else if (image !== undefined) {
      event.image = image;
    }

    await event.save();

    const populated = await Event.findById(event._id)
      .populate("createdBy", "fullName email")
      .lean();

    res.status(200).json({
      success: true,
      message: "Event updated",
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      const error = new Error("Event not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Event deleted",
    });
  } catch (err) {
    next(err);
  }
};
