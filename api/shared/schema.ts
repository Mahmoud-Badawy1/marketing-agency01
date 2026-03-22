import mongoose from 'mongoose';
import { z } from 'zod';

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

// Lead Schema
const leadSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' },
  monthlyBudget: { type: Number },
  companyName: String,
  serviceInterest: { type: String },
  message: String,
  source: { type: String, default: 'website' },
  status: { type: String, default: 'new' }
}, { timestamps: true });

export const Lead = mongoose.model('Lead', leadSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' },
  monthlyBudget: { type: Number, required: true },
  projectName: { type: String, required: true },
  companyName: String,
  serviceInterest: { type: String },
  plan: { type: String, required: true },
  amount: { type: Number, required: true },
  transferImage: String,
  status: { type: String, default: 'pending' },
  cancelReason: String,
  services: [{
    name: { type: String, required: true },
    description: { type: String }
  }],
  couponCode: String,
  couponDiscount: { type: Number, default: 0 },
  originalAmount: Number,
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);

// Trial Booking Schema (Strategy Call)
const trialBookingSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' },
  companyName: String,
  serviceInterest: { type: String }, 
  message: String,
  status: { type: String, default: 'pending' },
  cancelReason: String,
  scheduledSlotId: { type: String },
  scheduledTime: { type: Date },
  meetingLink: String,
  adminNotes: String,
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

export const TrialBooking = mongoose.model('TrialBooking', trialBookingSchema);

// Site Settings Schema
const siteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);

// Expert Application Schema (Team/Jobs)
const expertApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' },
  age: { type: Number, required: true },
  city: { type: String, required: true },
  education: { type: String, required: true },
  specialization: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  hasAgencyExperience: { type: Boolean, required: true, default: false },
  portfolioDetails: String,
  marketingTools: String,
  availableHours: { type: String, required: true },
  motivation: String,
  cvUrl: String,
  status: { type: String, default: 'new' },
  adminNotes: String
}, { timestamps: true });

export const ExpertApplication = mongoose.model('ExpertApplication', expertApplicationSchema);

// Testimonial Schema
const testimonialSchema = new mongoose.Schema({
  name: { type: mongoose.Schema.Types.Mixed, required: true },
  role: mongoose.Schema.Types.Mixed,
  whatsappImage: String,
  defaultText: mongoose.Schema.Types.Mixed,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// Coupon Schema
const couponUsageLogSchema = new mongoose.Schema({
  phone: String,
  orderId: String,
  seatsUsed: { type: Number, default: 1 },
  usedAt: { type: Date, default: Date.now }
}, { _id: false });

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: mongoose.Schema.Types.Mixed,
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  applicablePlans: [{ type: String }],
  startDate: Date,
  endDate: Date,
  maxTotalUses: { type: Number, default: 0 },
  maxUsesPerCustomer: { type: Number, default: 0 },
  maxSeats: { type: Number, default: 0 },
  currentUses: { type: Number, default: 0 },
  usageLog: [couponUsageLogSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Coupon = mongoose.model('Coupon', couponSchema);

// UserAccount Schema
const userAccountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  name: { type: String, required: true },
  password: { type: String },
  activeSessionToken: { type: String },
  role: { type: String, enum: ['client', 'applicant'], default: 'client' },
  lastLogin: Date,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const UserAccount = mongoose.model('UserAccount', userAccountSchema);

// OtpCode Schema
const otpCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 }
}, { timestamps: true });

export const OtpCode = mongoose.model('OtpCode', otpCodeSchema);

// Availability Slot Schema (Phase 2)
const availabilitySlotSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g. "10:00"
  endTime: { type: String, required: true },   // e.g. "11:00"
  capacity: { type: Number, default: 1 },      // Max account managers available
  totalBooked: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  label: { type: String },                     // E.g., employee name or series title
  recurrenceId: { type: String },              // Identifies a series of recurring slots
  recurrenceType: { type: String, enum: ['none', 'weekly', 'monthly', 'annually'], default: 'none' }
}, { timestamps: true });

export const AvailabilitySlot = mongoose.model('AvailabilitySlot', availabilitySlotSchema);

// Validation Schemas
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export const insertLeadSchema = z.object({
  clientName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  userId: z.string().optional(),
  monthlyBudget: z.number().min(0).optional(),
  companyName: z.string().optional(),
  serviceInterest: z.string().optional().or(z.literal('')),
  message: z.string().optional(),
  source: z.string().optional()
});

export const insertOrderSchema = z.object({
  clientName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  userId: z.string().optional(),
  projectName: z.string().min(1),
  monthlyBudget: z.number().min(0),
  companyName: z.string().optional(),
  serviceInterest: z.string().optional().or(z.literal('')),
  plan: z.string().min(1),
  amount: z.number().min(1),
  couponCode: z.string().optional(),
  cancelReason: z.string().optional(),
});

export const insertTrialBookingSchema = z.object({
  clientName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  userId: z.string().optional(),
  companyName: z.string().optional(),
  serviceInterest: z.string().optional().or(z.literal('')),
  message: z.string().optional(),
  status: z.string().optional(),
  scheduledSlotId: z.string().optional(),
  scheduledTime: z.string().or(z.date()).optional(),
  meetingLink: z.string().optional(),
  adminNotes: z.string().optional(),
  cancelReason: z.string().optional(),
  reminderSent: z.boolean().optional(),
});

