import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2 } from 'react-feather';
import WinningCardsModal from './WinningcardsModal';
// Adjust the import path as necessary
import bingoCardsData from '../data/bingoCards.json'; // Ensure this path is correct

const NUMBER_RANGE = Array.from({ length: 75 }, (_, i) => i + 1);
const CATEGORIES = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};

const getCategory = (num) => {
  for (const [key, [min, max]] of Object.entries(CATEGORIES)) {
    if (num >= min && num <= max) return key;
  }
  return '';
};

// Enhanced category colors with gradients and glows for a more beautiful grid
const categoryColors = {
  B: 'bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 text-blue-50 border-blue-400 shadow-blue-300/30',
  I: 'bg-gradient-to-br from-pink-400 via-pink-600 to-pink-800 text-pink-50 border-pink-400 shadow-pink-300/30',
  N: 'bg-gradient-to-br from-purple-500 via-purple-700 to-purple-900 text-purple-50 border-purple-400 shadow-purple-300/30',
  G: 'bg-gradient-to-br from-green-500 via-green-700 to-green-900 text-green-50 border-green-400 shadow-green-300/30',
  O: 'bg-gradient-to-br from-amber-400 via-orange-600 to-orange-900 text-amber-50 border-amber-400 shadow-orange-300/30',
};

// Converts a number (1-75) to Amharic words
const amharicNumbers = [
  '', 'አንድ', 'ሁለት', 'ሶስት', 'አራት', 'አምስት', 'ስድስት', 'ሰባት', 'ስምንት', 'ዘጠኝ', 'አስር',
  'አስራ አንድ', 'አስራ ሁለት', 'አስራ ሶስት', 'አስራ አራት', 'አስራ አምስት', 'አስራ ስድስት', 'አስራ ሰባት', 'አስራ ስምንት', 'አስራ ዘጠኝ',
  'ሃያ', 'ሃያ አንድ', 'ሃያ ሁለት', 'ሃያ ሶስት', 'ሃያ አራት', 'ሃያ አምስት', 'ሃያ ስድስት', 'ሃያ ሰባት', 'ሃያ ስምንት', 'ሃያ ዘጠኝ',
  'ሰላሳ', 'ሰላሳ አንድ', 'ሰላሳ ሁለት', 'ሰላሳ ሶስት', 'ሰላሳ አራት', 'ሰላሳ አምስት', 'ሰላሳ ስድስት', 'ሰላሳ ሰባት', 'ሰላሳ ስምንት', 'ሰላሳ ዘጠኝ',
  'አርባ', 'አርባ አንድ', 'አርባ ሁለት', 'አርባ ሶስት', 'አርባ አራት', 'አርባ አምስት', 'አርባ ስድስት', 'አርባ ሰባት', 'አርባ ስምንት', 'አርባ ዘጠኝ',
  'ሃምሳ', 'ሃምሳ አንድ', 'ሃምሳ ሁለት', 'ሃምሳ ሶስት', 'ሃምሳ አራት', 'ሃምሳ አምስት', 'ሃምሳ ስድስት', 'ሃምሳ ሰባት', 'ሃምሳ ስምንት', 'ሃምሳ ዘጠኝ',
  'ስልሳ', 'ስልሳ አንድ', 'ስልሳ ሁለት', 'ስልሳ ሶስት', 'ስልሳ አራት', 'ስልሳ አምስት', 'ስልሳ ስድስት', 'ስልሳ ሰባት', 'ስልሳ ስምንት', 'ስልሳ ዘጠኝ',
  'ሰባ', 'ሰባ አንድ', 'ሰባ ሁለት', 'ሰባ ሶስት', 'ሰባ አራት', 'ሰባ አምስት'
];

function getAmharicNumber(num) {
  return amharicNumbers[num] || num.toString();
}

export default function DashboardScreen({
  roundId,
  shopId,
  prize,
  selectedCards,
  interval,
  language, // This prop now controls voice language
  betPerCard,
  commissionRate,
  winningPattern,
  setCurrentView,
}) {
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [winningCards, setWinningCards] = useState([]);
   const [failedCards, setFailedCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualCardId, setManualCardId] = useState('');
  const [mode, setMode] = useState('manual');
  const [status, setStatus] = useState("won");
const [lastWinCheckNumberCount, setLastWinCheckNumberCount] = useState(0);
const [passedCards, setPassedCards] = useState([]);
const [lockedCards, setLockedCards] = useState([]);
const intervalRef = useRef(null); 
const [winningPatterns, setWinningPatterns] = useState({});
const [restartedCards, setRestartedCards] = useState([]);

  // State and ref for speech synthesis
  const speechUtteranceRef = useRef(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const audioRef = useRef(null);
  const audioCache = useRef(new Map());

useEffect(() => {
  const ranges = {
    b: [1, 15],
    i: [16, 30],
    n: [31, 45],
    g: [46, 60],
    o: [61, 75],
  };

  for (const [cat, [start, end]] of Object.entries(ranges)) {
    for (let i = start; i <= end; i++) {
      const path = `/voicemale/${cat}_${i}.m4a`;
      const audio = new Audio(path);
      audioCache.current.set(path, audio);
    }
  }

  console.log("✅ Correct audio files preloaded by column range");
}, []);


  
  const playSoundForCall = (category, number) => {
  const audioPath = `/voicemale/${category.toLowerCase()}_${number}.m4a`;

  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }

  const cachedAudio = audioCache.current.get(audioPath);
  if (cachedAudio) {
    audioRef.current = cachedAudio;
  } else {
    const fallback = new Audio(audioPath);
    audioCache.current.set(audioPath, fallback);
    audioRef.current = fallback;
  }

  // Web Audio API setup for volume boost
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 3.0; // 200% louder (1.0 = normal, 3.0 = 200% boost)

  const source = audioContext.createMediaElementSource(audioRef.current);
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);

  audioRef.current.currentTime = 0;
  audioRef.current.play().catch((err) => {
    console.warn("🎧 Audio play error:", err);
  });
};
  // --- Speech Synthesis Setup ---
  useEffect(() => {
    // Initialize SpeechSynthesisUtterance only once
    if (!speechUtteranceRef.current) {
      speechUtteranceRef.current = new SpeechSynthesisUtterance();
      speechUtteranceRef.current.volume = 1;
      speechUtteranceRef.current.rate = 1;
      speechUtteranceRef.current.pitch = 1;
    }

    const populateVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    // Populate voices immediately if available
    populateVoices();

    // Listen for voices changed event (voices might load asynchronously or after user interaction)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }

    return () => {
      // Clean up the listener when the component unmounts
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []); // Runs once on mount

  // Effect to speak the current number when it changes
  useEffect(() => {
  if (currentCall !== null) {
    const category = getCategory(currentCall);

    if (language === 'Amharic') {
      playSoundForCall(category, currentCall);
    } else if (speechUtteranceRef.current && availableVoices.length > 0) {
      window.speechSynthesis.cancel();

      const textToSpeak = `${category}. ${currentCall}.`;
      speechUtteranceRef.current.text = textToSpeak;

      const voiceLangPrefix = language === 'ti' ? 'ti' : 'en';
      const selectedVoice = availableVoices.find(
        (voice) =>
          voice.lang.startsWith(voiceLangPrefix) &&
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default)
      );

      if (selectedVoice) {
        speechUtteranceRef.current.voice = selectedVoice;
        speechUtteranceRef.current.lang = selectedVoice.lang;
      } else {
        speechUtteranceRef.current.lang = 'en-US';
      }

      try {
        window.speechSynthesis.speak(speechUtteranceRef.current);
      } catch (e) {
        console.error('Speech synthesis failed:', e);
      }
    }
  }
}, [currentCall, language, availableVoices]);
// Dependencies for this effect


  // Helper function to convert card object to a 5x5 grid array (handling null for free space)
  const getCardGrid = (card) => {
    const grid = [];
    const columns = ['B', 'I', 'N', 'G', 'O'];
    for (let i = 0; i < 5; i++) {
      grid.push([]);
      for (let j = 0; j < 5; j++) {
        grid[i].push(card[columns[j]][i]);
      };
    }
    return grid;
  };

  // Helper to check if a number on a card is considered "marked" (called or free space)
  const isMarked = (num, calledNumbersSet) => {
    return num === null || calledNumbersSet.has(num);
  };

  // Check for lines (rows, columns, diagonals) completed on a card
  const checkLinesOnCard = (grid, calledNumbersSet) => {
    let linesWon = 0;

    // Check Rows
    for (let i = 0; i < 5; i++) {
      if (grid[i].every(num => isMarked(num, calledNumbersSet))) {
        linesWon++;
      }
    }

    // Check Columns
    for (let j = 0; j < 5; j++) {
      let colComplete = true;
      for (let i = 0; i < 5; i++) {
        if (!isMarked(grid[i][j], calledNumbersSet)) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) {
        linesWon++;
      }
    }

    // Check Diagonals
    let diag1Complete = true; // Top-left to bottom-right
    for (let i = 0; i < 5; i++) {
      if (!isMarked(grid[i][i], calledNumbersSet)) {
        diag1Complete = false;
        break;
      }
    }
    if (diag1Complete) {
      linesWon++;
    }

    let diag2Complete = true; // Top-right to bottom-left
    for (let i = 0; i < 5; i++) {
      if (!isMarked(grid[i][4 - i], calledNumbersSet)) {
        diag2Complete = false;
        break;
      }
    }
    if (diag2Complete) {
      linesWon++;
    }

    return linesWon;
  };

  // Check for Full House win
  const checkFullHouseWin = (grid, calledNumbersSet) => {
    return grid.flat().every(num => isMarked(num, calledNumbersSet));
  };
// Check for Four Corners win
const checkFourCornersWin = (grid, calledNumbersSet) => {
  const corners = [
    grid[0][0], // top-left
    grid[0][4], // top-right
    grid[4][0], // bottom-left
    grid[4][4]  // bottom-right
  ];

  return corners.every(num => isMarked(num, calledNumbersSet));
};
//check for Cross Pattern win
const checkCrossPatternWin = (grid, calledNumbersSet) => {
  const middle = 2; // center index for 5x5 grid

  // Get middle row and column values (center cell is shared, avoid duplicate)
  const crossNumbers = new Set();

  // Add middle row
  for (let col = 0; col < 5; col++) {
    crossNumbers.add(grid[middle][col]);
  }

  // Add middle column
  for (let row = 0; row < 5; row++) {
    if (row !== middle) {
      crossNumbers.add(grid[row][middle]);
    }
  }

  // Check if all cross numbers are marked
  return [...crossNumbers].every(num => isMarked(num, calledNumbersSet));
};
// check inner corner
const checkInnerCornersAndCenterWin = (grid, calledNumbersSet) => {
  const positions = [
    grid[1][1], // top-left inner
    grid[1][3], // top-right inner
    grid[3][1], // bottom-left inner
    grid[3][3], // bottom-right inner
    grid[2][2], // center (usually FREE)
  ];

  return positions.every(num => isMarked(num, calledNumbersSet));
};
const getWinningLineCoords = (grid, calledNumbersSet) => {
  const coords = [];

  // Rows
  for (let i = 0; i < 5; i++) {
    if (grid[i].every(num => isMarked(num, calledNumbersSet))) {
      for (let j = 0; j < 5; j++) coords.push([i, j]);
    }
  }

  // Columns
  for (let j = 0; j < 5; j++) {
    let colComplete = true;
    for (let i = 0; i < 5; i++) {
      if (!isMarked(grid[i][j], calledNumbersSet)) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) {
      for (let i = 0; i < 5; i++) coords.push([i, j]);
    }
  }

  // Diagonals
  let diag1 = true;
  for (let i = 0; i < 5; i++) {
    if (!isMarked(grid[i][i], calledNumbersSet)) {
      diag1 = false;
      break;
    }
  }
  if (diag1) {
    for (let i = 0; i < 5; i++) coords.push([i, i]);
  }

  let diag2 = true;
  for (let i = 0; i < 5; i++) {
    if (!isMarked(grid[i][4 - i], calledNumbersSet)) {
      diag2 = false;
      break;
    }
  }
  if (diag2) {
    for (let i = 0; i < 5; i++) coords.push([i, 4 - i]);
  }

  return coords;
};

const getFullHouseCoords = () => {
  const coords = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      coords.push([i, j]);
    }
  }
  return coords;
};

const getFourCornersCoords = () => [
  [0, 0],
  [0, 4],
  [4, 0],
  [4, 4],
];

const getCrossCoords = () => {
  const coords = [];
  const middle = 2;
  for (let i = 0; i < 5; i++) coords.push([middle, i]); // middle row
  for (let i = 0; i < 5; i++) {
    if (i !== middle) coords.push([i, middle]); // middle column (excluding center)
  }
  return coords;
};
const getInnerCornersAndCenterCoords = () => [
  [1, 1],
  [1, 3],
  [3, 1],
  [3, 3],
  [2, 2],
];

const gameOverRef = useRef(false);
 // Main win checking function
const checkWin = async () => {
  if (mode === 'manual') return;
  if (!calledNumbers.length) return;
  if (winningCards.length > 0) return;

  const currentCalledNumbersSet = new Set(calledNumbers);
  const cardsToCheck = bingoCardsData.filter(card =>
    selectedCards.includes(card.card_id)
  );

  const newWinners = [];

  for (const card of cardsToCheck) {
    const cardGrid = getCardGrid(card);
    let isWinner = false;

    switch (winningPattern) {
      case '1 Line':
        isWinner = checkLinesOnCard(cardGrid, currentCalledNumbersSet) >= 1;
        break;
      case '2 Lines':
        isWinner = checkLinesOnCard(cardGrid, currentCalledNumbersSet) >= 2;
        break;
      case 'Full House':
        isWinner = checkFullHouseWin(cardGrid, currentCalledNumbersSet);
        break;
      case 'Four Corners':
        isWinner = checkFourCornersWin(cardGrid, currentCalledNumbersSet);
        break;
      case 'Cross':
        isWinner = checkCrossPatternWin(cardGrid, currentCalledNumbersSet);
        break;
      case 'Inner Corners + Center':
  isWinner = checkInnerCornersAndCenterWin(cardGrid, currentCalledNumbersSet);
  break;

      case 'All':
        isWinner =
          checkLinesOnCard(cardGrid, currentCalledNumbersSet) >= 1 ||
          checkLinesOnCard(cardGrid, currentCalledNumbersSet) >= 2 ||
          checkFullHouseWin(cardGrid, currentCalledNumbersSet) ||
          checkFourCornersWin(cardGrid, currentCalledNumbersSet) ||
          checkCrossPatternWin(cardGrid, currentCalledNumbersSet) 
          //checkInnerCornersAndCenterWin(cardGrid, currentCalledNumbersSet)
          ;
        break;
      default:
        console.warn(`Unknown winning pattern: ${winningPattern}`);
    }

    if (isWinner && !winningCards.includes(card.card_id)) {
      newWinners.push(card.card_id);
      setWinningCards(prev => [...prev, card.card_id]);
    }
  }

  if (newWinners.length > 0) {
    console.log(`Winners found: ${newWinners.join(', ')}`);
    gameOverRef.current = true; // Mark game as over
    setIsRunning(false);
    // Stop number calling
    // Clear interval immediately
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    try {
      // Submit each winning card individually
      for (const cardId of newWinners) {
        await submitWinning({
          cardId,
          roundId,
          shopId,
          prize,
        });
      }

      
      setWinningCards(newWinners);
      setIsModalOpen(true);
      window.speechSynthesis.cancel(); // Stop speech

     
    } catch (error) {
      console.error('Error submitting winning cards:', error);
      alert('Failed to submit winners. Please try again.');
    }
  }
};

//manual check function
const handleManualCheck = async () => {
  if (!manualCardId) {
    alert("Please enter a Card ID.");
    return;
  }

  if (!calledNumbers.length) {
    alert("No called numbers yet. Cannot check.");
    return;
  }

  const normalizedManualId = Number(manualCardId.trim());

  if (lockedCards.includes(normalizedManualId)) {
    alert(`Card ${normalizedManualId} has already passed. It cannot win anymore.`);
    return;
  }

  const selectedCardsData = bingoCardsData.filter(card =>
    selectedCards.includes(card.card_id)
  );
  const card = selectedCardsData.find(c => c.card_id === normalizedManualId);

  if (!card) {
    alert("Card ID not found in selected cards.");
    return;
  }

  const currentCalledNumbersSet = new Set(calledNumbers);
  const cardGrid = getCardGrid(card);
  let isWinner = false;
  let winningCoords = [];

  switch (winningPattern) {
    case '1 Line': {
      const coords = getWinningLineCoords(cardGrid, currentCalledNumbersSet);
      if (coords.length >= 5) {
        isWinner = true;
        winningCoords = coords;
      }
      break;
    }
    case '2 Lines': {
      const coords = getWinningLineCoords(cardGrid, currentCalledNumbersSet);
      if (coords.length >= 10) {
        isWinner = true;
        winningCoords = coords;
      }
      break;
    }
    case 'Full House': {
      if (checkFullHouseWin(cardGrid, currentCalledNumbersSet)) {
        isWinner = true;
        winningCoords = getFullHouseCoords();
      }
      break;
    }
    case 'Four Corners': {
      if (checkFourCornersWin(cardGrid, currentCalledNumbersSet)) {
        isWinner = true;
        winningCoords = getFourCornersCoords();
      }
      break;
    }
    case 'Cross': {
      if (checkCrossPatternWin(cardGrid, currentCalledNumbersSet)) {
        isWinner = true;
        winningCoords = getCrossCoords();
      }
      break;
    }
    case 'Inner Corners + Center': {
      if (checkInnerCornersAndCenterWin(cardGrid, currentCalledNumbersSet)) {
        isWinner = true;
        winningCoords = getInnerCornersAndCenterCoords();
      }
      break;
    }
    case 'All': {
      const allCoords = [];

      const lineCoords = getWinningLineCoords(cardGrid, currentCalledNumbersSet);
      if (lineCoords.length >= 5) {
        allCoords.push(...lineCoords);
        isWinner = true;
      }

      if (checkFullHouseWin(cardGrid, currentCalledNumbersSet)) {
        allCoords.push(...getFullHouseCoords());
        isWinner = true;
      }

      if (checkFourCornersWin(cardGrid, currentCalledNumbersSet)) {
        allCoords.push(...getFourCornersCoords());
        isWinner = true;
      }

      if (checkCrossPatternWin(cardGrid, currentCalledNumbersSet)) {
        allCoords.push(...getCrossCoords());
        isWinner = true;
      }

      // Uncomment this if you want to include it in "All"
      // if (checkInnerCornersAndCenterWin(cardGrid, currentCalledNumbersSet)) {
      //   allCoords.push(...getInnerCornersAndCenterCoords());
      //   isWinner = true;
      // }

      winningCoords = allCoords;
      break;
    }

    default:
      console.warn(`Unknown winning pattern: ${winningPattern}`);
      break;
  }

  if (isWinner) {
    console.log(`Manual winner found: Card ID ${manualCardId}`);
    try {
     
      setStatus("won");
      setIsRunning(false);
      setWinningCards([normalizedManualId]);
      setWinningPatterns({ [normalizedManualId]: winningCoords }); // 🎯 Save winning pattern coords
      setIsModalOpen(true);
      window.speechSynthesis.cancel();
    } catch (error) {
      console.error('Error submitting manual winning:', error);
      alert('Failed to submit manual winning.');
    }
  } else {
    setStatus("failed");
    setFailedCards([normalizedManualId]);
    setIsModalOpen(true);
  }
};


const checkWinA = () => {
 
  //console.log("Checking for wins with winning pattern:", winningPattern);
  const currentCalledNumbersSet = new Set(calledNumbers);
  const cardsToCheck = bingoCardsData.filter(card =>
    selectedCards.includes(card.card_id)
  );
  const wincardid = null;
  let isWinner = false;
  for (const card of cardsToCheck) {

    const cardGrid = getCardGrid(card);
    

    switch (winningPattern) {
      case '1 Line':
        if (checkLinesOnCard(cardGrid, currentCalledNumbersSet) >= 1) isWinner = true;
        //console.log(`Checking card ${card.card_id} for 1 Line win: ${isWinner}`);
        break;
      case '2 Lines':
        if (checkLinesOnCard(cardGrid, currentCalledNumbersSet) >= 2) isWinner = true;
        break;
      case 'Full House':
        if (checkFullHouseWin(cardGrid, currentCalledNumbersSet)) isWinner = true;
        break;
      case 'Four Corners':
        if (checkFourCornersWin(cardGrid, currentCalledNumbersSet)) isWinner = true;
        break;
      case 'Cross':
        isWinner = checkCrossPatternWin(cardGrid, currentCalledNumbersSet);
        break;
      case 'Inner Corners + Center':
  isWinner = checkInnerCornersAndCenterWin(cardGrid, currentCalledNumbersSet);
  break;
      case 'All':
        if (
          checkLinesOnCard(cardGrid, currentCalledNumbersSet) >= 2 &&
          checkFullHouseWin(cardGrid, currentCalledNumbersSet) &&
          checkFourCornersWin(cardGrid, currentCalledNumbersSet) &&
          checkCrossPatternWin(cardGrid, currentCalledNumbersSet) &&
          checkInnerCornersAndCenterWin(cardGrid, currentCalledNumbersSet)
        ) isWinner = true;
        //console.log(`Checking card ${card.card_id} for 1 Line win: ${isWinner}`);
        break;

      
    }
  // Check if this card has already won
if (isWinner) {
   console.log(`Winner found: Card ID ${card.card_id}`);
  if (passedCards.includes(card.card_id)) {
  // Second time it's winning — lock it
    console.log(`🔒 Card ${wincardid} locked (won again after being passed)`);
    setLockedCards(prev => [...prev, card.card_id]);
    break
  } else {
    // First time it's winning — pass it
    console.log(`⚠️ Card ${wincardid} passed (won too late)`);
    setPassedCards(prev => [...prev, card.card_id]);
    break;
  }
  }
  
}
};
// Update callNextNumber to check gameOverRef
const callNextNumber = () => {
  if (gameOverRef.current || winningCards.length > 0) {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return;
  }

  const remaining = NUMBER_RANGE.filter(n => !calledNumbers.includes(n));
  if (remaining.length === 0) {
    gameOverRef.current = true;
    setIsRunning(false);
    return;
  }

  const next = remaining[Math.floor(Math.random() * remaining.length)];
  const updatedCalledNumbers = [next, ...calledNumbers];
  setCalledNumbers(updatedCalledNumbers);
  setCurrentCall(next);

  // 🛑 Only check for winners if mode is not manual
  if (mode !== 'manual') {
    const currentCalledNumbersSet = new Set(updatedCalledNumbers);
    const cardsToCheck = bingoCardsData.filter(card =>
      selectedCards.includes(card.card_id)
    );

    let winners = [];
    for (const card of cardsToCheck) {
      const grid = getCardGrid(card);
      let isWinner = false;

      switch (winningPattern) {
        case '1 Line':
          isWinner = checkLinesOnCard(grid, currentCalledNumbersSet) >= 1;
          break;
        case '2 Lines':
          isWinner = checkLinesOnCard(grid, currentCalledNumbersSet) >= 2;
          break;
        case 'Full House':
          isWinner = checkFullHouseWin(grid, currentCalledNumbersSet);
          break;
        case 'Four Corners':
          isWinner = checkFourCornersWin(grid, currentCalledNumbersSet);
          break;
        case 'Cross':
          isWinner = checkCrossPatternWin(grid, currentCalledNumbersSet);
          break;
        case 'Inner Corners + Center':
          isWinner = checkInnerCornersAndCenterWin(grid, currentCalledNumbersSet);
          break;
        case 'All':
          isWinner =
            checkLinesOnCard(grid, currentCalledNumbersSet) >= 1 ||
            checkLinesOnCard(grid, currentCalledNumbersSet) >= 2 ||
            checkFullHouseWin(grid, currentCalledNumbersSet) ||
            checkFourCornersWin(grid, currentCalledNumbersSet) ||
            checkCrossPatternWin(grid, currentCalledNumbersSet);
          break;
      }

      if (isWinner && !winningCards.includes(card.card_id)) {
        winners.push(card.card_id);
      }
    }

    if (winners.length > 0) {
      gameOverRef.current = true;
      setWinningCards(winners);
      setIsRunning(false);
      window.speechSynthesis.cancel();
      setTimeout(() => {
        setIsModalOpen(true);
      }, 1000);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      winners.forEach(async (cardId) => {
        try {
          await submitWinning({ cardId, roundId, shopId, prize });
        } catch (e) {
          console.error("Failed to submit winner:", cardId, e);
        }
      });
    }
  }
};


  

  useEffect(() => {
  // Clear any existing interval
  // Clear any existing interval
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }
  console.log("Setting up interval with isRunning:", isRunning, "and winningCards:", winningCards.length);
  // Set new interval only if running and no winners
  if (isRunning && !gameOverRef.current) {
    intervalRef.current = setInterval(() => callNextNumber(), interval);
  }

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, [isRunning, calledNumbers, interval, winningCards]);

