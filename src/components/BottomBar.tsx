import React, { useRef, useEffect } from 'react'
import { Type, Sun, BookOpen, Volume2, Palette, Plus, Minus, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookType } from '../types/book'
import { ScrollArea } from '@/components/ui/scroll-area'

interface BottomBarButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
  isDarkMode: boolean;
}

const BottomBarButton: React.FC<BottomBarButtonProps> = ({ icon, onClick, isActive, isDarkMode }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full ${isActive ? (isDarkMode ? 'bg-gray-700' : 'bg-primary/20') : ''}`}
      onClick={onClick}
    >
      {icon}
    </Button>
  )
}

interface FontSettingsProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  textAlign: string;
  setTextAlign: (align: string) => void;
  showSpaces: boolean;
  setShowSpaces: (show: boolean) => void;
  isDarkMode: boolean;
}

const FontSettings: React.FC<FontSettingsProps> = ({
  fontSize,
  setFontSize,
  textAlign,
  setTextAlign,
  showSpaces,
  setShowSpaces,
  isDarkMode
}) => {
  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg space-y-4`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-400' : 'text-primary'}`}>A</span>
        <div className="flex items-center space-x-2 flex-grow mx-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFontSize(Math.max(12, fontSize - 1))}
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-primary hover:text-primary-dark hover:bg-primary/20'} p-1`}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="relative flex-grow h-8">
            <div
              className={`absolute inset-0 ${isDarkMode ? 'bg-gray-600' : 'bg-primary/40'} rounded-full`}
              style={{ height: '0.5px', top: 'calc(50% - 0.25px)' }}
            ></div>
            <Slider
              min={12}
              max={32}
              step={1}
              value={[fontSize]}
              onValueChange={(value: number[]) => setFontSize(value[0])}
              className="absolute inset-0"
            />
            <div
              className={`absolute top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'bg-gray-200 text-gray-800' : 'bg-primary text-white'} px-2 py-0.5 rounded-full text-xs font-bold`}
              style={{ left: `calc(${(fontSize - 12) / 20 * 100}% - 10px)` }}
            >
              {fontSize}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFontSize(Math.min(32, fontSize + 1))}
            className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-primary hover:text-primary-dark hover:bg-primary/20'} p-1`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <span className={`text-lg font-bold ${isDarkMode ? 'text-gray-400' : 'text-primary'}`}>A</span>
      </div>
      <div className="flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {['text-left', 'text-center', 'text-right'].map((align) => (
            <Button
              key={align}
              variant="ghost"
              size="sm"
              onClick={() => setTextAlign(align)}
              className={`px-3 py-2 ${
                textAlign === align
                  ? isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-primary/20 text-primary'
                  : isDarkMode ? 'text-gray-400' : 'text-primary'
              }`}
            >
              {align === 'text-left' && <AlignLeft className="h-4 w-4" />}
              {align === 'text-center' && <AlignCenter className="h-4 w-4" />}
              {align === 'text-right' && <AlignRight className="h-4 w-4" />}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-primary'}`}>Asian script settings Show spaces between words</span>
        <Switch
          checked={showSpaces}
          onCheckedChange={setShowSpaces}
        />
      </div>
    </div>
  )
}

interface BrightnessContainerProps {
  brightness: number;
  setBrightness: (value: number) => void;
  isDarkMode: boolean;
}

const BrightnessContainer: React.FC<BrightnessContainerProps> = ({ brightness, setBrightness, isDarkMode }) => {
  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <Sun className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-primary'}`} />
        <Slider
          id="brightness"
          min={50}
          max={150}
          step={1}
          value={[brightness]}
          onValueChange={(value: number[]) => setBrightness(value[0])}
          className="w-48"
        />
        <Sun className={`h-6 w-6 ${isDarkMode ? 'text-gray-400' : 'text-primary'}`} />
      </div>
    </div>
  )
}

interface BookContainerProps {
  books: BookType[];
  selectBook: (book: BookType) => void;
  selectedBook: BookType | null;
  isDarkMode: boolean;
}

