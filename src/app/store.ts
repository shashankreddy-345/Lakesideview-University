import { Resource, Booking } from './types';

const API_URL = import.meta.env.VITE_API_URL || '';

// Store to handle data transformation and calculations
export const store = {
  // Fetch resources and calculate utilization dynamically
  getResources: async (): Promise<Resource[]> => {
    try {
      // Fetch both resources and bookings to calculate utilization
      const [resourcesRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/api/resources`),
        fetch(`${API_URL}/api/bookings`)
      ]);

      if (!resourcesRes.ok || !bookingsRes.ok) {
        throw new Error('Failed to fetch data from backend');
      }

      const rawResources = await resourcesRes.json();
      const rawBookings = await bookingsRes.json();

      // Calculate total unique days across ALL bookings to establish the time window
      const allDates = new Set(rawBookings.map((b: any) => b.date));
      const totalDays = Math.max(1, allDates.size);

      // Transform raw data into frontend-ready format
      return rawResources.map((r: any) => {
        // 1. Calculate Occupancy (Number of active bookings for this resource)
        const resourceBookings = rawBookings.filter((b: any) => 
          (b.resourceId === r._id || (b.resourceId && b.resourceId._id === r._id)) && 
          b.status !== 'cancelled'
        );

        // 2. Calculate Utilization Percentage
        // Logic: Average Hourly Utilization
        // For every hour: (number of bookings / capacity)
        let totalHourlyUtilization = 0;
        let totalHours = 0;

        allDates.forEach((date: any) => {
          for (let hour = 8; hour < 22; hour++) {
            const slotStart = hour;
            const slotEnd = hour + 1;

            const bookingsInHour = resourceBookings.filter((b: any) => {
              if (b.date !== date) return false;
              const [sH, sM] = b.startTime.split(':').map(Number);
              const [eH, eM] = b.endTime.split(':').map(Number);
              const start = sH + sM / 60;
              const end = eH + eM / 60;
              return start < slotEnd && end > slotStart;
            }).length;

            totalHourlyUtilization += Math.min(1, bookingsInHour / (r.capacity || 1));
            totalHours++;
          }
        });

        const utilization = totalHours > 0 ? Math.min(100, Math.round((totalHourlyUtilization / totalHours) * 100)) : 0;

        // 3. Determine Status based on Utilization
        let status: 'optimal' | 'over-utilized' | 'under-utilized' = 'optimal';
        if (utilization > 80) status = 'over-utilized';
        else if (utilization < 30) status = 'under-utilized';

        // Return enriched object matching the Resource interface
        return {
          id: r._id,
          name: r.name,
          type: r.type,
          capacity: r.capacity,
          utilization: utilization, // Calculated field
          status: status,           // Calculated field
          building: r.building,
          floor: r.floor,
          amenities: r.amenities || []
        };
      });
    } catch (error) {
      console.error("Store Error (getResources):", error);
      return [];
    }
  },

  // Fetch bookings for a specific student
  getBookings: async (studentId: string): Promise<Booking[]> => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${studentId}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      
      return data.map((b: any) => ({
        id: b._id,
        studentId: b.studentId,
        resourceId: b.resourceId?._id || 'unknown',
        resourceName: b.resourceId?.name || 'Unknown Resource',
        building: b.resourceId?.building || 'Unknown Building',
        floor: b.resourceId?.floor || 1,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status
      }));
    } catch (error) {
      console.error("Store Error (getBookings):", error);
      return [];
    }
  }
};