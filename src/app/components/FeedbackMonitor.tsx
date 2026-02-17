import { Star, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";

export default function FeedbackMonitor() {
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch('/api/feedback')
      .then(res => res.json())
      .then(data => setFeedbackData(data))
      .catch(() => setFeedbackData([]));
  }, []);

  const ratingDistribution = [
    { rating: '5 Stars', count: feedbackData.filter(f => f.rating === 5).length },
    { rating: '4 Stars', count: feedbackData.filter(f => f.rating === 4).length },
    { rating: '3 Stars', count: feedbackData.filter(f => f.rating === 3).length },
    { rating: '2 Stars', count: feedbackData.filter(f => f.rating === 2).length },
    { rating: '1 Star', count: feedbackData.filter(f => f.rating === 1).length },
  ];

  const averageRating = feedbackData.length > 0 
    ? (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1)
    : "0.0";

  const totalPages = Math.ceil(feedbackData.length / itemsPerPage);
  const paginatedFeedback = feedbackData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 md:p-8 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Application Feedback Monitor</h1>
        <p className="text-muted-foreground">
          Track student satisfaction and gather insights about the booking system
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-sm text-muted-foreground">Total Feedback</h3>
          </div>
          <p className="text-3xl">{feedbackData.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-primary" />
            <h3 className="text-sm text-muted-foreground">Average Rating</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl">{averageRating}</p>
            <span className="text-sm text-muted-foreground">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-border">
          <h3 className="text-lg mb-4">Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="rating" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip />
              <Bar dataKey="count" fill="#003DA5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-border">
        <h3 className="text-lg mb-4">Student Reviews ({feedbackData.length})</h3>
        <div className="space-y-4">
          {paginatedFeedback.map((feedback) => (
            <div key={feedback.id} className="border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < feedback.rating ? 'fill-primary text-primary' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      {feedback.rating}.0 / 5.0
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{feedback.comment}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-muted-foreground">ID: {feedback.studentId}</p>
                  <p className="text-xs text-muted-foreground">{feedback.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(p => p - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              <PaginationItem>
                <span className="flex h-9 items-center justify-center px-4 text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(p => p + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

    </div>
  );
}
