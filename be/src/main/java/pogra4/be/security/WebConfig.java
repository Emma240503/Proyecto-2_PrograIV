package pogra4.be.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir archivos estáticos desde la carpeta static
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirigir rutas del frontend a index.html para que React Router las maneje
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/dashboard/**").setViewName("forward:/index.html");
        registry.addViewController("/buscar").setViewName("forward:/index.html");
        registry.addViewController("/puestos").setViewName("forward:/index.html");
        registry.addViewController("/registro/**").setViewName("forward:/index.html");
    }
}

