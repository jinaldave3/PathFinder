import React, { useState, useEffect, useRef } from 'react';
import './Node.css';
import { bfs, dfs, dijkstra, aStar } from './algorithms';

/**
 * ALGORITHMS array to populate the dropdown.
 */
const ALGORITHMS = [
  { label: 'BFS', value: 'bfs' },
  { label: 'DFS', value: 'dfs' },
  { label: 'Dijkstra', value: 'dijkstra' },
  { label: 'A*', value: 'astar' },
];

export default function PathfindingVisualizer() {
  // Grid size
  const [numRows, setNumRows] = useState(20);
  const [numCols, setNumCols] = useState(40);

  // Positions for start (green) and end (red)
  const [startPos, setStartPos] = useState({ row: 5, col: 5 });
  const [endPos, setEndPos] = useState({ row: 15, col: 30 });

  const [grid, setGrid] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(5); // 1 is fastest, 10 is slowest

  // Track drag states for start/end nodes
  const isDraggingStart = useRef(false);
  const isDraggingEnd = useRef(false);

  /**
   * Helper to compute the minimum number of rows based on start/end positions.
   * E.g. if endPos.row = 15, then at least 16 rows are required (indexes 0..15).
   */
  function getMinRows() {
    return Math.max(startPos.row, endPos.row) + 1;
  }

  /**
   * Helper to compute the minimum number of columns based on start/end positions.
   * E.g. if endPos.col = 30, then at least 31 columns are required (indexes 0..30).
   */
  function getMinCols() {
    return Math.max(startPos.col, endPos.col) + 1;
  }

  /**
   * Whenever the grid size changes, rebuild the grid.
   */
  useEffect(() => {
    resetGrid();
    // eslint-disable-next-line
  }, [numRows, numCols, startPos, endPos]);

  function resetGrid() {
    const newGrid = [];
    for (let row = 0; row < numRows; row++) {
      const currentRow = [];
      for (let col = 0; col < numCols; col++) {
        currentRow.push(createNode(row, col));
      }
      newGrid.push(currentRow);
    }
    setGrid(newGrid);
  }

  function createNode(row, col) {
    return {
      row,
      col,
      isStart: row === startPos.row && col === startPos.col,
      isEnd: row === endPos.row && col === endPos.col,
      isWall: false,
      isVisited: false,
      distance: Infinity,
      gCost: Infinity,
      hCost: Infinity,
      fCost: Infinity,
      previousNode: null,
    };
  }

  /**
   * Prevent the user from entering a row count below the minimum needed to keep nodes in-bounds.
   */
  function handleRowsChange(value) {
    if (isRunning) return;
    const newRows = parseInt(value, 10);
    // clamp
    const minR = getMinRows(); // e.g. 16 if endPos.row=15
    if (newRows < minR) {
      setNumRows(minR);
    } else {
      setNumRows(newRows);
    }
  }

  /**
   * Prevent the user from entering a col count below the minimum needed to keep nodes in-bounds.
   */
  function handleColsChange(value) {
    if (isRunning) return;
    const newCols = parseInt(value, 10);
    // clamp
    const minC = getMinCols(); // e.g. 31 if endPos.col=30
    if (newCols < minC) {
      setNumCols(minC);
    } else {
      setNumCols(newCols);
    }
  }

  // Clear path states (visited, path)
  function clearPath() {
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const nodeDiv = document.getElementById(`node-${row}-${col}`);
        if (nodeDiv) {
          nodeDiv.classList.remove('node-visited');
          nodeDiv.classList.remove('node-path');
        }
      }
    }
    const newGrid = grid.slice();
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const node = newGrid[row][col];
        node.isVisited = false;
        node.distance = Infinity;
        node.gCost = Infinity;
        node.hCost = Infinity;
        node.fCost = Infinity;
        node.previousNode = null;
      }
    }
    setGrid(newGrid);
  }

  // Visualize selected algorithm
  function visualize() {
    setIsRunning(true);
    clearPath();

    const startNode = grid[startPos.row][startPos.col];
    const endNode = grid[endPos.row][endPos.col];
    let visitedNodesInOrder = [];
    let path = [];

    // Run the selected algorithm
    switch (selectedAlgorithm) {
      case 'dfs':
        ({ visitedNodesInOrder, path } = dfs(grid, startNode, endNode));
        break;
      case 'dijkstra':
        ({ visitedNodesInOrder, path } = dijkstra(grid, startNode, endNode));
        break;
      case 'astar':
        ({ visitedNodesInOrder, path } = aStar(grid, startNode, endNode));
        break;
      case 'bfs':
      default:
        ({ visitedNodesInOrder, path } = bfs(grid, startNode, endNode));
        break;
    }

    animateVisited(visitedNodesInOrder, path);
  }

  function animateVisited(visitedNodesInOrder, path) {
    // Delay depends on speed (lower speed => bigger delay)
    const visitDelay = 105 - speed * 10;

    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          animatePath(path);
        }, visitDelay * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        const nodeDiv = document.getElementById(`node-${node.row}-${node.col}`);
        if (nodeDiv) {
          nodeDiv.classList.add('node-visited');
        }
      }, visitDelay * i);
    }
  }

  function animatePath(path) {
    const pathDelay = 150 - speed * 15;
    for (let i = 0; i < path.length; i++) {
      setTimeout(() => {
        const node = path[i];
        const nodeDiv = document.getElementById(`node-${node.row}-${node.col}`);
        if (nodeDiv) {
          nodeDiv.classList.remove('node-visited');
          nodeDiv.classList.add('node-path');
        }
        // Unlock the UI at the end
        if (i === path.length - 1) {
          setIsRunning(false);
        }
      }, pathDelay * i);
    }

    // If path is empty => no final unlocking
    if (!path.length) {
      setIsRunning(false);
    }
  }

  /************************************************
   * Wall toggling and dragging start/end node
   ************************************************/
  const handleMouseDown = (row, col) => {
    if (isRunning) return;
    const node = grid[row][col];
    // If clicking on start or end => drag mode
    if (node.isStart) {
      isDraggingStart.current = true;
    } else if (node.isEnd) {
      isDraggingEnd.current = true;
    } else {
      // Toggle wall
      toggleWall(row, col);
    }
  };

  const handleMouseEnter = (row, col) => {
    if (isRunning) return;
    if (isDraggingStart.current) {
      moveStart(row, col);
    } else if (isDraggingEnd.current) {
      moveEnd(row, col);
    }
  };

  const handleMouseUp = () => {
    isDraggingStart.current = false;
    isDraggingEnd.current = false;
  };

  function toggleWall(row, col) {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    if (!node.isStart && !node.isEnd) {
      node.isWall = !node.isWall;
    }
    setGrid(newGrid);
  }

  function moveStart(row, col) {
    if (row === endPos.row && col === endPos.col) return; // can't overlap
    const newGrid = grid.slice();
    // Remove old start
    newGrid[startPos.row][startPos.col].isStart = false;
    newGrid[startPos.row][startPos.col].isWall = false;
    // Set new start
    newGrid[row][col].isStart = true;
    newGrid[row][col].isWall = false;
    setStartPos({ row, col });
    setGrid(newGrid);
  }

  function moveEnd(row, col) {
    if (row === startPos.row && col === startPos.col) return; // can't overlap
    const newGrid = grid.slice();
    // Remove old end
    newGrid[endPos.row][endPos.col].isEnd = false;
    newGrid[endPos.row][endPos.col].isWall = false;
    // Set new end
    newGrid[row][col].isEnd = true;
    newGrid[row][col].isWall = false;
    setEndPos({ row, col });
    setGrid(newGrid);
  }

  // Render the grid with event handlers
  function renderGrid() {
    return grid.map((rowArray, rowIdx) => {
      return (
        <div key={rowIdx} className="row">
          {rowArray.map((node, colIdx) => {
            const { row, col, isWall, isStart, isEnd } = node;
            return (
              <div
                key={colIdx}
                id={`node-${row}-${col}`}
                className={`node
                  ${isWall ? 'node-wall' : ''}
                  ${isStart ? 'node-start' : ''}
                  ${isEnd ? 'node-end' : ''}
                `}
                onMouseDown={() => handleMouseDown(row, col)}
                onMouseEnter={() => handleMouseEnter(row, col)}
                onMouseUp={handleMouseUp}
              />
            );
          })}
        </div>
      );
    });
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Pathfinder</h2>

      {/* Grid Size Controls */}
      <div style={{ margin: '10px 0' }}>
        <label>
          Rows:
          <input
            type="number"
            min={getMinRows()}
            max="50"
            value={numRows}
            onChange={(e) => handleRowsChange(e.target.value)}
            disabled={isRunning}
            style={{ width: '60px', margin: '0 8px' }}
          />
        </label>
        <label>
          Cols:
          <input
            type="number"
            min={getMinCols()}
            max="60"
            value={numCols}
            onChange={(e) => handleColsChange(e.target.value)}
            disabled={isRunning}
            style={{ width: '60px', margin: '0 8px' }}
          />
        </label>
      </div>

      {/* Algorithm + Speed */}
      <div style={{ margin: '10px 0' }}>
        <label>
          Algorithm:
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            disabled={isRunning}
            style={{ margin: '0 8px' }}
          >
            {ALGORITHMS.map((algo) => (
              <option key={algo.value} value={algo.value}>
                {algo.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Speed:
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            disabled={isRunning}
            style={{ margin: '0 8px' }}
          />
          {speed}
        </label>
      </div>

      {/* Buttons */}
      <button onClick={resetGrid} disabled={isRunning}>
        Reset Grid
      </button>
      <button onClick={clearPath} disabled={isRunning}>
        Clear Path
      </button>
      <button onClick={visualize} disabled={isRunning}>
        Visualize
      </button>

      {/* Grid */}
      <div style={{ marginTop: '20px', display: 'inline-block' }}>
        {renderGrid()}
      </div>
    </div>
  );
}
