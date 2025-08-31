import { useState } from 'react';
import { useGameStore } from '../state/game';

export function Board() {
  const { board, stagedPlacements, addStagedPlacement } = useGameStore();
  const [selectedLetter, setSelectedLetter] = useState('A');

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col]) return; // Cell already occupied
    
    addStagedPlacement({ row, col, letter: selectedLetter });
  };

  const getCellContent = (row: number, col: number) => {
    const boardTile = board[row][col];
    if (boardTile) return boardTile;
    
    const stagedTile = stagedPlacements.find(p => p.row === row && p.col === col);
    return stagedTile?.letter || '';
  };

  const getCellClass = (row: number, col: number) => {
    const baseClass = 'w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-bold cursor-pointer';
    
    if (board[row][col]) {
      return `${baseClass} bg-yellow-200 text-black cursor-not-allowed`;
    }
    
    const isStaged = stagedPlacements.some(p => p.row === row && p.col === col);
    if (isStaged) {
      return `${baseClass} bg-blue-200 text-blue-800 hover:bg-blue-300`;
    }
    
    return `${baseClass} bg-white hover:bg-gray-100`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label htmlFor="letter-select" className="text-sm font-medium">
          Letter to place:
        </label>
        <select
          id="letter-select"
          value={selectedLetter}
          onChange={(e) => setSelectedLetter(e.target.value)}
          className="px-2 py-1 border border-gray-300 rounded"
        >
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
            <option key={letter} value={letter}>{letter}</option>
          ))}
        </select>
      </div>
      
      <div className="inline-block border-2 border-gray-600 bg-gray-100 p-2">
        <div className="grid grid-cols-15 gap-0">
          {Array.from({ length: 15 }, (_, row) =>
            Array.from({ length: 15 }, (_, col) => (
              <div
                key={`${row}-${col}`}
                className={getCellClass(row, col)}
                onClick={() => handleCellClick(row, col)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCellClick(row, col);
                  }
                }}
              >
                {getCellContent(row, col)}
              </div>
            ))
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600">
        Click empty cells to stage tile placements. Blue tiles are staged, yellow tiles are placed.
      </p>
    </div>
  );
}
