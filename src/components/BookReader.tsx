'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Battery } from 'lucide-react'
import { Button } from './ui/button'
import { BookType } from '../types/book'
import { useReadingProgress } from '../hooks/useReadingProgress'
import { WordPopover } from './WordPopover'
import { isChinese, fetchSegments, Segment } from '../lib/chinese-utils'

interface FooterProps {
  currentPage: number;
  totalPages: number;
  isDarkMode: boolean;
  backgroundColor: string;
}

const Footer: React.FC<FooterProps> = ({
  currentPage,
  totalPages,
  isDarkMode,
  backgroundColor
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)

    const updateBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery()
          setBatteryLevel(Math.round(battery.level * 100))

          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100))
          })
        } catch (error) {
          console.error('Error accessing battery status:', error)
          setBatteryLevel(null)
        }
      } else {
        console.log('Battery Status API not supported')
        setBatteryLevel(null)
      }
    }

    updateBattery()

    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-2 flex justify-between items-center text-xs"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : backgroundColor,
        color: isDarkMode ? '#9ca3af' : '#4b5563',
        borderTop: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
      }}
    >
      <div className="flex items-center space-x-2">
        <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {batteryLevel !== null && (
          <div className="flex items-center space-x-1">
            <Battery className="h-3 w-3" />
            <span>{batteryLevel}%</span>
          </div>
        )}
      </div>
      <div>
        {currentPage}/{totalPages}
      </div>
    </div>
  )
}

interface BookReaderProps {
  book: BookType;
  showSpaces: boolean;
  segmentedContent: string;
  isFullscreen: boolean;
  isDarkMode: boolean;
  fontFamily: string;
  textAlign: string;
  brightness: number;
  backgroundColor: string;
  fontSize: number;
  toggleFullscreen: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({
  book,
  showSpaces,
  segmentedContent,
  isFullscreen,
  isDarkMode,
  fontFamily,
  textAlign,
  brightness,
  backgroundColor,
  fontSize,
  toggleFullscreen
}) => {
  const content = showSpaces ? segmentedContent : (book.content || '')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)
  const totalPages = Math.ceil(content.split('\n').length / 20)
  const readerRef = useRef<HTMLDivElement>(null)
  const isFullscreenRef = useRef(isFullscreen)
  
  const { scrollPosition, progressPercentage, updateProgress } = useReadingProgress(book.id)

  const [segments, setSegments] = React.useState<Segment[]>([])

  const contentRef = useRef<string>(content) // Add this ref to track content changes
  const scrollRestoredRef = useRef(false) // Add this ref to track if scroll has been restored

