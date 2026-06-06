package pogra4.be.presentation.auth;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pogra4.be.logic.Admin;
import pogra4.be.logic.Empresa;
import pogra4.be.logic.Oferente;
import pogra4.be.logic.Service;
import pogra4.be.security.TokenService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private Service service;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        String correo = req.getCorreo();
        String clave = req.getClave();

        // Admin usa ID como usuario
        Admin admin = service.findAdminById(correo);
        if (admin != null && clave.equals(admin.getContrasenna())) {
            String token = tokenService.generateTokenForAdmin(admin);
            return new LoginResponse(token, "ADMIN", admin.getId(), admin.getNombre());
        }

        // Empresa
        Empresa empresa = service.findEmpresaByCorreo(correo);
        if (empresa != null && clave.equals(empresa.getContrasenna())) {
            if (!"aprobada".equalsIgnoreCase(empresa.getEstado()) &&
                !"ACTIVA".equalsIgnoreCase(empresa.getEstado())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Empresa pendiente de aprobación");
            }
            String token = tokenService.generateTokenForEmpresa(empresa);
            return new LoginResponse(token, "EMPRESA", empresa.getId(), empresa.getNombre());
        }

        // Oferente
        Oferente oferente = service.findOferenteByCorreo(correo);
        if (oferente != null && clave.equals(oferente.getContrasenna())) {
            if (!"aprobado".equalsIgnoreCase(oferente.getEstado())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Oferente pendiente de aprobación");
            }
            String token = tokenService.generateTokenForOferente(oferente);
            return new LoginResponse(token, "OFERENTE", oferente.getId(),
                    oferente.getNombre() + " " + oferente.getPrimerApellido());
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
    }

    @Getter @Setter
    public static class LoginRequest {
        private String correo;
        private String clave;
    }

    @Getter
    public static class LoginResponse {
        private final String token;
        private final String rol;
        private final String id;
        private final String nombre;

        public LoginResponse(String token, String rol, String id, String nombre) {
            this.token = token;
            this.rol = rol;
            this.id = id;
            this.nombre = nombre;
        }
    }
}
