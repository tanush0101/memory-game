import { Component, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';

interface Card {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
  mismatch: boolean;
  color: string;
  originalColor: string; // Store original brand color to restore if needed (though matched stays green)
}

interface Player {
  name: string;
  score: number;
  timeTaken: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate(
          '600ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ transform: 'translateX(0)', opacity: 1 }),
        ),
      ]),
    ]),
    trigger('popIn', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate(
          '600ms 200ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ transform: 'scale(1)', opacity: 1 }),
        ),
      ]),
    ]),
    trigger('cardFlip', [
      state('default', style({ transform: 'rotateY(0)' })),
      state('flipped', style({ transform: 'rotateY(180deg)' })),
      state('matched', style({ transform: 'rotateY(180deg)' })), // Matched stays flipped
      state('mismatch', style({ transform: 'rotateY(180deg)' })), // Mismatch stays flipped (briefly)

      transition('default => flipped', [animate('300ms ease-in')]),
      transition('flipped => default', [animate('300ms ease-out')]),

      // Shake animation for mismatch
      transition('* => mismatch', [
        animate(
          '0.5s',
          keyframes([
            style({ transform: 'rotateY(180deg) translateX(0)', offset: 0 }),
            style({ transform: 'rotateY(180deg) translateX(-5px)', offset: 0.1 }),
            style({ transform: 'rotateY(180deg) translateX(5px)', offset: 0.3 }),
            style({ transform: 'rotateY(180deg) translateX(-5px)', offset: 0.5 }),
            style({ transform: 'rotateY(180deg) translateX(5px)', offset: 0.7 }),
            style({ transform: 'rotateY(180deg) translateX(0)', offset: 1.0 }),
          ]),
        ),
      ]),
    ]),
  ],
})
export class App implements OnInit {
  playerName: string = '';
  gameStarted: boolean = false;
  gameOver: boolean = false;
  victory: boolean = false;

  // 90 Seconds Timer
  readonly TOTAL_TIME = 90;
  timeLeft: number = 90;
  timerInterval: any;
  displayTime: string = '01:30';

  cards: Card[] = [];
  flippedCards: Card[] = [];
  lockBoard: boolean = false;
  leaderboard: Player[] = [];

  icons = [
    { icon: 'fa-brands fa-angular', color: '#dd0031' },
    { icon: 'fa-brands fa-react', color: '#61dbfb' },
    { icon: 'fa-brands fa-vuejs', color: '#42b883' },
    { icon: 'fa-brands fa-js', color: '#f0db4f' },
    { icon: 'fa-brands fa-python', color: '#306998' },
    { icon: 'fa-brands fa-java', color: '#5382a1' },
    { icon: 'fa-solid fa-database', color: '#00758f' },
    { icon: 'fa-brands fa-docker', color: '#0db7ed' },
  ];

  ngOnInit() {
    this.loadLeaderboard();
  }

  startGame() {
    if (!this.playerName.trim()) return;
    this.gameStarted = true;
    this.resetGameVariables();
    this.setupCards();
    this.startTimer();
  }

  resetGameVariables() {
    this.timeLeft = this.TOTAL_TIME;
    this.displayTime = '01:30';
    this.gameOver = false;
    this.victory = false;
    this.flippedCards = [];
    this.lockBoard = false;
  }

  setupCards() {
    const pairs = [...this.icons, ...this.icons];
    this.cards = pairs
      .sort(() => 0.5 - Math.random())
      .map((item, index) => ({
        id: index,
        icon: item.icon,
        color: item.color,
        originalColor: item.color, // Save original color
        flipped: false,
        matched: false,
        mismatch: false,
      }));
  }

  flipCard(card: Card) {
    if (this.lockBoard || card.flipped || card.matched || this.gameOver) return;

    card.flipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.checkMatch();
    }
  }

  checkMatch() {
    this.lockBoard = true;
    const [card1, card2] = this.flippedCards;

    if (card1.icon === card2.icon) {
      // --- MATCH ---
      card1.matched = true;
      card2.matched = true;

      // CHANGE COLOR TO GREEN FOR BORDER
      card1.color = '#39ff14'; // Neon Green
      card2.color = '#39ff14'; // Neon Green

      this.flippedCards = [];
      this.lockBoard = false;
      this.checkVictory();
    } else {
      // --- MISMATCH ---
      card1.mismatch = true;
      card2.mismatch = true;

      // Wait 1 second (Live Red Border) then unflip
      setTimeout(() => {
        card1.flipped = false;
        card2.flipped = false;
        card1.mismatch = false;
        card2.mismatch = false;
        this.flippedCards = [];
        this.lockBoard = false;
      }, 1000);
    }
  }

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.updateDisplayTime();
      } else {
        this.endGame(false);
      }
    }, 1000);
  }

  updateDisplayTime() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  checkVictory() {
    if (this.cards.every((c) => c.matched)) {
      this.endGame(true);
    }
  }

  endGame(won: boolean) {
    clearInterval(this.timerInterval);
    this.gameOver = true;
    this.victory = won;
    if (won) this.saveScore();
  }

  saveScore() {
    const score = this.timeLeft * 10;
    this.leaderboard.push({ name: this.playerName, score: score, timeTaken: this.displayTime });
    this.leaderboard.sort((a, b) => b.score - a.score);
    this.leaderboard = this.leaderboard.slice(0, 10);
    localStorage.setItem('memoryGameLeaderboard', JSON.stringify(this.leaderboard));
  }

  loadLeaderboard() {
    const stored = localStorage.getItem('memoryGameLeaderboard');
    if (stored) this.leaderboard = JSON.parse(stored);
  }

  restart() {
    this.gameStarted = false;
    this.playerName = '';
    clearInterval(this.timerInterval);
  }
}
