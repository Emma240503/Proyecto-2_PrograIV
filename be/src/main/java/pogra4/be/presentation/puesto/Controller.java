package pogra4.be.presentation.puesto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import pogra4.be.logic.Caracteristica;
import pogra4.be.logic.Puesto;
import pogra4.be.logic.Service;

import java.util.List;

@RestController
@RequestMapping("/api/puestos")
public class Controller {

    @Autowired
    private Service service;

    @GetMapping("/ultimos")
    public List<Puesto> getUltimos() {
        return service.getUltimosPuestosPublicos();
    }

    @GetMapping("/buscar")
    public List<Puesto> buscar(@RequestParam(required = false) List<String> caracteristicaIds) {
        if (caracteristicaIds == null || caracteristicaIds.isEmpty()) {
            return service.getUltimosPuestosPublicos();
        }
        return service.buscarPuestosPublicos(caracteristicaIds);
    }

    @GetMapping("/caracteristicas")
    public Iterable<Caracteristica> getRaices() {
        return service.getRaices();
    }

    @GetMapping("/caracteristicas/{padreId}/hijos")
    public Iterable<Caracteristica> getHijos(@PathVariable String padreId) {
        return service.getHijos(padreId);
    }

    @GetMapping("/todos")
    public List<Puesto> getTodos() {
        return service.getPuestosActivosTodos();
    }

    @GetMapping("/{id}")
    public Puesto getById(@PathVariable String id) {
        return service.findPuestoById(id);
    }
}
