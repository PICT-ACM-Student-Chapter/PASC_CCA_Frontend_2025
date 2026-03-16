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
    <div className='flex items-center justify-center gap-1.5 mt-8'>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-medium border border-[var(--color-border-light)] bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className='w-4 h-4' /> Prev
      </button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={'dots-' + idx} className='px-2 py-2 text-[var(--color-text-muted)] text-sm select-none'>
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={
              'w-10 h-10 rounded-xl text-sm font-medium transition-all border ' +
              (currentPage === page
                ? 'bg-[var(--color-button-primary)] text-white border-transparent shadow-sm'
                : 'bg-[var(--color-card)] text-[var(--color-text-secondary)] border-[var(--color-border-light)] hover:bg-[var(--color-surface)]')
            }
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-medium border border-[var(--color-border-light)] bg-[var(--color-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

  const safeEvents = Array.isArray(events) ? events : [];
  const filteredEvents =
    filterStatus !== 'ALL EVENTS'
      ? safeEvents.filter((event) => event.status === filterStatus)
      : safeEvents;

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
      <div className='flex flex-col items-center justify-center py-16 text-[var(--color-text-muted)]'>
        <p className='text-[var(--color-text-primary)] font-medium'>No events found</p>
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
      <p className='text-[13px] text-[var(--color-text-muted)] mb-5 tabular-nums'>
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
