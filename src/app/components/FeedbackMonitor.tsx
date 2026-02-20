import { Star, MessageSquare, Search, Filter, ArrowUpDown } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const itemsPerPage = 5;

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    fetch(`${API_URL}/api/feedback`)
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

  const filteredFeedback = feedbackData
    .filter(item => {
      const matchesSearch = (item.comment?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                            (item.studentId?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesRating = filterRating === 'all' || item.rating === filterRating;
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => setCurrentPage(1), [searchQuery, filterRating, sortOrder]);

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-lg">Student Reviews ({filteredFeedback.length})</h3>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-48"
              />
            </div>
            
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="pl-9 pr-8 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white cursor-pointer w-full"
              >
                <option value="all">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="relative flex-1 md:flex-none">
              <ArrowUpDown className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="pl-9 pr-8 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white cursor-pointer w-full"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {paginatedFeedback.length > 0 ? (
            paginatedFeedback.map((feedback) => (
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
                  <p className="text-xs text-muted-foreground">{feedback.date}</p>
                </div>
              </div>
            </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No reviews found matching your criteria.</p>
          )}
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
