import { useState, useEffect, useCallback } from 'react';
import { dbManager, ReadingProgress } from '../lib/db';

export function useReadingProgress(bookId: string) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await dbManager.getReadingProgress(bookId);
        if (progress) {
          setScrollPosition(progress.scrollPosition);
          setProgressPercentage(progress.progressPercentage);
        }
      } catch (error) {
        console.error('Error loading reading progress:', error);
      }
    };

    if (typeof window !== 'undefined') {
      loadProgress();
    }
  }, [bookId]);

  const updateProgress = useCallback(async (newScrollPosition: number, newProgressPercentage: number) => {
    try {
      const progress: ReadingProgress = {
        bookId,
        scrollPosition: newScrollPosition,
        progressPercentage: newProgressPercentage,
        lastRead: new Date()
      };
      
      await dbManager.saveReadingProgress(progress);
      setScrollPosition(newScrollPosition);
      setProgressPercentage(newProgressPercentage);
    } catch (error) {
      console.error('Error saving reading progress:', error);
    }
  }, [bookId]);

  return {
    scrollPosition,
    progressPercentage,
    updateProgress
  };
}
