import { useEffect, useState } from "react";
import {
  randomIntFromIntarval,
  reverseLinkedList,
  useInterval,
} from "../../js/utils";

class LinkedListNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor(value) {
    const node = new LinkedListNode(value);
    this.head = node;
    this.tail = node;
  }
}

class Cell {
  constructor(row, col, value) {
    this.row = row;
    this.col = col;
    this.value = value;
  }
}

const Direction = {
  UP: "UP",
  RIGHT: "RIGHT",
  DOWN: "DOWN",
  LEFT: "LEFT",
};

const board_size = 10;
const probability_of_direction_reversal_food = 0.3;

const getStartingSnakeLLValue = (board) => {
  const rowSize = board.length;
  const colSize = board[0].length;
  const startingRow = Math.round(rowSize / 3);
  const startingCol = Math.round(colSize / 3);
  const startingCell = board[startingRow][startingCol];
  return {
    row: startingRow,
    col: startingCol,
    cell: startingCell,
  };
};

const Board = () => {
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState(createBoard(board_size));
  const [snake, setSnake] = useState(
    new LinkedList(getStartingSnakeLLValue(board))
  );
  const [snakeCells, setSnakeCells] = useState(
    new Set([snake.head.value.cell])
  );

  const [foodCell, setFoodCell] = useState(snake.head.value.cell + 5);
  const [direction, setDirection] = useState(Direction.RIGHT);
  const [foodShouldReverseDirection, setFoodShouldReverseDirection] =
    useState(false);

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      handleKeydown(e);
    });
  }, []);

  useInterval(() => {
    moveSnake();
  }, 250);

  const handleKeydown = (e) => {
    const newDirection = getDirectionFromKey(e.key);
    const isValidDirection = newDirection !== "";
    if (!isValidDirection) return;
    const snakeWillRunIntoItself =
      getOppositeDirection(newDirection) === direction && snakeCells.size > 1;
    if (snakeWillRunIntoItself) return;
    setDirection(newDirection);
  };

  const moveSnake = () => {
    const currentHeadCoords = {
      row: snake.head.value.row,
      col: snake.head.value.col,
    };

    const nextHeadCoords = getCoordsInDirection(currentHeadCoords, direction);
    if (isOutOfBounds(nextHeadCoords, board)) {
      handleGameOver();
      return;
    }
    const nextHeadCell = board[nextHeadCoords.row][nextHeadCoords.col];
    if (snakeCells.has(nextHeadCell)) {
      handleGameOver();
      return;
    }

    const newHead = new LinkedListNode({
      row: nextHeadCoords.row,
      col: nextHeadCoords.col,
      cell: nextHeadCell,
    });
    const currentHead = snake.head;
    snake.head = newHead;
    currentHead.next = newHead;

    const newSnakeCells = new Set(snakeCells);
    newSnakeCells.delete(snake.tail.value.cell);
    newSnakeCells.add(nextHeadCell);

    snake.tail = snake.tail.next;
    if (snake.tail === null) snake.tail = snake.head;

    const foodConsumed = nextHeadCell === foodCell;
    if (foodConsumed) {
      growSnake(newSnakeCells);
      if (foodShouldReverseDirection) reverseSnake();
      handleFoodConsumption(newSnakeCells);
    }

    setSnakeCells(newSnakeCells);
  };

  const growSnake = (newSnakeCells) => {
    const growthNodeCoords = getGrowthNodeCoords(snake.tail, direction);
    if (isOutOfBounds(growthNodeCoords, board)) {
      return;
    }
    const newTailCell = board[growthNodeCoords.row][growthNodeCoords.col];
    const newTail = new LinkedListNode({
      row: growthNodeCoords.row,
      col: growthNodeCoords.col,
      cell: newTailCell,
    });
    const currentTail = snake.tail;
    snake.tail = newTail;
    snake.tail.next = currentTail;

    newSnakeCells.add(newTailCell);
  };

  const reverseSnake = () => {
    const tailNextNodeDirection = getNextNodeDirection(snake.tail, direction);
    const newDirection = getOppositeDirection(tailNextNodeDirection);
    setDirection(newDirection);

    reverseLinkedList(snake.tail);
    const snakeHead = snake.head;
    snake.head = snake.tail;
    snake.tail = snakeHead;
  };

  const handleFoodConsumption = (newSnakeCells) => {
    const maxPossibleCellValue = board_size * board_size;
    let nextFoodCell;

    while (true) {
      nextFoodCell = randomIntFromIntarval(1, maxPossibleCellValue);
      if (newSnakeCells.has(nextFoodCell) || foodCell === nextFoodCell)
        continue;
      break;
    }

    const nextFoodShouldReverseDirection =
      Math.random() < probability_of_direction_reversal_food;

    setFoodCell(nextFoodCell);
    setFoodShouldReverseDirection(nextFoodShouldReverseDirection);
    setScore(score + 1);
  };

  const handleGameOver = () => {
    setScore(0);
    const snakeLLStartingValue = getStartingSnakeLLValue(board);
    setSnake(new LinkedList(snakeLLStartingValue));
    setFoodCell(snakeLLStartingValue.cell + 5);
    setSnakeCells(new Set([snakeLLStartingValue.cell]));
    setDirection(Direction.RIGHT);
  };

  return (
    <>
      <div className="flex flex-col gap-[1rem] box">
        <div className=" flex justify-center items-center text-amber-400 font-[700] text-[2rem]">
          Score: {score}
        </div>
        <div className="bg-slate-700 h-full w-full border-solid border-[0.6rem] border-amber-400 transition-all ">
          {board.map((row, rowId) => (
            <div
              key={rowId}
              className=" h-[3.5rem] outline outline-1 flex justify-center items-center "
            >
              {row.map((cell, cellId) => (
                <div
                  key={cellId}
                  className={`w-[3.5rem] h-[3.5rem] flex justify-center items-center outline  outline-1  
                ${snakeCells.has(cell) ? "bg-green-700" : ""} ${
                    foodCell === cell ? "bg-red-700" : ""
                  }
                ${
                  foodCell === cell && foodShouldReverseDirection
                    ? "!bg-purple-700"
                    : ""
                }
              `}
                >
                  {/* {cell} */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const createBoard = (BOARD_SIZE) => {
  let counter = 1;
  const board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      currentRow.push(counter++);
    }
    board.push(currentRow);
  }
  return board;
};

const getCoordsInDirection = (coords, direction) => {
  if (direction === Direction.UP) {
    return {
      row: coords.row - 1,
      col: coords.col,
    };
  }
  if (direction === Direction.RIGHT) {
    return {
      row: coords.row,
      col: coords.col + 1,
    };
  }
  if (direction === Direction.DOWN) {
    return {
      row: coords.row + 1,
      col: coords.col,
    };
  }
  if (direction === Direction.LEFT) {
    return {
      row: coords.row,
      col: coords.col - 1,
    };
  }
};

const isOutOfBounds = (coords, board) => {
  const { row, col } = coords;
  if (row < 0 || col < 0) return true;
  if (row >= board.length || col >= board[0].length) return true;
  return false;
};

const getDirectionFromKey = (key) => {
  if (key === "ArrowUp") return Direction.UP;
  if (key === "ArrowRight") return Direction.RIGHT;
  if (key === "ArrowDown") return Direction.DOWN;
  if (key === "ArrowLeft") return Direction.LEFT;
  return "";
};

const getNextNodeDirection = (node, currentDirection) => {
  if (node.next === null) return currentDirection;
  const { row: currentRow, col: currentCol } = node.value;
  const { row: nextRow, col: nextCol } = node.next.value;
  if (nextRow === currentRow && nextCol === currentCol + 1) {
    return Direction.RIGHT;
  }
  if (nextRow === currentRow && nextCol === currentCol - 1) {
    return Direction.LEFT;
  }
  if (nextCol === currentCol && nextRow === currentRow + 1) {
    return Direction.DOWN;
  }
  if (nextCol === currentCol && nextRow === currentRow - 1) {
    return Direction.UP;
  }
  return "";
};

const getGrowthNodeCoords = (snakeTail, currentDirection) => {
  const tailNextNodeDirection = getNextNodeDirection(
    snakeTail,
    currentDirection
  );
  const growthDirection = getOppositeDirection(tailNextNodeDirection);
  const currentTailCoords = {
    row: snakeTail.value.row,
    col: snakeTail.value.col,
  };
  const growthNodeCoords = getCoordsInDirection(
    currentTailCoords,
    growthDirection
  );
  return growthNodeCoords;
};

const getOppositeDirection = (direction) => {
  if (direction === Direction.UP) return Direction.DOWN;
  if (direction === Direction.RIGHT) return Direction.LEFT;
  if (direction === Direction.DOWN) return Direction.UP;
  if (direction === Direction.LEFT) return Direction.RIGHT;
};

// ${true ? "bg-green-500" : ""}
// new Array(board_size).fill(0).map((row) => Array(board_size).fill(0));

export default Board;
