export interface MathPuzzle {
  question: string;
  answer: number;
  options?: number[];
  type: 'arithmetic' | 'sequence' | 'logic';
}

export class MathPuzzleGenerator {
  static generatePuzzle(difficulty: 'easy' | 'medium' | 'hard'): MathPuzzle {
    const puzzleTypes = ['arithmetic', 'sequence', 'logic'] as const;
    const type = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];

    switch (type) {
      case 'arithmetic':
        return this.generateArithmeticPuzzle(difficulty);
      case 'sequence':
        return this.generateSequencePuzzle(difficulty);
      case 'logic':
        return this.generateLogicPuzzle(difficulty);
      default:
        return this.generateArithmeticPuzzle(difficulty);
    }
  }

  private static generateArithmeticPuzzle(difficulty: 'easy' | 'medium' | 'hard'): MathPuzzle {
    let num1: number, num2: number, operation: string, answer: number;

    switch (difficulty) {
      case 'easy':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operation = Math.random() > 0.5 ? '+' : '-';
        
        if (operation === '+') {
          answer = num1 + num2;
        } else {
          // Ensure positive result for subtraction
          if (num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
        }
        break;

      case 'medium':
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 20) + 1;
        const operations = ['+', '-', '*'];
        operation = operations[Math.floor(Math.random() * operations.length)];
        
        if (operation === '+') {
          answer = num1 + num2;
        } else if (operation === '-') {
          if (num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
        } else {
          // Keep multiplication simple
          num2 = Math.floor(Math.random() * 10) + 2;
          answer = num1 * num2;
        }
        break;

      case 'hard':
        num1 = Math.floor(Math.random() * 100) + 20;
        num2 = Math.floor(Math.random() * 30) + 5;
        const hardOperations = ['+', '-', '*', '/'];
        operation = hardOperations[Math.floor(Math.random() * hardOperations.length)];
        
        if (operation === '+') {
          answer = num1 + num2;
        } else if (operation === '-') {
          if (num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
        } else if (operation === '*') {
          num2 = Math.floor(Math.random() * 15) + 2;
          answer = num1 * num2;
        } else {
          // Division - ensure clean result
          answer = Math.floor(Math.random() * 20) + 5;
          num1 = answer * num2;
        }
        break;
    }

    return {
      question: `${num1} ${operation} ${num2} = ?`,
      answer,
      type: 'arithmetic'
    };
  }

  private static generateSequencePuzzle(difficulty: 'easy' | 'medium' | 'hard'): MathPuzzle {
    switch (difficulty) {
      case 'easy': {
        const start = Math.floor(Math.random() * 10) + 1;
        const step = Math.floor(Math.random() * 5) + 1;
        const sequence = [start, start + step, start + 2 * step, start + 3 * step];
        const answer = start + 4 * step;
        
        return {
          question: `What comes next? ${sequence.join(', ')}, ?`,
          answer,
          type: 'sequence'
        };
      }

      case 'medium': {
        const start = Math.floor(Math.random() * 20) + 1;
        const step1 = Math.floor(Math.random() * 5) + 2;
        const step2 = Math.floor(Math.random() * 3) + 1;
        // Pattern: add step1, then add step1+step2, then add step1+2*step2, etc.
        const sequence = [
          start,
          start + step1,
          start + step1 + (step1 + step2),
          start + step1 + (step1 + step2) + (step1 + 2 * step2)
        ];
        const answer = sequence[3] + (step1 + 3 * step2);
        
        return {
          question: `Find the pattern: ${sequence.join(', ')}, ?`,
          answer,
          type: 'sequence'
        };
      }

      case 'hard': {
        // Fibonacci-like sequence
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        const sequence = [a, b, a + b, a + 2 * b, 2 * a + 3 * b];
        const answer = 3 * a + 5 * b;
        
        return {
          question: `Continue the sequence: ${sequence.join(', ')}, ?`,
          answer,
          type: 'sequence'
        };
      }
    }
  }

  private static generateLogicPuzzle(difficulty: 'easy' | 'medium' | 'hard'): MathPuzzle {
    switch (difficulty) {
      case 'easy': {
        const base = Math.floor(Math.random() * 10) + 5;
        const answer = base * base;
        
        return {
          question: `What is ${base} squared?`,
          answer,
          type: 'logic'
        };
      }

      case 'medium': {
        const num = Math.floor(Math.random() * 20) + 10;
        const digits = num.toString().split('').map(Number);
        const answer = digits.reduce((sum, digit) => sum + digit, 0);
        
        return {
          question: `Sum of digits in ${num}?`,
          answer,
          type: 'logic'
        };
      }

      case 'hard': {
        const year = new Date().getFullYear();
        const age = Math.floor(Math.random() * 30) + 20;
        const birthYear = year - age;
        const answer = birthYear;
        
        return {
          question: `If someone is ${age} years old now, what year were they born?`,
          answer,
          type: 'logic'
        };
      }
    }
  }

  static generateMultipleChoice(puzzle: MathPuzzle): MathPuzzle {
    const correctAnswer = puzzle.answer;
    const options = [correctAnswer];
    
    // Generate 3 wrong answers
    for (let i = 0; i < 3; i++) {
      let wrongAnswer: number;
      do {
        const variation = Math.floor(Math.random() * 20) - 10;
        wrongAnswer = correctAnswer + variation;
      } while (options.includes(wrongAnswer) || wrongAnswer < 0);
      
      options.push(wrongAnswer);
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return {
      ...puzzle,
      options
    };
  }
}