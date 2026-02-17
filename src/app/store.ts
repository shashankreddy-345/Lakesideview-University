import { Resource, Booking } from './types';

// Store to handle data transformation and calculations
export const store = {
  // Fetch resources and calculate utilization dynamically
  getResources: async (): Promise<Resource[]> => {
    try {
      // Fetch both resources and bookings to calculate utilization
      const [resourcesRes, bookingsRes] = await Promise.all([
        fetch('/api/resources'),
        fetch('/api/bookings')
      ]);

      if (!resourcesRes.ok || !bookingsRes.ok) {
        throw new Error('Failed to fetch data from backend');
      }

      const rawResources = await resourcesRes.json();
      const rawBookings = await bookingsRes.json();

      // Transform raw data into frontend-ready format
      return rawResources.map((r: any) => {
        // 1. Calculate Occupancy (Number of active bookings for this resource)
        const resourceBookings = rawBookings.filter((b: any) => 
          (b.resourceId === r._id || (b.resourceId && b.resourceId._id === r._id)) && 
          b.status !== 'cancelled'
        );

        // 2. Calculate Utilization Percentage
        // Logic: (Occupancy / Capacity Ratio)
        // We assume a standard weekly operating window (e.g., 40 slots) to normalize the ratio
        // If capacity is high, the resource can handle more bookings before becoming "over-utilized"
        const weeklySlots = 40; 
        const occupancy = resourceBookings.length;
        
        // Utilization = (Active Bookings / (Weekly Slots * Capacity Factor)) * 100
        // We use capacity as a factor: larger rooms expect more traffic
        const capacityFactor = Math.max(1, r.capacity / 10); 
        const utilization = Math.min(100, Math.round((occupancy / (weeklySlots * capacityFactor)) * 100));

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
      const res = await fetch(`/api/bookings/${studentId}`);
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