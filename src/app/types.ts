export interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  utilization: number;
  status: 'over-utilized' | 'optimal' | 'under-utilized';
  building: string;
  floor: number;
  amenities: string[];
}

export interface TimeSlot {
  id: string;
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  bookedBy?: string;
  occupancy?: number;
  capacity?: number;
}

export interface Booking {
  id: string;
  studentId: string;
  resourceId: string;
  resourceName: string;
  building: string;
  floor: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  rating?: number;
  feedback?: string;
}

export interface Feedback {
  id: string;
  studentId: string;
  rating: number;
  comment: string;
  date: string;
}