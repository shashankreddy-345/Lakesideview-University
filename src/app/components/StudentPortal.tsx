import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Users, Star, Calendar, X, Check } from "lucide-react";
import { Resource } from "../types";
import { format, addDays, startOfWeek } from "date-fns";

type ResourceType = string;

export default function StudentPortal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<ResourceType>('all');
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch resources and bookings from API
  useEffect(() => {
    const fetchData = async () => {
      const API_URL = import.meta.env.VITE_API_URL || '';
      try {
        setLoading(true);
        const [resResponse, bookingsResponse] = await Promise.all([
          fetch(`${API_URL}/api/resources`),
          fetch(`${API_URL}/api/bookings`)
        ]);
        
        if (!resResponse.ok || !bookingsResponse.ok) {
          throw new Error(`API Error: ${resResponse.status} ${resResponse.statusText}`);
        }

        const resData = await resResponse.json();
        const bookingsData = await bookingsResponse.json();

        // Map MongoDB _id to frontend id
        const mappedResources = resData.map((r: any) => ({ ...r, id: r._id }));
        setResources(mappedResources);
        setBookings(bookingsData);
        setError(null);
      } catch (error: any) {
        console.error("Failed to fetch data", error);
        setError(error.message || "Could not load resources. Is the backend server running?");
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Generate slots based on resources and bookings
  useEffect(() => {
    if (resources.length > 0) {
      const slots: any[] = [];
      const times = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
      
      // Generate slots for next 14 days
      const today = new Date();
      
      for (let day = 0; day < 14; day++) {
        const date = addDays(today, day);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        resources.forEach(resource => {
          times.forEach(time => {
            const endHour = parseInt(time.split(':')[0]) + 1;
            const endTime = `${endHour}:00`;
            
            // Calculate occupancy
            const activeBookings = bookings.filter((b: any) => {
              const bResId = typeof b.resourceId === 'object' ? b.resourceId?._id : b.resourceId;
              return bResId === resource.id && 
                     b.date === dateStr && 
                     b.startTime === time &&
                     b.status !== 'cancelled';
            });
            
            const occupancy = activeBookings.length;
            const isAvailable = occupancy < resource.capacity;
            
            slots.push({
              id: `slot-${resource.id}-${dateStr}-${time}`,
              resourceId: resource.id,
              date: dateStr,
              startTime: time,
              endTime: endTime,
              available: isAvailable,
              occupancy,
              capacity: resource.capacity
            });
          });
        });
      }
      setTimeSlots(slots);
    }
  }, [resources, bookings]);

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.building.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  // Get time slots for selected resource and date
  const getAvailableSlots = () => {
    if (!selectedResource) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return timeSlots.filter(slot => 
      slot.resourceId === selectedResource && 
      slot.date === dateStr
    );
  };

  const handleBookSlot = (slot: any) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user._id || user.user_id || user.studentId || localStorage.getItem('userId');
    if (!studentId) {
      alert("Please log in to book a resource.");
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || '';
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId,
          resourceId: selectedResource,
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          status: 'upcoming'
        })
      });

      if (response.ok) {
        setShowBookingModal(false);
        alert('Booking confirmed! You will receive a confirmation email shortly.');
        // Refresh bookings to update availability
        const bookingsRes = await fetch(`${API_URL}/api/bookings`);
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
        
        // Simulate session end for demo purposes to show rating modal
        setTimeout(() => setShowRatingModal(true), 2000);
      } else {
        alert('Failed to book slot. Please try again.');
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert('An error occurred while booking.');
    }
  };

  const submitRating = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user._id || user.user_id || user.studentId || localStorage.getItem('userId');
    
    const API_URL = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId || 'Anonymous',
          rating,
          comment: feedback,
          date: format(new Date(), 'yyyy-MM-dd')
        })
      });
      
      setShowRatingModal(false);
      alert('Thank you for your feedback!');
      setRating(0);
      setFeedback("");
    } catch (error) {
      console.error("Feedback error:", error);
      alert('Failed to submit feedback.');
    }
  };

  const resourceTypeLabel = (type: string) => {
    switch (type) {
      case 'study-room': return 'Study Room';
      case 'c-lab': return 'Computer Lab';
      case 'conf-room': return 'Conference Room';
      default: return type;
    }
  };

  // Generate next 7 days for calendar
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const selectedResourceData = resources.find(r => r.id === selectedResource);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Book Campus Resources</h1>
        <p className="text-muted-foreground">
          Find and reserve study rooms, VR labs, and tutoring sessions
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-bold">Connection Error</p>
          <p>{error}</p>
          <p className="text-sm mt-1">Run <code className="bg-red-100 px-1 rounded">node index.js</code> in your terminal to start the backend.</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filterType === 'all'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-border hover:bg-accent'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('study-room')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filterType === 'study-room'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-border hover:bg-accent'
              }`}
            >
              Study Rooms
            </button>
            <button
              onClick={() => setFilterType('c-lab')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filterType === 'c-lab'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-border hover:bg-accent'
              }`}
            >
              Computer Labs
            </button>
            <button
              onClick={() => setFilterType('conf-room')}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filterType === 'conf-room'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white border-border hover:bg-accent'
              }`}
            >
              Conference Rooms
            </button>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredResources.map((resource) => (
          <div
            key={resource.id}
            className={`bg-white rounded-xl shadow-md p-5 border-2 transition-all hover:shadow-lg cursor-pointer ${
              selectedResource === resource.id ? 'border-primary' : 'border-border'
            }`}
            onClick={() => setSelectedResource(resource.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg mb-1">{resource.name}</h3>
                <span className="inline-block text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                  {resourceTypeLabel(resource.type)}
                </span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs ${
                resource.status === 'over-utilized' ? 'bg-red-100 text-red-700' :
                resource.status === 'under-utilized' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {resource.utilization}%
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{resource.building}, Floor {resource.floor}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Capacity: {resource.capacity} people</span>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-2">Amenities:</p>
              <div className="flex flex-wrap gap-1">
                {resource.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {selectedResource === resource.id && (
              <div className="mt-4 pt-4 border-t border-border cursor-default" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Select a date and available time slot
                  </p>
                  
                  {/* Date Selector */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Select Date</h3>
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((day) => {
                        const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const isPast = day < today;
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => !isPast && setSelectedDate(day)}
                            disabled={isPast}
                            className={`p-1 md:p-2 rounded-lg border text-center transition-colors ${
                              isSelected
                                ? 'bg-primary text-white border-primary'
                                : isPast
                                ? 'bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50'
                                : 'bg-white border-border hover:bg-accent'
                            }`}
                          >
                            <div className="text-[10px] mb-0.5">{format(day, 'EEE')}</div>
                            <div className="text-sm font-bold">{format(day, 'd')}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Available Slots</h3>
                    {resource.utilization >= 100 ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        This resource is at 100% utilization. Booking is disabled.
                      </div>
                    ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {getAvailableSlots().map((slot) => {
                        const now = new Date();
                        const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
                        const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
                        const isPastTime = isToday && (
                          slotHour < now.getHours() || 
                          (slotHour === now.getHours() && slotMinute < now.getMinutes())
                        );
                        const isBookable = slot.available && !isPastTime;

                        return (
                          <button
                            key={slot.id}
                            onClick={() => isBookable && handleBookSlot(slot)}
                            disabled={!isBookable}
                            className={`p-2 rounded-lg border text-center transition-colors ${
                              isBookable
                                ? 'bg-green-50 border-green-200 hover:bg-green-100 text-green-900'
                                : isPastTime
                                  ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-red-50 border-red-200 text-red-900 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <div className="text-sm font-medium">{slot.startTime}</div>
                            <div className="text-[10px] opacity-80">
                              {isPastTime ? 'Unavailable' : (slot.available ? 'Available' : 'Booked')}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl">Confirm Booking</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Resource</p>
                <p className="text-lg">{selectedResourceData?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p>{selectedResourceData?.building}, Floor {selectedResourceData?.floor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p>{format(selectedDate, 'MMMM d, yyyy')}</p>
                <p>{selectedSlot.startTime} - {selectedSlot.endTime}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl">Rate Your Experience</h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">
                How was your experience with the booking system?
              </p>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating
                          ? 'fill-primary text-primary'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your feedback (optional)..."
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Skip
              </button>
              <button
                onClick={submitRating}
                disabled={rating === 0}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
