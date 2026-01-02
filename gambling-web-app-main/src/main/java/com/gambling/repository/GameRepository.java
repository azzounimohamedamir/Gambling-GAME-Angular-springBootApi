package com.gambling.repository;

import com.gambling.model.Game;
import com.gambling.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    // Find games by user
    Page<Game> findByUser(User user, Pageable pageable);
    
    // Find all games by user without pagination
    List<Game> findByUser(User user);
    
    // Find recent games by user
    List<Game> findTop10ByUserOrderByPlayedAtDesc(User user);
    
    // Find games by status for a user
    List<Game> findByUserAndStatus(User user, Game.GameStatus status);
    
    // Get user's win/loss statistics
    @Query("SELECT COUNT(g) FROM Game g WHERE g.user = :user AND g.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") Game.GameStatus status);
    
    // Get total winnings for a user
    @Query("SELECT COALESCE(SUM(g.winAmount), 0) FROM Game g WHERE g.user = :user AND g.status = 'WIN'")
    BigDecimal getTotalWinnings(@Param("user") User user);
    
    // Get total bets for a user
    @Query("SELECT COALESCE(SUM(g.betAmount), 0) FROM Game g WHERE g.user = :user")
    BigDecimal getTotalBets(@Param("user") User user);
    
    // Find games between dates for a user
    List<Game> findByUserAndPlayedAtBetween(
        User user, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    // Get user's average correct positions
    @Query("SELECT AVG(g.correctPositions) FROM Game g WHERE g.user = :user")
    Double getAverageCorrectPositions(@Param("user") User user);
    
    // Count total games for a user
    @Query("SELECT COUNT(g) FROM Game g WHERE g.user = :user")
    long countByUser(@Param("user") User user);
}
