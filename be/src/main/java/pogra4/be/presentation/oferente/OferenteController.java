package pogra4.be.presentation.oferente;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import pogra4.be.logic.Oferente;
import pogra4.be.logic.OferenteHasCaracteristica;
import pogra4.be.logic.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
public class OferenteController {

    @Autowired
    private Service service;

    private static final String UPLOAD_DIR = "uploads/cv/";

    @PostMapping("/api/oferentes/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public void registro(@RequestBody RegistroRequest req) {
        Oferente o = new Oferente();
        o.setId(UUID.randomUUID().toString());
        o.setNombre(req.getNombre());
        o.setPrimerApellido(req.getPrimerApellido());
        o.setCorreo(req.getCorreo());
        o.setContrasenna(req.getContrasenna());
        o.setNacionalidad(req.getNacionalidad());
        o.setTelefono(req.getTelefono());
        o.setUbicacion(req.getUbicacion());
        o.setEstado("pendiente");
        service.oferentesAdd(o);
    }

    @GetMapping("/api/oferente/perfil")
    public Oferente perfil(Authentication auth) {
        Oferente o = service.findOferenteById(auth.getName());
        if (o == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return o;
    }

    @GetMapping("/api/oferente/habilidades")
    public Iterable<OferenteHasCaracteristica> habilidades(Authentication auth) {
        return service.habilidadesDeOferente(auth.getName());
    }

    @GetMapping("/api/oferente/perfil/{oferenteId}")
    public Oferente perfilById(@PathVariable String oferenteId) {
        Oferente o = service.findOferenteById(oferenteId);
        if (o == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return o;
    }

    @GetMapping("/api/oferente/habilidades/{oferenteId}")
    public Iterable<OferenteHasCaracteristica> habilidadesById(@PathVariable String oferenteId) {
        return service.habilidadesDeOferente(oferenteId);
    }

    @PostMapping("/api/oferente/habilidades")
    @ResponseStatus(HttpStatus.CREATED)
    public void agregarHabilidad(@RequestBody HabilidadRequest req, Authentication auth) {
        service.agregarHabilidad(auth.getName(), req.getCaracteristicaId(), req.getNivel());
    }

    @DeleteMapping("/api/oferente/habilidades/{id}")
    public void eliminarHabilidad(@PathVariable String id) {
        service.eliminarHabilidad(id);
    }

    @PostMapping("/api/oferente/curriculum")
    public void subirCv(@RequestParam("file") MultipartFile file,
                        Authentication auth) throws IOException {
        if (file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo vacío");
        Path dir = Paths.get(UPLOAD_DIR);
        Files.createDirectories(dir);
        String filename = auth.getName() + "_" + UUID.randomUUID() + ".pdf";
        Path dest = dir.resolve(filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        service.actualizarCurriculumOferente(auth.getName(), filename);
    }

    @GetMapping("/api/oferente/curriculum/{oferenteId}")
    public ResponseEntity<Resource> verCv(@PathVariable String oferenteId) throws IOException {
        Oferente o = service.findOferenteById(oferenteId);
        if (o == null || o.getCurriculum() == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        Path path = Paths.get(UPLOAD_DIR).resolve(o.getCurriculum());
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @Getter @Setter
    public static class RegistroRequest {
        private String nombre;
        private String primerApellido;
        private String correo;
        private String contrasenna;
        private String nacionalidad;
        private Integer telefono;
        private String ubicacion;
    }

    @Getter @Setter
    public static class HabilidadRequest {
        private String caracteristicaId;
        private int nivel;
    }
}
