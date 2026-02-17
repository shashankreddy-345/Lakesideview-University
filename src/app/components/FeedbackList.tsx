import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { Star } from "lucide-react";

interface FeedbackItem {
  _id: string;
  studentId: string;
  rating: number;
  comment: string;
  date: string;
}

export default function FeedbackList() {
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback(currentPage);
  }, [currentPage]);

  const fetchFeedback = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/feedback?page=${page}&limit=5`);
      const data = await res.json();
      
      if (data.feedback) {
        setFeedbackData(data.feedback);
        setTotalPages(data.totalPages);
      } else {
        // Fallback for non-paginated response
        setFeedbackData(Array.isArray(data) ? data : []);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl">Student Application Feedback</h2>
      
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading feedback...</div>
      ) : (
        <div className="grid gap-4">
          {feedbackData.length === 0 ? (
            <p className="text-muted-foreground">No feedback available.</p>
          ) : (
            feedbackData.map((item) => (
              <div key={item._id} className="p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </div>
                <p className="text-sm">{item.comment}</p>
                <p className="text-xs text-muted-foreground mt-2">Student ID: {item.studentId}</p>
              </div>
            ))
          )}
        </div>
      )}

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
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

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
  );
}