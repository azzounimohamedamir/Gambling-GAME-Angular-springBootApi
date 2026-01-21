package com.gambling.controller;

import com.gambling.model.User;
import com.gambling.security.JwtService;
import com.gambling.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.LocaleResolver;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;

@Controller
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final LocaleResolver localeResolver;

    @PostMapping("/api/auth/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request.getUsername(), request.getPassword());
            String token = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    java.util.Collections.emptyList()
                )
            );
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/register")
    public String register(HttpServletRequest request, Model model) {
        Locale currentLocale = localeResolver.resolveLocale(request);
        System.out.println("Current resolved locale: " + currentLocale);
        
        // Add current locale to model for debugging
        model.addAttribute("currentLocale", currentLocale.toString());
        
        return "register";
    }

    @GetMapping("/login")
    public String login(HttpServletRequest request, Model model) {
        Locale currentLocale = localeResolver.resolveLocale(request);
        System.out.println("Current resolved locale: " + currentLocale);
        
        // Add current locale to model for debugging
        model.addAttribute("currentLocale", currentLocale.toString());
        model.addAttribute("request", request);
        model.addAttribute("currentUri", request.getRequestURI());

        return "login";
    }

    @PostMapping("/api/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            var user = (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
            String token = jwtService.generateToken(user);
            
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }

    @GetMapping("/api/auth/userinfo")
    public ResponseEntity<?> getUserInfo(@AuthenticationPrincipal org.springframework.security.core.userdetails.User userDetails) {
        try {
            User user = userService.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            UserInfoResponse response = new UserInfoResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getBalance()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class UserInfoResponse {
        private Long id;
        private String username;
        private java.math.BigDecimal balance;
    }

    @lombok.Data
    public static class RegisterRequest {
        private String username;
        private String password;
    }

    @lombok.Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String username;
    }
}
