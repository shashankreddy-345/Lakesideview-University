import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Star, Clock } from 'lucide-react';

interface Booking {
  _id?: string;
  resourceName?: string;
  resourceId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: string;
  studentId: string | { _id: string };
}

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      // Use studentId if available, otherwise fallback to _id (e.g. LSV-0001)
      const userId = user?.studentId || user?._id;

      if (!userId) return;

      try {
        const response = await fetch('/api/bookings');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched bookings:', data);
          console.log('Filtering for User ID:', userId);

          // Filter bookings for the logged-in student
          const userBookings = data.filter((b: any) => {
            const bookingStudentId = typeof b.studentId === 'object' ? b.studentId?._id : b.studentId;
            return bookingStudentId === userId;
          });
          
          // Sort by date (newest first)
          userBookings.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setBookings(userBookings);
        }
      } catch (error) {
        console.error('Failed to fetch bookings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const getStatus = (booking: Booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    // If status is explicitly set in DB, use it, otherwise infer from date
    if (booking.status === 'completed') return 'completed';
    if (booking.status === 'cancelled') return 'cancelled';
    if (bookingDate < now) return 'completed';
    return 'upcoming';
  };

  const filteredBookings = bookings.filter(booking => {
    const status = getStatus(booking);
    if (filter === 'upcoming') return status === 'upcoming';
    if (filter === 'completed') return status === 'completed';
    return true;
  });

  const upcomingCount = bookings.filter(b => getStatus(b) === 'upcoming').length;
  const completedCount = bookings.filter(b => getStatus(b) === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your resource reservations</p>
      </div>

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

      <div className="bg-white rounded-xl shadow-md p-4 border border-border mb-6">
        <div className="flex gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-accent text-accent-foreground hover:bg-accent/70'}`}>All ({bookings.length})</button>
          <button onClick={() => setFilter('upcoming')} className={`px-4 py-2 rounded-lg transition-colors ${filter === 'upcoming' ? 'bg-primary text-white' : 'bg-accent text-accent-foreground hover:bg-accent/70'}`}>Upcoming ({upcomingCount})</button>
          <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-lg transition-colors ${filter === 'completed' ? 'bg-primary text-white' : 'bg-accent text-accent-foreground hover:bg-accent/70'}`}>Completed ({completedCount})</button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 border border-border text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl mb-2">No bookings found</h3>
            <p className="text-muted-foreground">You don't have any bookings yet.</p>
          </div>
        ) : (
          filteredBookings.map((booking, index) => (
            <div key={booking._id || index} className="bg-white rounded-xl shadow-md p-6 border border-border flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-semibold text-lg">{booking.resourceName || booking.resourceId || 'Study Room'}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatus(booking) === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {getStatus(booking).charAt(0).toUpperCase() + getStatus(booking).slice(1)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBookings;