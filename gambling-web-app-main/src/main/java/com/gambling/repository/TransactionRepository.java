package com.gambling.repository;

import com.gambling.model.Transaction;
import com.gambling.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Find transactions by user
    Page<Transaction> findByUser(User user, Pageable pageable);
    
    // Find transactions where user is either sender or receiver
    Page<Transaction> findByUserOrReceiver(User user, User receiver, Pageable pageable);
    
    // Find transactions by type for a specific user
    List<Transaction> findByUserAndType(User user, Transaction.TransactionType type);
    
    // Find transactions between dates for a specific user
    List<Transaction> findByUserAndCreatedAtBetween(
        User user, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    // Find recent transactions for a user
    List<Transaction> findTop10ByUserOrderByCreatedAtDesc(User user);
}
