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
import java.util.List;
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
                        .requestMatchers("/", "/index.html", "/assets/**", "/*.js", "/*.css", "/*.svg", "/*.png", "/*.ico").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/empresas/registro").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/oferentes/registro").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/puestos/ultimos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/puestos/buscar").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/puestos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/caracteristicas/**").permitAll()
                        .requestMatchers("/api/empresa/**").hasRole("EMPRESA")
                        .requestMatchers(HttpMethod.GET, "/api/oferente/curriculum/**").hasAnyRole("EMPRESA", "OFERENTE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/oferente/perfil/**").hasAnyRole("EMPRESA", "OFERENTE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/oferente/habilidades/**").hasAnyRole("EMPRESA", "ADMIN")
                        .requestMatchers("/api/oferente/**").hasRole("OFERENTE")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
