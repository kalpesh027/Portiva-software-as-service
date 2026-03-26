package com.portiva.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * React SPA routing controller.
 *
 * Forwards React app routes to the correct HTML file.
 * Spring Boot serves the built React app from /static (or /public).
 *
 * ROUTING RULES:
 * - Standard app routes → forward:/index.html (React app)
 * - /{slug} and /{slug}/{page} → forward:/index-portfolio.html (portfolio viewer)
 * - Requests starting with 'api' → NOT forwarded (handled by REST controllers)
 * - Requests containing '.' (static files) → NOT forwarded (served directly)
 */
@Controller
public class ReactRoutingController {

    /** Main app routes → React SPA */
    @GetMapping({"/", "/login", "/register", "/verify-otp",
                 "/create", "/dashboard", "/preview",
                 "/portfolio-dummy", "/ai-processing", "/portfolio-success"})
    public String serveApp() {
        return "forward:/index.html";
    }

    /**
     * Public portfolio slug routes → portfolio viewer HTML.
     * Catches /{slug} and /{slug}/{page}.
     * Excludes paths starting with 'api' or containing '.' (files).
     */
    @GetMapping(
        value = "/{slug:[a-z0-9\\-]+}",
        headers = "!X-Api-Request"   // exclude API clients
    )
    public String servePortfolio(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Do not forward static files or API calls
        if (path.contains(".") || path.startsWith("/api")) {
            return null; // let default error handling proceed
        }

        return "forward:/index-portfolio.html";
    }

    @GetMapping("/{slug:[a-z0-9\\-]+}/{page:[a-z0-9\\-]+}")
    public String servePortfolioPage(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.contains(".") || path.startsWith("/api")) {
            return null;
        }
        return "forward:/index-portfolio.html";
    }
}
