package com.WebSockets.SpringBoot.Services;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration; // access token millis

    @Value("${jwt.refreshExpiration}")
    private long refreshExpiration; // refresh token millis

    private Key key() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    private String buildToken(String subject, long expirationMillis) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateAccessToken(String username) {
        return buildToken(username, jwtExpiration);
    }

    public String generateRefreshToken(String username) {
        return buildToken(username, refreshExpiration);
    }

    public long getRefreshExpiration() { return refreshExpiration; }
    public long getJwtExpiration() { return jwtExpiration; }

    // strict extraction (will throw if token expired)
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // lenient extraction: if token is expired but signature was valid, return subject from the ExpiredJwtException
    public String extractUsernameAllowExpired(String token) {
        try {
            return extractUsername(token);
        } catch (ExpiredJwtException e) {
            Claims claims = e.getClaims();
            return claims != null ? claims.getSubject() : null;
        } catch (JwtException e) {
            // invalid signature / malformed etc
            return null;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }

    public boolean isTokenValid(String token, String username) {
        try {
            String extracted = extractUsername(token);
            return extracted != null && extracted.equals(username) && !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        try {
            Date exp = extractClaim(token, Claims::getExpiration);
            return exp.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }
}
