package com.gambling.service;

import com.gambling.model.User;
import com.gambling.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(String username, String password) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setBalance(BigDecimal.ZERO);

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User updateBalance(User user, BigDecimal newBalance) {
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Balance cannot be negative");
        }
        user.setBalance(newBalance);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public BigDecimal getBalance(Long userId) {
        return userRepository.findById(userId)
                .map(User::getBalance)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public void validateUserExists(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
    }

    @Transactional
    public boolean validatePassword(User user, String password) {
        return passwordEncoder.matches(password, user.getPassword());
    }
}
