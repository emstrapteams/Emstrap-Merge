import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

export const DEFAULT_ADMIN = {
  name: process.env.DEFAULT_ADMIN_NAME,
  email: process.env.DEFAULT_ADMIN_EMAIL,
  password: process.env.DEFAULT_ADMIN_PASSWORD,
  mobile: process.env.DEFAULT_ADMIN_MOBILE,
  address: process.env.DEFAULT_ADMIN_ADDRESS,
  city: process.env.DEFAULT_ADMIN_CITY,
};

export const isBcryptHash = (value = "") => BCRYPT_HASH_REGEX.test(value);

export const ensureDefaultAdminUser = async () => {
  if (!DEFAULT_ADMIN.email || !DEFAULT_ADMIN.password) {
    throw new Error("Missing default admin env configuration");
  }

  const existingAdmin = await User.findOne({ email: DEFAULT_ADMIN.email });

  if (existingAdmin) {
    let changed = false;

    if (existingAdmin.role !== "admin") {
      existingAdmin.role = "admin";
      changed = true;
    }

    if (!existingAdmin.isEmailVerified) {
      existingAdmin.isEmailVerified = true;
      changed = true;
    }

    if (!isBcryptHash(existingAdmin.password)) {
      existingAdmin.password = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      changed = true;
    }

    if (changed) await existingAdmin.save();

    return existingAdmin;
  }

  const adminUser = await User.create({
    name: DEFAULT_ADMIN.name,
    email: DEFAULT_ADMIN.email,
    password: await bcrypt.hash(DEFAULT_ADMIN.password, 10),
    mobile: DEFAULT_ADMIN.mobile,
    address: DEFAULT_ADMIN.address,
    city: DEFAULT_ADMIN.city,
    role: "admin",
    isEmailVerified: true,
  });

  return adminUser;
};

export const verifyPasswordAndUpgradeIfNeeded = async (user, candidatePassword) => {
  if (!user?.password) return false;

  if (!isBcryptHash(user.password)) {
    user.password = await bcrypt.hash(user.password, 10);
    await user.save();
  }

  return bcrypt.compare(candidatePassword, user.password);
};