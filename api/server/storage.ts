import {
  type UserType, type InsertUser,
  type LeadType, type InsertLead,
  type OrderType, type InsertOrder,
  type TrialBookingType, type InsertTrialBooking,
  type TeacherApplicationType, type InsertTeacherApplication,
  type TestimonialType, type InsertTestimonial,
  type SiteSettingType,
  type CouponType, type InsertCoupon,
  User, Lead, Order, TrialBooking, TeacherApplication, SiteSetting, Testimonial, Coupon
} from "../shared/schema.js";
import mongoose from "./db.js";

export interface IStorage {
  getUser(id: string): Promise<UserType | null>;
  getUserByUsername(username: string): Promise<UserType | null>;
  createUser(user: InsertUser): Promise<UserType>;
  createLead(lead: InsertLead): Promise<LeadType>;
  getLeads(): Promise<LeadType[]>;
  updateLeadStatus(id: string, status: string): Promise<LeadType | null>;
  createOrder(order: InsertOrder): Promise<OrderType>;
  updateOrderImage(id: string, imagePath: string): Promise<OrderType | null>;
  updateOrderStatus(id: string, status: string): Promise<OrderType | null>;
  getOrders(): Promise<OrderType[]>;
  getOrder(id: string): Promise<OrderType | null>;
  createTrialBooking(booking: InsertTrialBooking): Promise<TrialBookingType>;
  getTrialBookings(): Promise<TrialBookingType[]>;
  updateTrialStatus(id: string, status: string): Promise<TrialBookingType | null>;
  createTeacherApplication(application: InsertTeacherApplication): Promise<TeacherApplicationType>;
  getTeacherApplications(): Promise<TeacherApplicationType[]>;
  updateTeacherApplicationStatus(id: string, status: string): Promise<TeacherApplicationType | null>;
  updateTeacherApplicationNotes(id: string, notes: string): Promise<TeacherApplicationType | null>;
  deleteTeacherApplication(id: string): Promise<boolean>;
  getTestimonials(activeOnly?: boolean): Promise<TestimonialType[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<TestimonialType>;
  updateTestimonial(id: string, data: Partial<InsertTestimonial>): Promise<TestimonialType | null>;
  deleteTestimonial(id: string): Promise<boolean>;
  getSetting(key: string): Promise<SiteSettingType | null>;
  getSettings(): Promise<SiteSettingType[]>;
  upsertSetting(key: string, value: any): Promise<SiteSettingType>;
  // Coupon methods
  createCoupon(coupon: InsertCoupon): Promise<CouponType>;
  getCoupons(): Promise<CouponType[]>;
  getCoupon(id: string): Promise<CouponType | null>;
  getCouponByCode(code: string): Promise<CouponType | null>;
  updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<CouponType | null>;
  deleteCoupon(id: string): Promise<boolean>;
  incrementCouponUsage(id: string, phone: string, orderId: string, seatsUsed: number): Promise<CouponType | null>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<UserType | null> {
    return await User.findById(id).lean() as UserType | null;
  }

  async getUserByUsername(username: string): Promise<UserType | null> {
    return await User.findOne({ username }).lean() as UserType | null;
  }

  async createUser(insertUser: InsertUser): Promise<UserType> {
    const user = new User(insertUser);
    const saved = await user.save();
    return saved.toJSON() as unknown as UserType;
  }

  async createLead(insertLead: InsertLead): Promise<LeadType> {
    const lead = new Lead(insertLead);
    const saved = await lead.save();
    return saved.toJSON() as unknown as LeadType;
  }

  async getLeads(): Promise<LeadType[]> {
    return await Lead.find().sort({ createdAt: -1 }).lean() as unknown as LeadType[];
  }

  async updateLeadStatus(id: string, status: string): Promise<LeadType | null> {
    return await Lead.findByIdAndUpdate(id, { status }, { new: true }).lean() as LeadType | null;
  }

  async createOrder(insertOrder: InsertOrder): Promise<OrderType> {
    const order = new Order(insertOrder);
    const saved = await order.save();
    return saved.toJSON() as unknown as OrderType;
  }

  async updateOrderImage(id: string, imagePath: string): Promise<OrderType | null> {
    return await Order.findByIdAndUpdate(id, { transferImage: imagePath }, { new: true }).lean() as OrderType | null;
  }

  async updateOrderStatus(id: string, status: string): Promise<OrderType | null> {
    return await Order.findByIdAndUpdate(id, { status }, { new: true }).lean() as OrderType | null;
  }

  async getOrders(): Promise<OrderType[]> {
    return await Order.find().sort({ createdAt: -1 }).lean() as unknown as OrderType[];
  }

  async getOrder(id: string): Promise<OrderType | null> {
    return await Order.findById(id).lean() as OrderType | null;
  }

  async createTrialBooking(booking: InsertTrialBooking): Promise<TrialBookingType> {
    const trialBooking = new TrialBooking(booking);
    const saved = await trialBooking.save();
    return saved.toJSON() as unknown as TrialBookingType;
  }

  async getTrialBookings(): Promise<TrialBookingType[]> {
    return await TrialBooking.find().sort({ createdAt: -1 }).lean() as unknown as TrialBookingType[];
  }

  async updateTrialStatus(id: string, status: string): Promise<TrialBookingType | null> {
    return await TrialBooking.findByIdAndUpdate(id, { status }, { new: true }).lean() as TrialBookingType | null;
  }

  async getSetting(key: string): Promise<SiteSettingType | null> {
    return await SiteSetting.findOne({ key }).lean() as SiteSettingType | null;
  }

  async getSettings(): Promise<SiteSettingType[]> {
    return await SiteSetting.find().lean() as unknown as SiteSettingType[];
  }

  async upsertSetting(key: string, value: any): Promise<SiteSettingType> {
    const result = await SiteSetting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true, lean: true }
    );
    return result as unknown as SiteSettingType;
  }

  async createTeacherApplication(application: InsertTeacherApplication): Promise<TeacherApplicationType> {
    const teacherApp = new TeacherApplication(application);
    const saved = await teacherApp.save();
    return saved.toJSON() as unknown as TeacherApplicationType;
  }

  async getTeacherApplications(): Promise<TeacherApplicationType[]> {
    return await TeacherApplication.find().sort({ createdAt: -1 }).lean() as unknown as TeacherApplicationType[];
  }

  async updateTeacherApplicationStatus(id: string, status: string): Promise<TeacherApplicationType | null> {
    return await TeacherApplication.findByIdAndUpdate(id, { status }, { new: true }).lean() as TeacherApplicationType | null;
  }

  async updateTeacherApplicationNotes(id: string, notes: string): Promise<TeacherApplicationType | null> {
    return await TeacherApplication.findByIdAndUpdate(id, { adminNotes: notes }, { new: true }).lean() as TeacherApplicationType | null;
  }

  async deleteTeacherApplication(id: string): Promise<boolean> {
    const result = await TeacherApplication.findByIdAndDelete(id);
    return !!result;
  }

  async getTestimonials(activeOnly = false): Promise<TestimonialType[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return await Testimonial.find(filter).sort({ order: 1, createdAt: -1 }).lean() as unknown as TestimonialType[];
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<TestimonialType> {
    const doc = new Testimonial(testimonial);
    const saved = await doc.save();
    return saved.toJSON() as unknown as TestimonialType;
  }

  async updateTestimonial(id: string, data: Partial<InsertTestimonial>): Promise<TestimonialType | null> {
    return await Testimonial.findByIdAndUpdate(id, data, { new: true }).lean() as TestimonialType | null;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const result = await Testimonial.findByIdAndDelete(id);
    return !!result;
  }

  // Coupon methods
  async createCoupon(coupon: InsertCoupon): Promise<CouponType> {
    const doc = new Coupon({ ...coupon, code: coupon.code.toUpperCase() });
    const saved = await doc.save();
    return saved.toJSON() as unknown as CouponType;
  }

  async getCoupons(): Promise<CouponType[]> {
    return await Coupon.find().sort({ createdAt: -1 }).lean() as unknown as CouponType[];
  }

  async getCoupon(id: string): Promise<CouponType | null> {
    return await Coupon.findById(id).lean() as CouponType | null;
  }

  async getCouponByCode(code: string): Promise<CouponType | null> {
    return await Coupon.findOne({ code: code.toUpperCase() }).lean() as CouponType | null;
  }

  async updateCoupon(id: string, data: Partial<InsertCoupon>): Promise<CouponType | null> {
    if (data.code) data.code = data.code.toUpperCase();
    return await Coupon.findByIdAndUpdate(id, data, { new: true }).lean() as CouponType | null;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await Coupon.findByIdAndDelete(id);
    return !!result;
  }

  async incrementCouponUsage(id: string, phone: string, orderId: string, seatsUsed: number): Promise<CouponType | null> {
    return await Coupon.findByIdAndUpdate(
      id,
      {
        $inc: { currentUses: 1 },
        $push: { usageLog: { phone, orderId, seatsUsed, usedAt: new Date() } }
      },
      { new: true }
    ).lean() as CouponType | null;
  }
}

export const storage = new DatabaseStorage();