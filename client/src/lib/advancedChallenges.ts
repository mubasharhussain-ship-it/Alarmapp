
export interface Challenge {
  type: 'memory' | 'reaction' | 'sequence' | 'puzzle' | 'qr';
  question?: string;
  sequence?: number[];
  correctAnswer?: any;
  timeLimit?: number;
}

export class AdvancedChallenges {
  static generateMemoryChallenge(): Challenge {
    const sequence = Array.from({ length: 6 }, () => Math.floor(Math.random() * 9) + 1);
    
    return {
      type: 'memory',
      question: `Remember this sequence: ${sequence.join(' - ')}`,
      sequence,
      correctAnswer: sequence,
      timeLimit: 10000
    };
  }

  static generateReactionChallenge(): Challenge {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
    const targetColor = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      type: 'reaction',
      question: `Tap when you see: ${targetColor.toUpperCase()}`,
      correctAnswer: targetColor,
      timeLimit: 15000
    };
  }

  static generateSequenceChallenge(): Challenge {
    const operations = ['+', '-', '*'];
    const nums = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10) + 1);
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let result = nums[0];
    for (let i = 1; i < nums.length; i++) {
      if (op === '+') result += nums[i];
      else if (op === '-') result -= nums[i];
      else result *= nums[i];
    }
    
    return {
      type: 'sequence',
      question: `Calculate: ${nums.join(` ${op} `)}`,
      correctAnswer: result,
      timeLimit: 20000
    };
  }

  static generatePuzzleChallenge(): Challenge {
    const puzzles = [
      {
        question: "What has keys but no locks, space but no room?",
        answer: "keyboard"
      },
      {
        question: "I am not alive, but I grow. I don't have lungs, but I need air. What am I?",
        answer: "fire"
      },
      {
        question: "What gets wet while drying?",
        answer: "towel"
      },
      {
        question: "What has a thumb and four fingers but is not alive?",
        answer: "glove"
      }
    ];
    
    const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
    
    return {
      type: 'puzzle',
      question: puzzle.question,
      correctAnswer: puzzle.answer.toLowerCase(),
      timeLimit: 30000
    };
  }

  static generateQRChallenge(): Challenge {
    const codes = [
      "WAKE_UP_NOW",
      "GOOD_MORNING",
      "START_YOUR_DAY",
      "RISE_AND_SHINE"
    ];
    
    const code = codes[Math.floor(Math.random() * codes.length)];
    
    return {
      type: 'qr',
      question: `Scan this QR code to dismiss alarm`,
      correctAnswer: code,
      timeLimit: 60000
    };
  }

  static generateChallenge(difficulty: 'easy' | 'medium' | 'hard' | 'extreme'): Challenge {
    switch (difficulty) {
      case 'easy':
        return Math.random() > 0.5 ? 
          this.generateReactionChallenge() : 
          this.generateSequenceChallenge();
      
      case 'medium':
        return Math.random() > 0.5 ? 
          this.generateMemoryChallenge() : 
          this.generatePuzzleChallenge();
      
      case 'hard':
        const hardChallenges = [
          this.generateMemoryChallenge(),
          this.generateSequenceChallenge(),
          this.generatePuzzleChallenge()
        ];
        return hardChallenges[Math.floor(Math.random() * hardChallenges.length)];
      
      case 'extreme':
        return this.generateQRChallenge();
      
      default:
        return this.generateReactionChallenge();
    }
  }
}
