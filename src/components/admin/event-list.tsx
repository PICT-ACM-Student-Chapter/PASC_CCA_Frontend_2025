import { useState, useEffect } from 'react';
import { Event, EventStatus } from '@/types/events';
import { EventCard } from '@/components/admin/event-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 8;

// ---------- Reusable Pagination bar ----------
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className='flex items-center justify-center gap-1 mt-6'>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-border bg-card text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
      >
        <ChevronLeft className='w-4 h-4' /> Prev
      </button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={'dots-' + idx} className='px-2 py-2 text-muted-foreground text-sm'>
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={
              'w-10 h-10 rounded-lg text-sm font-medium transition-colors border ' +
              (currentPage === page
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:bg-accent')
            }
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-border bg-card text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
      >
        Next <ChevronRight className='w-4 h-4' />
      </button>
    </div>
  );
}

// ---------- EventsList ----------
interface EventsListProps {
  events: Event[];
  filterStatus: EventStatus;
  onRefresh?: () => void;
}

export const EventsList = ({ events, filterStatus, onRefresh }: EventsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page whenever the filter tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const filteredEvents =
    filterStatus !== 'ALL EVENTS'
      ? events.filter((event) => event.status === filterStatus)
      : events;

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginated = filteredEvents.slice(start, start + PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the list smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (filteredEvents.length === 0) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        <p className='text-lg font-medium'>No events found</p>
        <p className='text-sm mt-1'>
          {filterStatus !== 'ALL EVENTS'
            ? `No ${filterStatus.toLowerCase()} events at the moment.`
            : 'Create your first event to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results info */}
      <p className='text-sm text-muted-foreground mb-4'>
        Showing {start + 1}–{Math.min(start + PAGE_SIZE, filteredEvents.length)} of{' '}
        {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
      </p>

      <div className='space-y-4'>
        {paginated.map((event) => (
          <EventCard key={event.id} {...event} onRefresh={onRefresh} />
        ))}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
