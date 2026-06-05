package pogra4.be.security;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@AllArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Collections.singletonList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        config.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── Recursos estáticos y públicos ──────────────────────────────
                        .requestMatchers(
                                "/", "/index.html", "/assets/**",
                                "/*.js", "/*.css", "/*.svg", "/*.png", "/*.ico"
                        ).permitAll()

                        // ── Auth ───────────────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                        // ── Registro público ───────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/empresas/registro").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/oferentes/registro").permitAll()

                        // ── Puestos públicos ───────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/puestos/ultimos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/puestos/buscar").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/puestos/caracteristicas").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/puestos/caracteristicas/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/puestos/**").permitAll()

                        // ── Puestos privados (solo OFERENTE ve todos) ──────────────────
                        .requestMatchers(HttpMethod.GET, "/api/puestos/todos").hasRole("OFERENTE")

                        // ── Oferente: rutas compartidas con otros roles (más específicas primero) ──
                        .requestMatchers(HttpMethod.GET,  "/api/oferente/curriculum/**")
                        .hasAnyRole("EMPRESA", "OFERENTE", "ADMIN")
                        .requestMatchers(HttpMethod.GET,  "/api/oferente/perfil/**")
                        .hasAnyRole("EMPRESA", "OFERENTE", "ADMIN")

                        // Empresa/Admin ven habilidades de un oferente específico (con ID en la ruta)
                        .requestMatchers(HttpMethod.GET,    "/api/oferente/habilidades/**")
                        .hasAnyRole("EMPRESA", "OFERENTE", "ADMIN")

                        // El oferente gestiona sus propias habilidades y perfil
                        .requestMatchers(HttpMethod.GET,    "/api/oferente/habilidades")
                        .hasRole("OFERENTE")
                        .requestMatchers(HttpMethod.POST,   "/api/oferente/habilidades")
                        .hasRole("OFERENTE")
                        .requestMatchers(HttpMethod.DELETE, "/api/oferente/habilidades/**")
                        .hasRole("OFERENTE")
                        .requestMatchers(HttpMethod.POST,   "/api/oferente/curriculum")
                        .hasRole("OFERENTE")

                        // Resto de rutas de oferente requieren rol OFERENTE
                        .requestMatchers("/api/oferente/**").hasRole("OFERENTE")

                        // ── Empresa ────────────────────────────────────────────────────
                        .requestMatchers("/api/empresa/**").hasRole("EMPRESA")

                        // ── Admin ──────────────────────────────────────────────────────
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ── Cualquier otra ruta requiere autenticación ─────────────────
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}