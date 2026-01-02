package com.gambling.service;

import com.gambling.model.Transaction;
import com.gambling.model.User;
import com.gambling.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserService userService;

    @Transactional
    public Transaction deposit(Long userId, BigDecimal amount) {
        System.out.println("Deposit amount: " + amount);
        System.out.println("User ID: " + userId);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Deposit amount must be positive");
        }

        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType(Transaction.TransactionType.DEPOSIT);
        transaction.setAmount(amount);
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);

        // Update user balance
        BigDecimal newBalance = user.getBalance().add(amount);
        userService.updateBalance(user, newBalance);

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction withdraw(Long userId, BigDecimal amount) {
        System.out.println("Withdrawal amount: " + amount);
        System.out.println("User ID: " + userId);
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Withdrawal amount must be positive");
        }

        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType(Transaction.TransactionType.WITHDRAWAL);
        transaction.setAmount(amount);
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);

        // Update user balance
        BigDecimal newBalance = user.getBalance().subtract(amount);
        userService.updateBalance(user, newBalance);

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction transfer(Long senderId, Long receiverId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be positive");
        }

        User sender = userService.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userService.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        Transaction transaction = new Transaction();
        transaction.setUser(sender);
        transaction.setReceiver(receiver);
        transaction.setType(Transaction.TransactionType.TRANSFER);
        transaction.setAmount(amount);
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);

        // Update balances
        userService.updateBalance(sender, sender.getBalance().subtract(amount));
        userService.updateBalance(receiver, receiver.getBalance().add(amount));

        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public Page<Transaction> getUserTransactions(Long userId, Pageable pageable) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return transactionRepository.findByUserOrReceiver(user, user, pageable);
    }

    @Transactional
    public Transaction recordGameTransaction(User user, BigDecimal amount, Transaction.TransactionType type) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setStatus(Transaction.TransactionStatus.COMPLETED);
        return transactionRepository.save(transaction);
    }
}
