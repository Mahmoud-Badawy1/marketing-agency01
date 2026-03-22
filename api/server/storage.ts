import {
  type UserType, type InsertUser,
  type UserAccountType, type InsertUserAccount,
  type InsertOtpCode,
  type LeadType, type InsertLead,
  type OrderType, type InsertOrder,
  type TrialBookingType, type InsertTrialBooking,
  type ExpertApplicationType, type InsertExpertApplication,
  type TestimonialType, type InsertTestimonial,
  type SiteSettingType,
  type CouponType, type InsertCoupon,
  type AvailabilitySlotType, type InsertAvailabilitySlot,
  User, UserAccount, OtpCode, Lead, Order, TrialBooking, ExpertApplication, SiteSetting, Testimonial, Coupon, AvailabilitySlot
} from "../shared/schema.js";
import mongoose from "./db.js";

export interface IStorage {
  getUser(id: string): Promise<UserType | null>;
  getUserByUsername(username: string): Promise<UserType | null>;
  createUser(user: InsertUser): Promise<UserType>;
  
  // User Accounts
  getUserAccount(id: string): Promise<UserAccountType | null>;
  getUserAccountByEmail(email: string): Promise<UserAccountType | null>;
  createUserAccount(user: InsertUserAccount): Promise<UserAccountType>;
  updateUserAccount(id: string, data: Partial<InsertUserAccount>): Promise<UserAccountType | null>;
  
  // OTP
  saveOtpCode(otp: InsertOtpCode): Promise<void>;
  verifyOtpCode(email: string, code: string): Promise<boolean>;
  deleteOtpCode(email: string): Promise<void>;
  createLead(lead: InsertLead): Promise<LeadType>;
  getLeads(): Promise<LeadType[]>;
  updateLeadStatus(id: string, status: string): Promise<LeadType | null>;
  createOrder(order: InsertOrder): Promise<OrderType>;
  getOrders(): Promise<OrderType[]>;
  getUserOrders(userId: string): Promise<OrderType[]>;
  updateOrderStatus(id: string, status: string): Promise<OrderType | null>;
  updateOrderPlan(id: string, plan: string, amount: number): Promise<OrderType | null>;
  cancelOrder(id: string, reason: string): Promise<OrderType | null>;
  updateOrderImage(id: string, url: string): Promise<OrderType | null>;
  createTrialBooking(booking: InsertTrialBooking): Promise<TrialBookingType>;
  getTrialBookings(): Promise<TrialBookingType[]>;
  getUserTrialBookings(userId: string): Promise<TrialBookingType[]>;
  updateTrialStatus(id: string, status: string): Promise<TrialBookingType | null>;
  updateTrialBooking(id: string, data: Partial<InsertTrialBooking>): Promise<TrialBookingType | null>;
  cancelTrialBooking(id: string, reason: string): Promise<TrialBookingType | null>;
  deleteTrialBooking(id: string): Promise<boolean>;
  createExpertApplication(application: InsertExpertApplication): Promise<ExpertApplicationType>;
  getExpertApplications(): Promise<ExpertApplicationType[]>;
  updateExpertApplicationStatus(id: string, status: string): Promise<ExpertApplicationType | null>;
  updateExpertApplicationNotes(id: string, notes: string): Promise<ExpertApplicationType | null>;
  deleteExpertApplication(id: string): Promise<boolean>;
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

  // Availability Slots
  getAvailabilitySlots(date?: string | Date): Promise<AvailabilitySlotType[]>;
  createAvailabilitySlot(slot: InsertAvailabilitySlot): Promise<AvailabilitySlotType>;
  createAvailabilitySlots(slots: InsertAvailabilitySlot[]): Promise<AvailabilitySlotType[]>;
  updateAvailabilitySlot(id: string, data: Partial<InsertAvailabilitySlot>): Promise<AvailabilitySlotType | null>;
  updateAvailabilitySlotsByRecurrence(recurrenceId: string, data: Partial<InsertAvailabilitySlot>, originalStartTime?: string): Promise<boolean>;
  deleteAvailabilitySlot(id: string): Promise<boolean>;
  deleteAvailabilitySlots(ids: string[]): Promise<boolean>;
  deleteAvailabilitySlotsByRecurrence(recurrenceId: string): Promise<boolean>;
  incrementSlotBooking(slotId: string): Promise<boolean>;
  getAvailabilitySlot(id: string): Promise<AvailabilitySlotType | null>;
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

