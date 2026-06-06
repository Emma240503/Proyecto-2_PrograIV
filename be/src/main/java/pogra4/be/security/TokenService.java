package pogra4.be.security;

import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import pogra4.be.logic.Admin;
import pogra4.be.logic.Empresa;
import pogra4.be.logic.Oferente;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
@AllArgsConstructor
public class TokenService {

    private final JwtConfig jwtConfig;

    /**
     * Genera un token JWT para un usuario (Empresa, Oferente o Admin)
     * @param userId ID del usuario
     * @param rol Rol del usuario (EMPRESA, OFERENTE, ADMIN)
     * @param name Nombre del usuario
     * @return Token JWT firmado
     */
    public String generateToken(String userId, String rol, String name) {
        return Jwts.builder()
                .subject(userId)
                .claim("rol", rol)
                .claim("nombre", name)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getJwtExpiration()))
                .signWith(getSecretKey())
                .compact();
    }

    /**
     * Genera token para una Empresa
     */
    public String generateTokenForEmpresa(Empresa empresa) {
        return generateToken(empresa.getId(), "EMPRESA", empresa.getNombre());
    }

    /**
     * Genera token para un Oferente
     */
    public String generateTokenForOferente(Oferente oferente) {
        String nombreCompleto = oferente.getNombre() + " " + oferente.getPrimerApellido();
        return generateToken(oferente.getId(), "OFERENTE", nombreCompleto);
    }

    /**
     * Genera token para un Admin
     */
    public String generateTokenForAdmin(Admin admin) {
        return generateToken(admin.getId(), "ADMIN", admin.getNombre());
    }

    private SecretKey getSecretKey() {
        return jwtConfig.getSecretKey();
    }
}

