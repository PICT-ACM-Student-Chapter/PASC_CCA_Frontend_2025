'use client';
import { EventWithRsvp } from '@/types/events';
import { useState } from 'react';
import { EventCard } from '@/components/student/event-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 6;

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
    <div className='flex items-center justify-center gap-1 mt-8'>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
      >
        <ChevronLeft className='w-4 h-4' /> Prev
      </button>

      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={'dots-' + idx} className='px-2 py-2 text-gray-400 text-sm'>
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={
              'w-10 h-10 rounded-lg text-sm font-medium transition-colors border ' +
              (currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50')
            }
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
      >
        Next <ChevronRight className='w-4 h-4' />
      </button>
    </div>
  );
}

// ---------- Main component ----------
export const EventsTab = ({ eventsWithRsvp }: { eventsWithRsvp: EventWithRsvp[] }) => {
  const [activeTab, setActiveTab] = useState('all-events');
  const [searchQuery, setSearchQuery] = useState('');

  // Separate page counter per tab so switching tabs keeps each tab's scroll position
  const [pages, setPages] = useState<Record<string, number>>({
    'all-events': 1,
    upcoming: 1,
    ongoing: 1,
    completed: 1,
  });

  const setPage = (tab: string, page: number) =>
    setPages((prev) => ({ ...prev, [tab]: page }));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset all tab pages when search changes
    setPages({ 'all-events': 1, upcoming: 1, ongoing: 1, completed: 1 });
  };

  const filterEvents = (status?: string) => {
    let filtered = eventsWithRsvp;

    // Filter by RSVP status ("My Events")
    if (status === "my-events") {
      filtered = filtered.filter(e => e.rsvp !== null && e.rsvp !== undefined);
    }
    // Filter by status for other tabs
    else if (status && status !== "all-events") {
      filtered = filtered.filter(e => e.event.status === status.toUpperCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.event.title.toLowerCase().includes(q) ||
          e.event.description.toLowerCase().includes(q) ||
          e.event.location.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const getTabContent = (tabValue: string) => {
    const filteredEvents = filterEvents(tabValue);
    const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
    const currentPage = Math.min(pages[tabValue] ?? 1, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const paginated = filteredEvents.slice(start, start + PAGE_SIZE);

    if (filteredEvents.length === 0) {
      return (
        <div className='text-center py-12'>
          <Search className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <p className='text-gray-500 text-lg'>No events found</p>
          <p className='text-gray-400 text-sm mt-2'>
            {searchQuery ? 'Try adjusting your search' : 'Check back later for new events'}
          </p>
        </div>
      );
    }

    return (
      <div>
        <p className='text-sm text-gray-600 mb-4'>
          Showing {start + 1}–{Math.min(start + PAGE_SIZE, filteredEvents.length)} of{' '}
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {paginated.map((eventWithRsvp, index) => (
            <EventCard key={eventWithRsvp.event.id ?? index} eventWithRsvp={eventWithRsvp} />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setPage(tabValue, page)}
        />
      </div>
    );
  };

  return (
    <div className='max-w-7xl mx-auto px-4'>
      {/* Search Bar */}
      <div className='mb-6'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
          <input
            type='text'
            placeholder='Search events by title, description, or location...'
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Full width tabs container with gray background */}
        <div className="w-full rounded-lg p-1 mb-6">
          <TabsList className="w-full h-auto p-3 flex justify-between items-center bg-gray-100 rounded-lg flex-wrap gap-2">
            <TabsTrigger
              value="all-events"
              className="text-sm py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 flex-1 whitespace-nowrap"
            >
              All Events
            </TabsTrigger>
            <TabsTrigger
              value="my-events"
              className="text-sm py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 flex-1 whitespace-nowrap"
            >
              My Events
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="text-sm py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 flex-1 whitespace-nowrap"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="ongoing"
              className="text-sm py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 flex-1 whitespace-nowrap"
            >
              Ongoing
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="text-sm py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200 flex-1 whitespace-nowrap"
            >
              Completed
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all-events" className="mt-0">
          {getTabContent('all-events')}
        </TabsContent>
        <TabsContent value="my-events" className="mt-0">
          {getTabContent('my-events')}
        </TabsContent>
        <TabsContent value="upcoming" className="mt-0">
          {getTabContent('upcoming')}
        </TabsContent>
        <TabsContent value="ongoing" className="mt-0">
          {getTabContent('ongoing')}
        </TabsContent>
        <TabsContent value="completed" className="mt-0">
          {getTabContent('completed')}
        </TabsContent>
      </Tabs>
    </div>
  );
};