  // User Accounts
  async getUserAccount(id: string): Promise<UserAccountType | null> {
    return await UserAccount.findById(id).lean() as UserAccountType | null;
  }

  async getUserAccountByEmail(email: string): Promise<UserAccountType | null> {
    return await UserAccount.findOne({ email: email.toLowerCase() }).lean() as UserAccountType | null;
  }

  async createUserAccount(insertUser: InsertUserAccount): Promise<UserAccountType> {
    const user = new UserAccount({ ...insertUser, email: insertUser.email.toLowerCase() });
    const saved = await user.save();
    return saved.toJSON() as unknown as UserAccountType;
  }

  async updateUserAccount(id: string, data: Partial<InsertUserAccount>): Promise<UserAccountType | null> {
    if (data.email) data.email = data.email.toLowerCase();
    return await UserAccount.findByIdAndUpdate(id, data, { new: true }).lean() as UserAccountType | null;
  }

  // OTP
  async saveOtpCode(insertOtp: InsertOtpCode): Promise<void> {
    await OtpCode.findOneAndUpdate(
      { email: insertOtp.email.toLowerCase() },
      { ...insertOtp, email: insertOtp.email.toLowerCase() },
      { upsert: true, new: true }
    );
  }

  async verifyOtpCode(email: string, code: string): Promise<boolean> {
    const otpRecord = await OtpCode.findOne({ email: email.toLowerCase() }).lean() as any;
    if (!otpRecord) return false;
    
    // Check expiration
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await OtpCode.deleteOne({ email: email.toLowerCase() });
      return false;
    }
    
    if (otpRecord.code === code) {
      await OtpCode.deleteOne({ email: email.toLowerCase() }); // Consume OTP
      return true;
    }
    
