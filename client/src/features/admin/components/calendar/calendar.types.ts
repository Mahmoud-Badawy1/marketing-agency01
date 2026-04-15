import type { AvailabilitySlotType } from "@shared/schema";

export interface CalendarSlot extends AvailabilitySlotType {}

export interface BulkConfig {
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
  label: string;
}

export interface NewSlot {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  label: string;
}

export interface RestructureConfig {
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
}

export interface BulkEditConfig {
  capacity?: number;
  label?: string;
  isActive?: boolean;
}

export const daysMap = [
  { id: 0, label: "الأحد" },
  { id: 1, label: "الإثنين" },
  { id: 2, label: "الثلاثاء" },
  { id: 3, label: "الأربعاء" },
  { id: 4, label: "الخميس" },
  { id: 5, label: "الجمعة" },
  { id: 6, label: "السبت" },
];