const togglePlayPause = () => {
    // Dummy speech activation (if needed)
    if (!isRunning && currentCall === null && speechUtteranceRef.current) {
        const dummyUtterance = new SpeechSynthesisUtterance(' ');
        window.speechSynthesis.speak(dummyUtterance);
    }

    // Play sound with Web Audio API for volume boost
    const audio = new Audio(!isRunning ? "/game/start_game.m4a" : "/game/pause_game.m4a");
    
    // Create AudioContext and GainNode
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 3.0; // 200% louder (1.0 = normal, 3.0 = 300% volume)

    // Connect audio to gain node and output
    const source = audioContext.createMediaElementSource(audio);
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    audio.play().catch((err) => {
        console.warn("Audio play blocked by browser:", err);
    });
  
    setIsRunning((prev) => !prev);
};

  const restartGame = () => {
    setIsRunning(false);
    setCalledNumbers([]);
    setCurrentCall(null);
    setWinningCards([]);
    setIsModalOpen(false);
     // 🔥 Pass selectedCards via props to CardManagementScreen
  setCurrentView({
    name: 'card_management',
    props: {
      selectedCards,
    },
  });
    
    window.speechSynthesis.cancel(); // Stop any speech on restart
  };

  const requestFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-100 p-6 text-slate-800 font-sans overflow-hidden">
  {/* Header */}
  <div className="flex justify-between items-center mb-6 border-b border-slate-300 pb-4">
    <h1 className="text-3xl font-bold text-slate-900 tracking-wide">Gojo Bingo</h1>
    <div className="flex items-center space-x-6">
      <div className="text-slate-700 font-medium text-lg flex items-center">
        <span className="mr-2 text-slate-500">Calls:</span> {calledNumbers.length}/75
      </div>
      <div className="text-green-600 font-semibold text-lg flex items-center">
        <span className="mr-2 text-slate-500">Prize:</span> {prize.toFixed(2)} ETB
      </div>
      {winningCards.length > 0 && (
        <div className="text-red-600 font-semibold text-lg flex items-center">
          <span className="mr-2 text-slate-500">Winners:</span> {winningCards.length}
        </div>
      )}
    </div>
  </div>

  {/* Content Area */}
  <div className="flex space-x-6 h-[calc(100vh-144px)]">
    {/* Left Panel */}
    <div className="w-80 bg-white rounded-xl p-6 flex flex-col justify-between shadow-md border border-slate-200">
      

      <div>
        <div className="text-base mb-3 text-slate-600 font-medium">Last 5 Called Numbers</div>
        <div className="grid grid-cols-5 gap-3">
          {[...calledNumbers.slice(0, 5)].map((n, i) => (
            <div
              key={i}
              className="text-center p-3 bg-slate-100 rounded-lg text-lg font-semibold border border-slate-300"
            >
              {n ? n.toString().padStart(2, '0') : '--'}
            </div>
          ))}
        </div>
      </div>

      {/* Auto/Manual + Input */}