const BookContainer: React.FC<BookContainerProps> = ({ books, selectBook, selectedBook, isDarkMode }) => {
  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <Select onValueChange={(value: string) => selectBook(books.find((book: BookType) => book.id === value) || books[0])} defaultValue={selectedBook?.id}>
        <SelectTrigger className={`w-full ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-white text-primary'}`}>
          <SelectValue placeholder="Select a book" />
        </SelectTrigger>
        <SelectContent>
          {books.map((book: BookType) => (
            <SelectItem key={book.id} value={book.id}>{book.title}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface AudioContainerProps {
  volume: number;
  setVolume: (value: number) => void;
  isDarkMode: boolean;
}

const AudioContainer: React.FC<AudioContainerProps> = ({ volume, setVolume, isDarkMode }) => {
  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <Volume2 className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-primary'}`} />
        <Slider
          id="volume"
          min={0}
          max={100}
          step={1}
          value={[volume]}
          onValueChange={(value: number[]) => setVolume(value[0])}
          className="w-48"
        />
        <Volume2 className={`h-6 w-6 ${isDarkMode ? 'text-gray-400' : 'text-primary'}`} />
      </div>
    </div>
  )
}

interface BackgroundContainerProps {
  setBackgroundColor: (color: string) => void;
  isDarkMode: boolean;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ setBackgroundColor, isDarkMode }) => {
  const colors = ['#ffffff', '#e8f5f1', '#f1e8f5', '#f5e8f1', '#f1f5e8']
  return (
    <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-around">
        {colors.map((color) => (
          <Button
            key={color}
            className={`w-8 h-8 rounded-full border-2 ${isDarkMode ? 'border-gray-600' : 'border-primary/20'}`}
            style={{ backgroundColor: color }}
            onClick={() => setBackgroundColor(color)}
          />
        ))}
      </div>
    </div>
  )
}

interface BottomBarProps {
  activeContainer: string | null;
  setActiveContainer: (container: string | null) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  textAlign: string;
  setTextAlign: (align: string) => void;
  showSpaces: boolean;
  setShowSpaces: (show: boolean) => void;
  brightness: number;
  setBrightness: (value: number) => void;
  books: BookType[];
  selectBook: (book: BookType) => void;
  selectedBook: BookType | null;
  volume: number;
  setVolume: (value: number) => void;
  setBackgroundColor: (color: string) => void;
  isDarkMode: boolean;
}

const BottomBar: React.FC<BottomBarProps> = ({
  activeContainer,
  setActiveContainer,
  fontSize,
  setFontSize,
  textAlign,
  setTextAlign,
  showSpaces,
  setShowSpaces,
  brightness,
  setBrightness,
  books,
  selectBook,
  selectedBook,
  volume,
  setVolume,
  setBackgroundColor,
  isDarkMode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveContainer(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setActiveContainer]);

  return (
    <div ref={containerRef} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-4`}>
      <div className="flex justify-around items-center">
        <BottomBarButton
          icon={<Type className="h-6 w-6" />}
          onClick={() => setActiveContainer(activeContainer === 'font' ? null : 'font')}
          isActive={activeContainer === 'font'}
          isDarkMode={isDarkMode}
        />
        <BottomBarButton
          icon={<Sun className="h-6 w-6" />}
          onClick={() => setActiveContainer(activeContainer === 'brightness' ? null : 'brightness')}
          isActive={activeContainer === 'brightness'}
          isDarkMode={isDarkMode}
        />
        <BottomBarButton
          icon={<BookOpen className="h-6 w-6" />}
          onClick={() => setActiveContainer(activeContainer === 'book' ? null : 'book')}
          isActive={activeContainer === 'book'}
          isDarkMode={isDarkMode}
        />
        <BottomBarButton
          icon={<Volume2 className="h-6 w-6" />}
          onClick={() => setActiveContainer(activeContainer === 'audio' ? null : 'audio')}
          isActive={activeContainer === 'audio'}
          isDarkMode={isDarkMode}
        />
        <BottomBarButton
          icon={<Palette className="h-6 w-6" />}
          onClick={() => setActiveContainer(activeContainer === 'background' ? null : 'background')}
          isActive={activeContainer === 'background'}
          isDarkMode={isDarkMode}
        />
      </div>
      {activeContainer === 'font' && (
        <FontSettings
          fontSize={fontSize}
          setFontSize={setFontSize}
          textAlign={textAlign}
          setTextAlign={setTextAlign}
          showSpaces={showSpaces}
          setShowSpaces={setShowSpaces}
          isDarkMode={isDarkMode}
        />
      )}
      {activeContainer === 'brightness' && (
        <BrightnessContainer
          brightness={brightness}
          setBrightness={setBrightness}
          isDarkMode={isDarkMode}
        />
      )}
      {activeContainer === 'book' && (
        <BookContainer
          books={books}
          selectBook={selectBook}
          selectedBook={selectedBook}
          isDarkMode={isDarkMode}
        />
      )}
      {activeContainer === 'audio' && (
        <AudioContainer
          volume={volume}
          setVolume={setVolume}
          isDarkMode={isDarkMode}
        />
      )}
      {activeContainer === 'background' && (
        <BackgroundContainer
          setBackgroundColor={setBackgroundColor}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}

export default BottomBar;
