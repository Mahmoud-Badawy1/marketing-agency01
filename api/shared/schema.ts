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
  parentName: { type: String, required: true },
  phone: { type: String, required: true },
  childAge: { type: Number, required: true },
  nationality: String,
  schoolType: { type: String, enum: ['government', 'private', 'languages', ''] },
  message: String,
  source: { type: String, default: 'website' },
  status: { type: String, default: 'new' }
}, { timestamps: true });

export const Lead = mongoose.model('Lead', leadSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  parentName: { type: String, required: true },
  phone: { type: String, required: true },
  childAge: { type: Number, required: true },
  childName: { type: String, required: true },
  nationality: String,
  schoolType: { type: String, enum: ['government', 'private', 'languages', ''] },
  plan: { type: String, required: true },
  amount: { type: Number, required: true },
  transferImage: String,
  status: { type: String, default: 'pending' },
  children: [{
    name: { type: String, required: true },
    age: { type: Number, required: true }
  }],
  couponCode: String,
  couponDiscount: { type: Number, default: 0 },
  originalAmount: Number,
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);

// Trial Booking Schema
const trialBookingSchema = new mongoose.Schema({
  parentName: { type: String, required: true },
  phone: { type: String, required: true },
  nationality: String,
  schoolType: { type: String, enum: ['government', 'private', 'languages', ''] },
  children: [{
    name: { type: String, required: true },
    age: { type: Number, required: true }
  }],
  message: String,
  status: { type: String, default: 'pending' }
}, { timestamps: true });

export const TrialBooking = mongoose.model('TrialBooking', trialBookingSchema);

// Site Settings Schema
const siteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);

// Teacher Application Schema
const teacherApplicationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  city: { type: String, required: true },
  education: { type: String, required: true },
  specialization: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  hasAbacusExperience: { type: Boolean, required: true, default: false },
  abacusDetails: String,
  teachingPlatforms: String,
  availableHours: { type: String, required: true },
  motivation: String,
  cvUrl: String,
  status: { type: String, default: 'new' },
  adminNotes: String
}, { timestamps: true });

export const TeacherApplication = mongoose.model('TeacherApplication', teacherApplicationSchema);

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

// Validation Schemas
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export const insertLeadSchema = z.object({
  parentName: z.string().min(1),
  phone: z.string().min(1),
  childAge: z.number().min(3).max(16),
  nationality: z.string().optional(),
  schoolType: z.enum(['government', 'private', 'languages', '']).optional(),
  message: z.string().optional(),
  source: z.string().optional()
});

export const childSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(3).max(16)
});

export const insertOrderSchema = z.object({
  parentName: z.string().min(1),
  phone: z.string().min(1),
  childName: z.string().min(1),
  childAge: z.number().min(3).max(16),
  nationality: z.string().optional(),
  schoolType: z.enum(['government', 'private', 'languages', '']).optional(),
  plan: z.string().min(1),
  amount: z.number().min(1),
  children: z.array(childSchema).optional(),
  couponCode: z.string().optional(),
});

export const insertTrialBookingSchema = z.object({
  parentName: z.string().min(1),
  phone: z.string().min(1),
  nationality: z.string().optional(),
  schoolType: z.enum(['government', 'private', 'languages', '']).optional(),
  children: z.array(childSchema).min(1),
  message: z.string().optional()
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

export const insertTeacherApplicationSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  age: z.number().min(18).max(60),
  city: z.string().min(1),
  education: z.string().min(1),
  specialization: z.string().min(1),
  experienceYears: z.number().min(0).max(40),
  hasAbacusExperience: z.boolean(),
  abacusDetails: z.string().optional(),
  teachingPlatforms: z.string().optional(),
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
  childrenCount: z.number().min(1).optional().default(1),
});

// Type exports (Zod-based insert types)
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Child = z.infer<typeof childSchema>;
export type InsertTrialBooking = z.infer<typeof insertTrialBookingSchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type InsertTeacherApplication = z.infer<typeof insertTeacherApplicationSchema>;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

// Document interfaces (plain objects returned from API)
export interface UserType {
  _id: string;
  username: string;
  password: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface LeadType {
  _id: string;
  parentName: string;
  phone: string;
  childAge: number;
  nationality?: string | null;
  schoolType?: string | null;
  message?: string | null;
  source?: string | null;
  status?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface OrderType {
  _id: string;
  parentName: string;
  phone: string;
  childAge: number;
  childName: string;
  nationality?: string | null;
  schoolType?: string | null;
  plan: string;
  amount: number;
  transferImage?: string | null;
  status?: string | null;
  children?: { name: string; age: number }[];
  couponCode?: string | null;
  couponDiscount?: number;
  originalAmount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface TrialBookingType {
  _id: string;
  parentName: string;
  phone: string;
  nationality?: string | null;
  schoolType?: string | null;
  children?: { name: string; age: number }[];
  message?: string | null;
  status?: string | null;
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

export interface TeacherApplicationType {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  education: string;
  specialization: string;
  experienceYears: number;
  hasAbacusExperience: boolean;
  abacusDetails?: string | null;
  teachingPlatforms?: string | null;
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