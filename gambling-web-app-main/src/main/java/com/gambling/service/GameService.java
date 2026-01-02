package com.gambling.service;

import com.gambling.model.Game;
import com.gambling.model.Transaction;
import com.gambling.model.User;
import com.gambling.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class GameService {
    private final GameRepository gameRepository;
    private final UserService userService;
    private final TransactionService transactionService;
    private final RateLimiterService rateLimiterService;
    private final Random random = new Random();

    @Transactional
    public Game playGame(Long userId, String userGuess, BigDecimal betAmount) {
        // Check rate limit
        if (!rateLimiterService.tryAcquire(userId)) {
            throw new RuntimeException("Too many game attempts. Please wait before playing again.");
        }
        System.out.println("User ID: " + userId + ", Guess: " + userGuess + ", Bet Amount: " + betAmount);
        // Validate input
        validateGuess(userGuess);
        validateBetAmount(betAmount);

        // Get user and check balance
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getBalance().compareTo(betAmount) < 0) {
            throw new RuntimeException("Insufficient balance for bet");
        }

        // Generate random number sequence
        String numberSequence = generateNumberSequence();
        
        // Calculate correct positions
        int correctPositions = calculateCorrectPositions(numberSequence, userGuess);

        // Create and save game record
        Game game = new Game();
        game.setUser(user);
        game.setBetAmount(betAmount);
        game.setNumberSequence(numberSequence);
        game.setUserGuess(userGuess);
        game.setCorrectPositions(correctPositions);
        
        // Calculate and set win amount
        game.calculateWinAmount();

        // Update user balance
        // APRÈS (CORRECT) :
BigDecimal newBalance;
if (game.getStatus() == Game.GameStatus.WIN) {
    // Si WIN: nouveau solde = ancien solde - mise + gain
    newBalance = user.getBalance().subtract(betAmount).add(game.getWinAmount());
    System.out.println(" NEW BALANCE after WIN: " +newBalance);
} else {
    // Si LOSS: nouveau solde = ancien solde - mise
    newBalance = user.getBalance().subtract(betAmount);
    System.out.println(" NEW BALANCE after LOSS: " +newBalance);
}
        userService.updateBalance(user, newBalance);
        
        // Record transactions
        transactionService.recordGameTransaction(user, betAmount, Transaction.TransactionType.BET);
        if (game.getWinAmount().compareTo(BigDecimal.ZERO) > 0) {
            transactionService.recordGameTransaction(user, game.getWinAmount(), Transaction.TransactionType.WIN);
        }

        return gameRepository.save(game);
    }

    private void validateGuess(String guess) {
              if (guess == null || guess.length() != 10 || !guess.matches("\\d{10}")) {
            throw new RuntimeException("Invalid guess format. Must be 10 digits (0-9)");
        }
    }

    private void validateBetAmount(BigDecimal betAmount) {
        if (betAmount == null || betAmount.compareTo(BigDecimal.ONE) < 0 || 
            betAmount.compareTo(new BigDecimal("100")) > 0) {
            throw new RuntimeException("Bet amount must be between $1 and $100");
        }
    }

    private String generateNumberSequence() {
      return IntStream.range(0, 10)
                .mapToObj(i -> String.valueOf(random.nextInt(10)))
                .collect(Collectors.joining());
    }
    private int calculateCorrectPositions(String numberSequence, String userGuess) {
        return (int) IntStream.range(0, 10)
                .filter(i -> numberSequence.charAt(i) == userGuess.charAt(i))
                .count();
    }

    @Transactional(readOnly = true)
    public Page<Game> getUserGames(Long userId, Pageable pageable) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return gameRepository.findByUser(user, pageable);
    }

    @Transactional(readOnly = true)
    public java.util.List<Game> getAllUserGames(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return gameRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public GameStatistics getUserStatistics(Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return GameStatistics.builder()
                .totalGames(gameRepository.countByUser(user))
                .wins(gameRepository.countByUserAndStatus(user, Game.GameStatus.WIN))
                .totalWinnings(gameRepository.getTotalWinnings(user))
                .totalBets(gameRepository.getTotalBets(user))
                .averageCorrectPositions(gameRepository.getAverageCorrectPositions(user))
                .build();
    }

    @lombok.Builder
    @lombok.Data
    public static class GameStatistics {
        private long totalGames;
        private long wins;
        private BigDecimal totalWinnings;
        private BigDecimal totalBets;
        private Double averageCorrectPositions;

        public long getLosses() {
            return totalGames - wins;
        }

        public Double getWinRate() {
            return totalGames > 0 ? (double) wins / totalGames : 0.0;
        }

        public BigDecimal getNetProfit() {
            return totalWinnings.subtract(totalBets);
        }
    }
}
