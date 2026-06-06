package pogra4.be.security;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.SecretKey;

@Configuration
public class JwtConfig {

    @Value("${security.jwt.secret-key}")
    private String secretKey;

    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    @Value("${security.jwt.algorithm}")
    private String algorithm;

    public SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public long getJwtExpiration() {
        return jwtExpiration;
    }

    public String getAlgorithm() {
        return algorithm;
    }
}


