package com.gambling.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "games")
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "bet_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal betAmount;

    @Column(name = "number_sequence", length = 10, nullable = false)
    private String numberSequence;

    @Column(name = "user_guess", length = 10, nullable = false)
    private String userGuess;

    @Column(name = "correct_positions")
    private Integer correctPositions;

    @Column(name = "win_amount", precision = 10, scale = 2)
    private BigDecimal winAmount;

    @Column(name = "game_status")
    @Enumerated(EnumType.STRING)
    private GameStatus status;

    @Column(name = "played_at")
    private LocalDateTime playedAt;

    @PrePersist
    protected void onCreate() {
        playedAt = LocalDateTime.now();
    }

    public enum GameStatus {
        WIN,
        LOSE
    }

    // Helper method to calculate win amount based on correct positions
    public void calculateWinAmount() {
        if (correctPositions == null || correctPositions == 0 ) {
            this.winAmount = BigDecimal.ZERO;
            this.status = GameStatus.LOSE;
        } else {
            switch (correctPositions) {
                case 1:
                    this.winAmount = betAmount.multiply(BigDecimal.valueOf(1)); // 100% of bet
                   System.out.println(" DRAW: " +winAmount);
                    this.status = GameStatus.WIN;
                    break;
                case 2:
                    this.winAmount = betAmount.multiply(BigDecimal.valueOf(2)); // 100% of bet
                    System.out.println(" WIN: " +winAmount);
                    this.status = GameStatus.WIN;
                    break;
                case 3:
                    this.winAmount = betAmount.multiply(BigDecimal.valueOf(3)); // 200% of bet
                    this.status = GameStatus.WIN;
                    break;
                case 4:
                    this.winAmount = betAmount.multiply(BigDecimal.valueOf(4)); // 400% of bet
                    this.status = GameStatus.WIN;
                    break;
                case 5:
                    this.winAmount = betAmount.multiply(BigDecimal.valueOf(5)); // 600% of bet
                    this.status = GameStatus.WIN;
                    break;
                case 6:
                    this.winAmount = betAmount.multiply(BigDecimal.valueOf(6)); // 700% of bet
                    this.status = GameStatus.WIN;
                    break;
                case 7:
                    this.winAmount = betAmount.multiply(BigDecimal.valueOf(7)); // 800% of bet
                    this.status = GameStatus.WIN;
                    break;
                case 8:
                    this.winAmount = betAmount.multiply(BigDecimal.valueOf(8)); // 900% of bet
                    this.status = GameStatus.WIN;
                    break;
                case 9:
                    this.winAmount = betAmount.multiply(BigDecimal.valueOf(9)); // 1000% of bet
                    this.status = GameStatus.WIN;
                    break;
                case 10:
                    this.winAmount = betAmount.multiply(BigDecimal.valueOf(10)); // 1100% of bet
                    this.status = GameStatus.WIN;
                    break;
                default:
                    this.winAmount = BigDecimal.ZERO;
                    this.status = GameStatus.LOSE;
                    break;
            }
        }
    }
}