    // Increment attempts
    await OtpCode.updateOne({ email: email.toLowerCase() }, { $inc: { attempts: 1 } });
    return false;
  }

  async deleteOtpCode(email: string): Promise<void> {
    await OtpCode.deleteOne({ email: email.toLowerCase() });
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

  async updateOrderImage(id: string, url: string): Promise<OrderType | null> {
    return await Order.findByIdAndUpdate(id, { transferImage: url }, { new: true }).lean() as OrderType | null;
  }

  async updateOrderStatus(id: string, status: string): Promise<OrderType | null> {
    return await Order.findByIdAndUpdate(id, { status }, { new: true }).lean() as OrderType | null;
  }

  async updateOrderPlan(id: string, plan: string, amount: number): Promise<OrderType | null> {
    return await Order.findByIdAndUpdate(id, { plan, amount }, { new: true }).lean() as OrderType | null;
  }

  async cancelOrder(id: string, reason: string): Promise<OrderType | null> {
    return await Order.findByIdAndUpdate(id, { status: 'cancelled', cancelReason: reason }, { new: true }).lean() as OrderType | null;
  }

  async getOrders(): Promise<OrderType[]> {
    return await Order.find().sort({ createdAt: -1 }).lean() as unknown as OrderType[];
  }

  async getUserOrders(userId: string): Promise<OrderType[]> {
    return await Order.find({ userId }).sort({ createdAt: -1 }).lean() as unknown as OrderType[];
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

  async getUserTrialBookings(userId: string): Promise<TrialBookingType[]> {
    return await TrialBooking.find({ userId }).sort({ createdAt: -1 }).lean() as unknown as TrialBookingType[];
  }

  async updateTrialStatus(id: string, status: string): Promise<TrialBookingType | null> {
    return await TrialBooking.findByIdAndUpdate(id, { status }, { new: true }).lean() as TrialBookingType | null;
  }

  async updateTrialBooking(id: string, data: Partial<InsertTrialBooking>): Promise<TrialBookingType | null> {
    return await TrialBooking.findByIdAndUpdate(id, data, { new: true }).lean() as TrialBookingType | null;
  }

  async cancelTrialBooking(id: string, reason: string): Promise<TrialBookingType | null> {
    return await TrialBooking.findByIdAndUpdate(id, { status: 'cancelled', cancelReason: reason }, { new: true }).lean() as TrialBookingType | null;
  }

  async deleteTrialBooking(id: string): Promise<boolean> {
    const result = await TrialBooking.findByIdAndDelete(id);
    return !!result;
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

  async createExpertApplication(application: InsertExpertApplication): Promise<ExpertApplicationType> {
    const expertApp = new ExpertApplication(application);
    const saved = await expertApp.save();
    return saved.toJSON() as unknown as ExpertApplicationType;
  }

  async getExpertApplications(): Promise<ExpertApplicationType[]> {
    return await ExpertApplication.find().sort({ createdAt: -1 }).lean() as unknown as ExpertApplicationType[];
  }

  async updateExpertApplicationStatus(id: string, status: string): Promise<ExpertApplicationType | null> {
    return await ExpertApplication.findByIdAndUpdate(id, { status }, { new: true }).lean() as ExpertApplicationType | null;
  }

  async updateExpertApplicationNotes(id: string, notes: string): Promise<ExpertApplicationType | null> {
    return await ExpertApplication.findByIdAndUpdate(id, { adminNotes: notes }, { new: true }).lean() as ExpertApplicationType | null;
  }

  async deleteExpertApplication(id: string): Promise<boolean> {
    const result = await ExpertApplication.findByIdAndDelete(id);
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

  // Availability Slots
  async getAvailabilitySlots(date?: string | Date): Promise<AvailabilitySlotType[]> {
    const filter: any = {};
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);
      filter.date = { $gte: d, $lt: nextDay };
    } else {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      filter.date = { $gte: d };
    }
    return await AvailabilitySlot.find(filter).sort({ date: 1, startTime: 1 }).lean() as unknown as AvailabilitySlotType[];
  }

  async createAvailabilitySlot(slot: InsertAvailabilitySlot): Promise<AvailabilitySlotType> {
    const doc = new AvailabilitySlot(slot);
    const saved = await doc.save();
    return saved.toJSON() as unknown as AvailabilitySlotType;
  }

  async createAvailabilitySlots(slots: InsertAvailabilitySlot[]): Promise<AvailabilitySlotType[]> {
    const docs = await AvailabilitySlot.insertMany(slots);
    return docs.map(doc => doc.toJSON() as unknown as AvailabilitySlotType);
  }

  async updateAvailabilitySlot(id: string, data: Partial<InsertAvailabilitySlot>): Promise<AvailabilitySlotType | null> {
    return await AvailabilitySlot.findByIdAndUpdate(id, data, { new: true }).lean() as AvailabilitySlotType | null;
  }

  async updateAvailabilitySlotsByRecurrence(recurrenceId: string, data: Partial<InsertAvailabilitySlot>, originalStartTime?: string): Promise<boolean> {
    const filter: any = { recurrenceId };
    if (originalStartTime) {
      filter.startTime = originalStartTime;
    }
    
    const updatePayload = { ...data };
    delete (updatePayload as any).date; 
    
    const result = await AvailabilitySlot.updateMany(filter, { $set: updatePayload });
    return result.modifiedCount > 0;
  }

  async deleteAvailabilitySlot(id: string): Promise<boolean> {
    const result = await AvailabilitySlot.findByIdAndDelete(id);
    return !!result;
  }

  async deleteAvailabilitySlots(ids: string[]): Promise<boolean> {
    const result = await AvailabilitySlot.deleteMany({ _id: { $in: ids } });
    return result.deletedCount > 0;
  }

  async deleteAvailabilitySlotsByRecurrence(recurrenceId: string): Promise<boolean> {
    const result = await AvailabilitySlot.deleteMany({ recurrenceId });
    return result.deletedCount > 0;
  }

  async incrementSlotBooking(slotId: string): Promise<boolean> {
    const result = await AvailabilitySlot.findByIdAndUpdate(
      slotId,
      { $inc: { totalBooked: 1 } },
      { new: true }
    );
    return !!result;
  }

  async getAvailabilitySlot(id: string): Promise<AvailabilitySlotType | null> {
    return await AvailabilitySlot.findById(id).lean() as AvailabilitySlotType | null;
  }
}

export const storage = new DatabaseStorage();