<div className="mt-6 mb-2 p-4 border border-slate-200 rounded-md bg-slate-50 w-full">
  <div className="mb-4 flex items-center gap-6 text-slate-700 font-medium">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        checked={mode === 'auto'}
        onChange={() => setMode('auto')}
        className="form-radio text-slate-600"
      />
      Auto
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        checked={mode === 'manual'}
        onChange={() => setMode('manual')}
        className="form-radio text-slate-600"
      />
      Manual
    </label>
  </div>

  {mode === 'manual' && (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <input
        type="text"
        placeholder="Enter Card ID"
        value={manualCardId}
        onChange={(e) => setManualCardId(e.target.value)}
        className="flex-grow w-full bg-white border border-slate-300 text-slate-800 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 min-w-0"
      />
      <button
        onClick={handleManualCheck}
        className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded transition"
      >
        Check
      </button>
    </div>
  )}
</div>


      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button
          onClick={togglePlayPause}
          className={`flex items-center justify-center px-4 py-3 rounded-xl font-semibold shadow transition transform hover:scale-105 ${
            isRunning
              ? 'bg-red-600 text-white'
              : 'bg-slate-800 text-white'
          }`}
        >
          {isRunning ? <Pause size={20} className="mr-2" /> : <Play size={20} className="mr-2" />}
          {isRunning ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={restartGame}
          className="flex items-center justify-center bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold shadow hover:bg-slate-600"
        >
          <RotateCcw size={20} className="mr-2" />
          Restart
        </button>

        <button
          onClick={requestFullScreen}
          className="col-span-2 flex items-center justify-center bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold shadow hover:bg-slate-600"
        >
          <Maximize2 size={20} className="mr-2" />
          Fullscreen
        </button>
      </div>
    </div>

    {/* Number Grid */}
    <div className="flex-1 p-6 rounded-xl bg-white shadow-md border border-slate-200 overflow-y-auto">
      <div className="grid grid-cols-16 gap-2 text-center font-semibold text-slate-800 text-base">
        {Object.entries(CATEGORIES).map(([letter, [min, max]]) => (
          <React.Fragment key={letter}>
            <div className="col-span-1 flex items-center justify-center text-xl font-bold uppercase bg-slate-100 border border-slate-300 rounded shadow">
              {letter}
            </div>
            {Array.from({ length: 15 }).map((_, colIndex) => {
              const num = min + colIndex;
              const isCurrent = num === currentCall;
              const isCalled = calledNumbers.includes(num);

              return (
                <div
                  key={num}
                  className={`
                    col-span-1 py-2 rounded-lg text-xl font-bold flex items-center justify-center cursor-pointer transition-all
                    ${isCurrent
                      ? 'bg-yellow-300 text-slate-900 ring-2 ring-yellow-500'
                      : isCalled
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-800 border border-slate-300'}
                  `}
                  style={{ height: '48px' }}
                >
                  {num.toString().padStart(2, '0')}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="justify-self-center mt-16">
        <div className="bg-slate-100 text-slate-800 rounded-full p-16 w-80 text-center text-6xl font-extrabold tracking-widest shadow-inner border border-slate-300">
          {currentCall
            ? `${getCategory(currentCall)}${currentCall.toString().padStart(2, '0')}`
            : '--'}
        </div>
      </div>
    </div>

    
  </div>

  {/* Modal */}
  <WinningCardsModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    winningCardIds={winningCards}
    failedCards={failedCards}
    allBingoCards={bingoCardsData}
    calledNumbersSet={new Set(calledNumbers)}
    status={status}
    winningPatterns={winningPatterns}
  />
</div>

  );
}