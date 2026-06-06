package pogra4.be.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Autowired
    private JwtConfig jwtConfig;

    private SecretKey getKey() {
        return jwtConfig.getSecretKey();
    }

    public String generateToken(String subject, String rol) {
        return Jwts.builder()
                .subject(subject)
                .claim("rol", rol)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getJwtExpiration()))
                .signWith(getKey())
                .compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getSubject(String token) {
        return getClaims(token).getSubject();
    }

    public String getRol(String token) {
        return getClaims(token).get("rol", String.class);
    }

    public boolean isValid(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
