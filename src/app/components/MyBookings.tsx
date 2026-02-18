import { Calendar, MapPin, Clock, Users, X, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Booking } from "../types";
import { format, addDays } from "date-fns";

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = user._id || user.user_id || user.studentId || localStorage.getItem('userId');
    if (!studentId) {
      setBookings([]);
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || '';
    fetch(`${API_URL}/api/bookings/${studentId}`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((b: any) => {
          let status = b.status;
          
          if (status !== 'cancelled') {
            const [hours, minutes] = b.endTime.split(':');
            const paddedTime = `${hours.padStart(2, '0')}:${minutes}`;
            const bookingEnd = new Date(`${b.date}T${paddedTime}`);
            const now = new Date();
            
            if (now > bookingEnd) {
              status = 'completed';
            } else {
              status = 'upcoming';
            }
          }

          return {
            id: b._id,
            resourceId: b.resourceId?._id || 'unknown',
            resourceName: b.resourceId?.name || 'Unknown Resource',
            building: b.resourceId?.building || 'Unknown Building',
            floor: b.resourceId?.floor || 1,
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            status: status
          };
        });
        setBookings(mapped);
      })
      .catch(() => setBookings([]));
  }, []);

  const filteredBookings = bookings.filter(b => 
    filterStatus === 'all' || b.status === filterStatus
  );

  const handleCancelBooking = () => {
    if (selectedBooking) {
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: 'cancelled' as const } : b
      ));
      setShowCancelModal(false);
      setSelectedBooking(null);
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
      console.error("Error submitting feedback:", error);
    }
  };

  const upcomingCount = bookings.filter(b => b.status === 'upcoming').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your resource reservations
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl">{upcomingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl">{bookings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-border mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-primary text-white'
                : 'bg-accent text-accent-foreground hover:bg-accent/70'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'upcoming'
                ? 'bg-primary text-white'
                : 'bg-accent text-accent-foreground hover:bg-accent/70'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterStatus === 'completed'
                ? 'bg-primary text-white'
                : 'bg-accent text-accent-foreground hover:bg-accent/70'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 border border-border text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl mb-2">No bookings found</h3>
            <p className="text-muted-foreground">
              {filterStatus === 'all' 
                ? "You don't have any bookings yet."
                : `You don't have any ${filterStatus} bookings.`}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl shadow-md p-6 border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl">{booking.resourceName}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      booking.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{booking.building}, Floor {booking.floor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{format(new Date(booking.date), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{booking.startTime} - {booking.endTime}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {booking.status === 'upcoming' && (
                      <>
                        <button 
                          onClick={() => alert(`Details for ${booking.resourceName}:\nDate: ${booking.date}\nTime: ${booking.startTime}-${booking.endTime}`)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowCancelModal(true);
                          }}
                          className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}
                    {booking.status === 'completed' && (
                      <button 
                        onClick={() => setShowRatingModal(true)}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                      >
                        Rate Experience
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl">Cancel Booking?</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to cancel your booking for <strong>{selectedBooking.resourceName}</strong> on{' '}
              {format(new Date(selectedBooking.date), 'MMMM d, yyyy')}?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Booking
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