  const previousContentRef = useRef<string>(content)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    isFullscreenRef.current = isFullscreen
  }, [isFullscreen])

  // Combine scroll position restoration logic into a single effect
  useEffect(() => {
    const restoreScrollPosition = () => {
      if (
        readerRef.current &&
        scrollPosition > 0 &&
        !scrollRestoredRef.current &&
        content === contentRef.current // Only restore if content hasn't changed
      ) {
        requestAnimationFrame(() => {
          if (readerRef.current) {
            readerRef.current.scrollTop = scrollPosition;
            scrollRestoredRef.current = true;
          }
        });
      }
    };

    // Reset scroll restoration flag when content changes
    if (content !== contentRef.current) {
      scrollRestoredRef.current = false;
      contentRef.current = content;
    }

    // Attempt to restore scroll position
    restoreScrollPosition();

    // Add smooth scrolling behavior to the reader container
    if (readerRef.current) {
      readerRef.current.style.scrollBehavior = 'smooth';
    }

    const currentReader = readerRef.current;

    // Clean up
    return () => {
      if (currentReader) {
        currentReader.style.scrollBehavior = 'auto';
      }
    };
  }, [content, scrollPosition]);

  // Replace the scroll position restoration effect with this optimized version
  useEffect(() => {
    const restoreScrollPosition = () => {
      if (readerRef.current && scrollPosition > 0 && !scrollRestoredRef.current) {
        // Use rAF for smoother scroll restoration
        requestAnimationFrame(() => {
          if (readerRef.current) {
            readerRef.current.style.scrollBehavior = 'auto';
            readerRef.current.scrollTop = scrollPosition;
            // Reset scroll behavior after a small delay
            setTimeout(() => {
              if (readerRef.current) {
                readerRef.current.style.scrollBehavior = 'smooth';
              }
            }, 100);
            scrollRestoredRef.current = true;
          }
        });
      }
    };

    restoreScrollPosition();
  }, [scrollPosition]);

  // Modify the scroll position restoration effect
  useEffect(() => {
    const restoreScrollPosition = () => {
      if (readerRef.current && scrollPosition > 0) {
        // Clear any existing scroll timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }

        // Set a timeout to ensure content is rendered before scrolling
        scrollTimeoutRef.current = setTimeout(() => {
          if (readerRef.current) {
            readerRef.current.scrollTop = scrollPosition
          }
        }, 100) // Small delay to ensure content is rendered
      }
    }

    // Only restore scroll position if content hasn't changed
    if (content === previousContentRef.current) {
      restoreScrollPosition()
    }

    // Update the previous content ref
    previousContentRef.current = content

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [content, scrollPosition, showSpaces])

  // Modify the scroll event handler to be more efficient
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (readerRef.current) {
        // Clear the previous timeout
        clearTimeout(scrollTimeout);
        
        // Set a new timeout to update the progress
        scrollTimeout = setTimeout(() => {
          const target = readerRef.current;
          if (target) {
            const newScrollPosition = target.scrollTop;
            const newProgressPercentage = (newScrollPosition / (target.scrollHeight - target.clientHeight)) * 100;
            
            setCurrentPage(Math.ceil((newProgressPercentage / 100) * totalPages));
            updateProgress(newScrollPosition, newProgressPercentage);
          }
        }, 100); // Debounce scroll updates
      }
    };

    const contentDiv = readerRef.current;
    if (contentDiv) {
      contentDiv.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (contentDiv) {
        contentDiv.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(scrollTimeout);
    };
  }, [totalPages, updateProgress]);

  // Replace the scroll event handler with this optimized version
  useEffect(() => {
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(() => {
          const target = readerRef.current;
          if (target) {
            const newScrollPosition = target.scrollTop;
            const maxScroll = target.scrollHeight - target.clientHeight;
            const newProgressPercentage = maxScroll > 0 
              ? (newScrollPosition / maxScroll) * 100 
              : 0;
            
            setCurrentPage(Math.ceil((newProgressPercentage / 100) * totalPages));
            
            // Debounce the progress update
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
              updateProgress(newScrollPosition, newProgressPercentage);
            }, 150);
          }
          isScrolling = false;
        });
      }
    };

    const contentDiv = readerRef.current;
    if (contentDiv) {
      contentDiv.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (contentDiv) {
        contentDiv.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(scrollTimeout);
    };
  }, [totalPages, updateProgress]);

  // Modify the scroll event handler to be more robust
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      if (readerRef.current) {
        clearTimeout(scrollTimeout)
        
        scrollTimeout = setTimeout(() => {
          const target = readerRef.current
          if (target) {
            const newScrollPosition = target.scrollTop
            const maxScroll = target.scrollHeight - target.clientHeight
            const newProgressPercentage = (maxScroll > 0) 
              ? (newScrollPosition / maxScroll) * 100 
              : 0
            
            setCurrentPage(Math.ceil((newProgressPercentage / 100) * totalPages))
            updateProgress(newScrollPosition, newProgressPercentage)
          }
        }, 100)
      }
    }

    const contentDiv = readerRef.current
    if (contentDiv) {
      contentDiv.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      if (contentDiv) {
        contentDiv.removeEventListener('scroll', handleScroll)
      }
      clearTimeout(scrollTimeout)
    }
  }, [totalPages, updateProgress, showSpaces])

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const target = readerRef.current;
          if (target) {
            const newScrollPosition = target.scrollTop;
            const maxScroll = target.scrollHeight - target.clientHeight;
            const newProgressPercentage = maxScroll > 0 
              ? (newScrollPosition / maxScroll) * 100 
              : 0;
            
            setCurrentPage(Math.ceil((newProgressPercentage / 100) * totalPages));
            updateProgress(newScrollPosition, newProgressPercentage);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const contentDiv = readerRef.current;
    if (contentDiv) {
      contentDiv.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (contentDiv) {
        contentDiv.removeEventListener('scroll', handleScroll);
      }
    };
  }, [totalPages, updateProgress]);

  useEffect(() => {
    const getSegments = async () => {
      if (showSpaces && book?.content) {
        try {
          const result = await fetchSegments(book.content)
          setSegments(result)
        } catch (error) {
          console.error('Error fetching segments:', error)
        }
      } else {
        setSegments([])
      }
    }

    getSegments()
  }, [showSpaces, book])

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleFullscreen()
  }

  const calculatePopoverPosition = (rect: DOMRect) => {
    if (!readerRef.current) return null

    const readerRect = readerRef.current.getBoundingClientRect()
    
    // Get position relative to the reader container
    const x = rect.left - readerRect.left + (rect.width / 2)
    const y = rect.top - readerRect.top

    return { x, y }
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setSelectedWord(null)
      setPopoverPosition(null)
      return
    }

    const selectedText = selection.toString().trim()
    if (!selectedText || !selectedText.split('').some(char => isChinese(char))) {
      setSelectedWord(null)
      setPopoverPosition(null)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const position = calculatePopoverPosition(rect)

    if (position) {
      setSelectedWord(selectedText)
      setPopoverPosition(position)
    }
  }

  const handleSegmentClick = (word: string, event: React.MouseEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const position = calculatePopoverPosition(rect)
    setSelectedWord(word)
    setPopoverPosition(position)
  }

  useEffect(() => {
    document.addEventListener('selectionchange', handleTextSelection)
    return () => {
      document.removeEventListener('selectionchange', handleTextSelection)
    }
  }, [])

  return (
    <div
      className={`relative h-full transition-all duration-300 ease-in-out ${
        isFullscreen ? 'fixed inset-0 z-50' : 'p-4'
      } ${fontFamily} ${textAlign} overflow-hidden`}
      style={{
        filter: `brightness(${brightness}%)`,
        backgroundColor: isDarkMode ? '#1a1a1a' : backgroundColor,
        color: isDarkMode ? '#e0e0e0' : 'inherit',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div
        id="book-content"
        ref={readerRef}
        className="relative h-full overflow-y-auto px-4 md:px-8 lg:px-16 pb-16"
      >
        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-gray-200' : 'text-primary'}`}>{book.title}</h2>
        <div className="prose prose-sm max-w-none">
          {content.split('\n').map((paragraph, pIndex) => {
            if (!paragraph.trim()) return null;
            
            return (
              <p 
                key={pIndex} 
                className={`mb-4 text-lg leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`} 
                style={{ fontSize: `${fontSize}px` }}
              >
                {showSpaces && segments.length > 0 ? (
                  // Render segmented text with interactive spans
                  segments.map((segment, idx) => (
                    <span
                      key={`${pIndex}-${idx}`}
                      className="segment inline-block px-0.5 rounded hover:bg-gray-200 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const position = calculatePopoverPosition(rect);
                        if (position) {
                          setSelectedWord(segment.word);
                          setPopoverPosition(position);
                        }
                      }}
                    >
                      {segment.word}
                    </span>
                  ))
                ) : (
                  paragraph
                )}
              </p>
            );
          })}
        </div>
        {selectedWord && popoverPosition && (
          <WordPopover
            word={selectedWord}
            position={popoverPosition}
            containerRef={readerRef}
            onClose={() => {
              setSelectedWord(null)
              setPopoverPosition(null)
            }}
          />
        )}
      </div>
      {isFullscreen && (
        <>
          <button
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full transition-opacity duration-300 opacity-0 hover:opacity-100"
            onClick={toggleFullscreen}
          >
            <X className="h-6 w-6" />
          </button>
          <Footer
            currentPage={currentPage}
            totalPages={totalPages}
            isDarkMode={isDarkMode}
            backgroundColor={backgroundColor}
          />
        </>
      )}
    </div>
  )
}

export default BookReader
