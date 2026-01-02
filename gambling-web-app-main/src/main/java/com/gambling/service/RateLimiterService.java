package com.gambling.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {
    private static final int MAX_ATTEMPTS = 10; // Maximum attempts per window
    private static final int WINDOW_MINUTES = 1; // Time window in minutes
    
    private final Map<Long, UserAttempts> userAttempts = new ConcurrentHashMap<>();
    
    public boolean tryAcquire(Long userId) {
        cleanupOldEntries();
        
        UserAttempts attempts = userAttempts.computeIfAbsent(userId, 
            k -> new UserAttempts(LocalDateTime.now()));
            
        if (attempts.isWindowExpired()) {
            attempts.reset(LocalDateTime.now());
        }
        
        if (attempts.getCount() >= MAX_ATTEMPTS) {
            return false;
        }
        
        attempts.increment();
        return true;
    }
    
    private void cleanupOldEntries() {
        userAttempts.entrySet().removeIf(entry -> 
            entry.getValue().isWindowExpired());
    }
    
    private static class UserAttempts {
        private LocalDateTime windowStart;
        private int count;
        
        public UserAttempts(LocalDateTime windowStart) {
            this.windowStart = windowStart;
            this.count = 0;
        }
        
        public boolean isWindowExpired() {
            return LocalDateTime.now().isAfter(windowStart.plusMinutes(WINDOW_MINUTES));
        }
        
        public void reset(LocalDateTime newWindowStart) {
            this.windowStart = newWindowStart;
            this.count = 0;
        }
        
        public void increment() {
            count++;
        }
        
        public int getCount() {
            return count;
        }
    }
}
