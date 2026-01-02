package com.gambling.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.i18n.CookieLocaleResolver;
import org.springframework.web.servlet.i18n.LocaleChangeInterceptor;
import org.springframework.context.support.AbstractMessageSource;

import java.text.MessageFormat;
import java.util.Locale;
import java.util.TimeZone;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public LocaleResolver localeResolver() {
        CookieLocaleResolver localeResolver = new CookieLocaleResolver();
        
        // Explicitly set default locale to English
        localeResolver.setDefaultLocale(Locale.ENGLISH);
        localeResolver.setDefaultTimeZone(TimeZone.getTimeZone("UTC"));
        localeResolver.setCookieName("LANGUAGE");
        localeResolver.setCookieMaxAge(3600 * 24 * 30); // 30 days
        
        // Fixed: Proper debug logging
        
        return localeResolver;
    }

    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor localeChangeInterceptor = new LocaleChangeInterceptor();
        localeChangeInterceptor.setParamName("lang");
        return localeChangeInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(localeChangeInterceptor());
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/")
                .setCachePeriod(0);
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/")
                .setCachePeriod(0);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/login");
    }

    @Bean
    public AbstractMessageSource messageSource() {
        ICUMessageSource messageSource = new ICUMessageSource();
        // Custom message source doesn't need these settings
        return messageSource;
    }

    public static class ICUMessageSource extends AbstractMessageSource {

        private final Map<String, ResourceBundle> cachedBundles = new ConcurrentHashMap<>();

        @Override
        protected MessageFormat resolveCode(String code, Locale locale) {
            ResourceBundle bundle = getBundle(locale);
            if (bundle == null) {
                // Fallback to English if the requested locale bundle is not found
                bundle = getBundle(Locale.ENGLISH);
                if (bundle == null) {
                    return null;
                }
            }
            try {
                String msg = bundle.getString(code);
                return new MessageFormat(msg, locale);
            } catch (MissingResourceException e) {
                // Try fallback to English
                if (!locale.equals(Locale.ENGLISH)) {
                    ResourceBundle englishBundle = getBundle(Locale.ENGLISH);
                    if (englishBundle != null) {
                        try {
                            String msg = englishBundle.getString(code);
                            return new MessageFormat(msg, Locale.ENGLISH);
                        } catch (MissingResourceException ex) {
                            return null;
                        }
                    }
                }
                return null;
            }
        }

        private ResourceBundle getBundle(Locale locale) {
            String bundleName = "lang/messages";
            String cacheKey = bundleName + "_" + locale.toString();
            return cachedBundles.computeIfAbsent(cacheKey, key -> {
                try {
                    return ResourceBundle.getBundle(bundleName, locale);
                } catch (MissingResourceException e) {
                    System.out.println("Bundle not found for locale: " + locale + ", bundle: " + bundleName);
                    return null;
                }
            });
        }
    }
}