export const insertSettingSchema = z.object({
  key: z.string().min(1),
  value: z.any()
});

export const insertTestimonialSchema = z.object({
  name: z.any(),
  role: z.any().optional(),
  whatsappImage: z.string().optional(),
  defaultText: z.any().optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional()
});

export const insertExpertApplicationSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  userId: z.string().optional(),
  age: z.number().min(18).max(60),
  city: z.string().min(1),
  education: z.string().min(1),
  specialization: z.string().min(1),
  experienceYears: z.number().min(0).max(40),
  hasAgencyExperience: z.boolean(),
  portfolioDetails: z.string().optional(),
  marketingTools: z.string().optional(),
  availableHours: z.string().min(1),
  motivation: z.string().max(500).optional(),
  cvUrl: z.string().optional()
});

export const insertCouponSchema = z.object({
  code: z.string().min(2).max(30),
  description: z.any().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0.1),
  applicablePlans: z.array(z.string()).optional().default([]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxTotalUses: z.number().min(0).optional().default(0),
  maxUsesPerCustomer: z.number().min(0).optional().default(0),
  maxSeats: z.number().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  planId: z.string().min(1),
  phone: z.string().optional(),
  seatsRequested: z.number().min(1).optional().default(1),
});

export const insertUserAccountSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  name: z.string().min(1),
  password: z.string().optional(),
  activeSessionToken: z.string().optional().nullable(),
  role: z.enum(['client', 'applicant']).optional().default('client'),
  isActive: z.boolean().optional().default(true),
  lastLogin: z.date().optional()
});

export const insertOtpCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  expiresAt: z.date(),
  attempts: z.number().optional().default(0)
});

export const insertAvailabilitySlotSchema = z.object({
  date: z.string().or(z.date()),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  capacity: z.number().min(1).optional().default(1),
  isActive: z.boolean().optional().default(true),
  label: z.string().optional(),
  recurrenceId: z.string().optional(),
  recurrenceType: z.enum(['none', 'weekly', 'monthly', 'annually']).optional().default('none')
});

// Type exports (Zod-based insert types)
export type InsertUserAccount = z.infer<typeof insertUserAccountSchema>;
export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertTrialBooking = z.infer<typeof insertTrialBookingSchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type InsertExpertApplication = z.infer<typeof insertExpertApplicationSchema>;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type InsertAvailabilitySlot = z.infer<typeof insertAvailabilitySlotSchema>;

// Document interfaces (plain objects returned from API)
export interface UserAccountType {
  _id: string;
  email: string;
  phone?: string | null;
  name: string;
  password?: string | null;
  activeSessionToken?: string | null;
  role: 'client' | 'applicant';
  lastLogin?: string | Date | null;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserType {
  _id: string;
  username: string;
  password: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface LeadType {
  _id: string;
  clientName: string;
  phone: string;
  email?: string | null;
  userId?: string | null;
  monthlyBudget?: number;
  companyName?: string | null;
  serviceInterest?: string | null;
  message?: string | null;
  source?: string | null;
  status?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface OrderType {
  _id: string;
  clientName: string;
  phone: string;
  email?: string | null;
  userId?: string | null;
  monthlyBudget: number;
  projectName: string;
  companyName?: string | null;
  serviceInterest?: string | null;
  plan: string;
  amount: number;
  transferImage?: string | null;
  status?: string | null;
  cancelReason?: string | null;
  services?: { name: string; description?: string }[];
  couponCode?: string | null;
  couponDiscount?: number;
  originalAmount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TrialBookingType {
  _id: string;
  clientName: string;
  phone: string;
  email?: string | null;
  userId?: string | null;
  companyName?: string | null;
  serviceInterest?: string | null;
  message?: string | null;
  status?: string | null;
  scheduledSlotId?: string | null;
  scheduledTime?: string | Date | null;
  cancelReason?: string | null;
  meetingLink?: string | null;
  adminNotes?: string | null;
  reminderSent?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SiteSettingType {
  _id: string;
  key: string;
  value: any;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TestimonialType {
  _id: string;
  name: any;
  role?: any | null;
  whatsappImage?: string | null;
  defaultText?: any | null;
  isActive?: boolean;
  order?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ExpertApplicationType {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  userId?: string | null;
  age: number;
  city: string;
  education: string;
  specialization: string;
  experienceYears: number;
  hasAgencyExperience: boolean;
  portfolioDetails?: string | null;
  marketingTools?: string | null;
  availableHours: string;
  motivation?: string | null;
  cvUrl?: string | null;
  status?: string | null;
  adminNotes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CouponUsageLog {
  phone?: string;
  orderId?: string;
  seatsUsed?: number;
  usedAt?: string | Date;
}

export interface CouponType {
  _id: string;
  code: string;
  description?: string | null;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicablePlans: string[];
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  maxTotalUses: number;
  maxUsesPerCustomer: number;
  maxSeats: number;
  currentUses: number;
  usageLog: CouponUsageLog[];
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AvailabilitySlotType {
  _id: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  capacity: number;
  totalBooked: number;
  isActive: boolean;
  label?: string;
  recurrenceId?: string;
  recurrenceType?: 'none' | 'weekly' | 'monthly' | 'annually';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}