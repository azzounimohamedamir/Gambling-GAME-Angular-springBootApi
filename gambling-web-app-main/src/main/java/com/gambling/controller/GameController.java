package com.gambling.controller;

import com.gambling.model.Game;
import com.gambling.service.GameService;
import com.gambling.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.LocaleResolver;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;

@Controller
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;
    private final UserService userService;
    private final LocaleResolver localeResolver;

    @GetMapping("/game")
    public String game(HttpServletRequest request, Model model, @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        Locale currentLocale = localeResolver.resolveLocale(request);
        System.out.println("Current resolved locale: " + currentLocale);
        
        // Add current locale to model for debugging
        model.addAttribute("currentLocale", currentLocale.toString());
        model.addAttribute("request", request);
        model.addAttribute("currentUri", request.getRequestURI());

        if (userDetails != null) {
            var userOpt = userService.findByUsername(userDetails.getUsername());
            if (userOpt.isPresent()) {
                var user = userOpt.get();
                model.addAttribute("username", user.getUsername());
                model.addAttribute("balance", user.getBalance());
                model.addAttribute("userId", user.getId());
            } else {
                System.err.println("User not found for username: " + userDetails.getUsername());
                model.addAttribute("username", "Unknown");
                model.addAttribute("balance", 0);
            }
        } else {
            System.err.println("UserDetails is null in game controller");
            model.addAttribute("username", "Guest");
            model.addAttribute("balance", 0);
        }
        
        return "game";
    }

    @PostMapping("/api/games/play")
    public ResponseEntity<?> playGame(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PlayGameRequest request) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body("Unauthorized: User details not found");
            }
            Long userId = getUserIdFromUsername(userDetails.getUsername());
            Game game = gameService.playGame(userId, request.getGuess(), request.getBetAmount());
            return ResponseEntity.ok(GameResponse.fromGame(game));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/api/games/history")
    public ResponseEntity<Page<GameResponse>> getGameHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = getUserIdFromUsername(userDetails.getUsername());
        Page<Game> games = gameService.getUserGames(userId, pageable);
        return ResponseEntity.ok(games.map(GameResponse::fromGame));
    }

    @GetMapping("/api/games/history/all")
    public ResponseEntity<?> getAllGameHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = getUserIdFromUsername(userDetails.getUsername());
        var games = gameService.getAllUserGames(userId);
        return ResponseEntity.ok(games.stream().map(GameResponse::fromGame).toList());
    }

    @GetMapping("/api/games/statistics")
    public ResponseEntity<?> getGameStatistics(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body("Unauthorized: User details not found");
            }
            Long userId = getUserIdFromUsername(userDetails.getUsername());
            System.out.println("Fetching game statistics for userId: " + userId); // Debug log
            GameService.GameStatistics stats = gameService.getUserStatistics(userId);
            System.out.println("Game statistics: " + stats); // Debug log
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            System.err.println("Error fetching game statistics: " + e.getMessage()); // Debug log
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Helper method to get userId from username
    private Long getUserIdFromUsername(String username) {
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }

    @lombok.Data
    public static class PlayGameRequest {
        private String guess;
        private BigDecimal betAmount;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class GameResponse {
        private Long id;
        private String numberSequence;
        private String userGuess;
        private Integer correctPositions;
        private BigDecimal betAmount;
        private BigDecimal winAmount;
        private Game.GameStatus status;
        private String playedAt;

        public static GameResponse fromGame(Game game) {
            return new GameResponse(
                game.getId(),
                game.getNumberSequence(),
                game.getUserGuess(),
                game.getCorrectPositions(),
                game.getBetAmount(),
                game.getWinAmount(),
                game.getStatus(),
                game.getPlayedAt().toString()
            );
        }
    }
}
