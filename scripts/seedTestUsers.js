import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

const TEST_USERS = [
  {
    fullName: "Alice Johnson",
    email: "alice.test@yopmail.com",
    password: "Test123!",
    university: "COMSATS University",
    department: "Computer Science",
    graduationYear: 2025,
    role: "student",
  },
  {
    fullName: "Bob Smith",
    email: "bob.test@yopmail.com",
    password: "Test123!",
    university: "FAST University",
    department: "Software Engineering",
    graduationYear: 2024,
    role: "student",
  },
  {
    fullName: "Carol Williams",
    email: "carol.test@yopmail.com",
    password: "Test123!",
    university: "LUMS",
    department: "Data Science",
    graduationYear: 2026,
    role: "student",
  },
  {
    fullName: "David Brown",
    email: "david.test@yopmail.com",
    password: "Test123!",
    university: "NUST",
    department: "Computer Science",
    graduationYear: 2025,
    role: "student",
  },
  {
    fullName: "Eva Martinez",
    email: "eva.test@yopmail.com",
    password: "Test123!",
    university: "COMSATS University",
    department: "Information Technology",
    graduationYear: 2024,
    role: "student",
  },
];

async function seedTestUsers() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected\n");

    const credentials = [];

    for (const userData of TEST_USERS) {
      const { password, ...rest } = userData;
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.findOneAndUpdate(
        { email: userData.email },
        { ...rest, password: hashedPassword },
        { upsert: true, new: true }
      );

      credentials.push({
        fullName: user.fullName,
        email: user.email,
        password: userData.password,
      });
    }

    console.log("Test users seeded successfully!\n");
    console.log("=".repeat(60));
    console.log("TEST USER CREDENTIALS (use for login)");
    console.log("=".repeat(60));
    console.log("Password for all: Test123!\n");
    credentials.forEach((c, i) => {
      console.log(`${i + 1}. ${c.fullName}`);
      console.log(`   Email:    ${c.email}`);
      console.log(`   Password: ${c.password}`);
      console.log("");
    });
    console.log("=".repeat(60));
  } catch (err) {
    console.error("Error seeding users:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB disconnected");
    process.exit(0);
  }
}

seedTestUsers();
