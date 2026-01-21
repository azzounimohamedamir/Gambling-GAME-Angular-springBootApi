package com.gambling.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.LocaleResolver;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;
@Controller
public class HelloController {

   
    private final LocaleResolver localeResolver;

    public HelloController(LocaleResolver localeResolver) {
        this.localeResolver = localeResolver;
    }

    @GetMapping("/hello")
    public String hello(HttpServletRequest request, Model model) {
        Locale currentLocale = localeResolver.resolveLocale(request);
        System.out.println("Current resolved locale: " + currentLocale);
        
        // Add current locale to model for debugging
        model.addAttribute("currentLocale", currentLocale.toString());
        
        return "hello";
    }
}
