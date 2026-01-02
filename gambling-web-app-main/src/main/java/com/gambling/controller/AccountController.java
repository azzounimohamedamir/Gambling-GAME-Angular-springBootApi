package com.gambling.controller;

import com.gambling.model.Transaction;
import com.gambling.service.TransactionService;
import com.gambling.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final TransactionService transactionService;
    private final UserService userService;

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            Long userId = getUserIdFromUsername(userDetails.getUsername());
            BigDecimal balance = userService.getBalance(userId);
            return ResponseEntity.ok(new BalanceResponse(balance));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody TransactionRequest request) {
        try {
            Long userId = getUserIdFromUsername(userDetails.getUsername());
            Transaction transaction = transactionService.deposit(userId, request.getAmount());
             
            return ResponseEntity.ok(TransactionResponse.fromTransaction(transaction));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody TransactionRequest request) {
        try {
            Long userId = getUserIdFromUsername(userDetails.getUsername());
            Transaction transaction = transactionService.withdraw(userId, request.getAmount());
            return ResponseEntity.ok(TransactionResponse.fromTransaction(transaction));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody TransferRequest request) {
        try {
            System.out.println("Sender ID............: ");            
            Long senderId = getUserIdFromUsername(userDetails.getUsername());
            System.out.println("Sender ID: " + senderId);
        
            Transaction transaction = transactionService.transfer(senderId, request.getReceiverId(), request.getAmount());
            return ResponseEntity.ok(TransactionResponse.fromTransaction(transaction));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<TransactionResponse>> getTransactions(
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable) {
        Long userId = getUserIdFromUsername(userDetails.getUsername());
        Page<Transaction> transactions = transactionService.getUserTransactions(userId, pageable);
        return ResponseEntity.ok(transactions.map(TransactionResponse::fromTransaction));
    }

    // Helper method to get userId from username
    private Long getUserIdFromUsername(String username) {
        return userService.findByUsername(username)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @lombok.Data
    public static class TransactionRequest {
        private BigDecimal amount;
    }

    @lombok.Data
    public static class TransferRequest {
        private Long receiverId;
        private BigDecimal amount;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class BalanceResponse {
        private BigDecimal balance;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class TransactionResponse {
        private Long id;
        private String type;
        private BigDecimal amount;
        private String status;
        private String createdAt;
        private String receiverUsername;

        public static TransactionResponse fromTransaction(Transaction transaction) {
            return new TransactionResponse(
                transaction.getId(),
                transaction.getType().toString(),
                transaction.getAmount(),
                transaction.getStatus().toString(),
                transaction.getCreatedAt().toString(),
                transaction.getReceiver() != null ? transaction.getReceiver().getUsername() : null
            );
        }
    }
}
