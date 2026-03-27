package com.petcare.petwellness.Config;

import com.petcare.petwellness.Util.JwtUtil;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Repository.UserRepository;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil,
                                   UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String servletPath = request.getServletPath();
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }

        // Skip JWT filter for public auth endpoints, but NOT for set-password
        if (servletPath.startsWith("/api/auth/")) {
            return !"/api/auth/set-password".equals(servletPath);
        }

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);
            try {
                if (jwtUtil.isTokenValid(token)) {
                    String email = jwtUtil.extractEmail(token);

                    if (email != null &&
                            SecurityContextHolder.getContext().getAuthentication() == null) {

                        User user = userRepository.findByEmail(email).orElse(null);

                        if (user != null) {

                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            email,
                                            null,
                                            List.of(new SimpleGrantedAuthority(
                                                    "ROLE_" + user.getRole().name()))
                                    );

                            authToken.setDetails(
                                    new WebAuthenticationDetailsSource()
                                            .buildDetails(request));

                            SecurityContextHolder.getContext()
                                    .setAuthentication(authToken);
                        } else {
                            // Log warning if user not found (for debugging)
                            // This shouldn't happen if registration worked correctly
                            System.err.println("WARNING: JWT token contains email '" + email + "' but user not found in database");
                        }
                    }
                }
            } catch (RuntimeException ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
