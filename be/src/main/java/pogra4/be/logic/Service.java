package pogra4.be.logic;

import pogra4.be.data.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import pogra4.be.data.OferenteHasCaracteristicaRepository;

import java.util.ArrayList;
import java.util.UUID;
import java.time.Instant;


@org.springframework.stereotype.Service

public class Service {
    @Autowired
    private PuestoHasCaracteristicaRepository puestoHasCaracteristicaRepo;
    @Autowired
    private OferenteHasCaracteristicaRepository ohcRepo;
    @Autowired
    private EmpresasRepository empresas;
    @Autowired
    private AdminRepository admins;
    @Autowired
    private PuestoRepository puestos;
    @Autowired
    private CaracteristicaRepository carecteristica;
    @Autowired
    private OferenteRepository oferentes;
    public Iterable<Empresa> empresasAll() {
        return empresas.findAll();
    }
    public Iterable<Admin> adminsAll() { return admins.findAll();}
    public Iterable<Puesto> puestosAll() { return puestos.findAll();}
    public Iterable<Caracteristica> carecteristicasAll() { return carecteristica.findAll();}
    public Iterable<Oferente> oferentesAll() { return oferentes.findAll();}

    public void empresasAdd(Empresa empresa) {
        if(empresas.existsById(empresa.getId())) {
            throw new IllegalArgumentException("La empresa ya existe");
        }
        empresas.save(empresa);
    }
    public Empresa findEmpresaByCorreo(String correo) {
        return empresas.findByCorreo(correo);
    }
    public void adminsAdd(Admin admin) {
        if(admins.existsById(admin.getId())) {
            throw new IllegalArgumentException("El admin ya existe");
        }
        admins.save(admin);
    }
    public Admin findAdminById(String id) {
        return admins.findById(id).orElse(null);
    }
    public void puestosAdd(Puesto puesto) {
        if(puestos.existsById(puesto.getId())) {
            throw new IllegalArgumentException("El puesto ya existe");
        }
        puestos.save(puesto);
    }
    public void carecteristicasAdd(Caracteristica caracteristica) {
        if(carecteristica.existsById(caracteristica.getCaracteristicaId())) {
            throw new IllegalArgumentException("La caracteristica ya existe");
        }
        carecteristica.save(caracteristica);
    }
    public void oferentesAdd(Oferente oferente) {
        if(oferentes.existsById(oferente.getId())) {
            throw new IllegalArgumentException("El oferente ya existe");
        }
        oferentes.save(oferente);
    }
    public Oferente findOferenteByCorreo(String correo) {
        return oferentes.findByCorreo(correo);
    }

    public List<Puesto> getUltimosPuestosPublicos() {
        return puestos.findTop5ByTipoAndActivoOrderByFechaRegistroDesc("publico", (byte) 1);
    }
    //

    //

    public Iterable<Empresa> empresasPendientes() {
        return empresas.findByEstado("pendiente");
    }
    public void aprobarEmpresa(String id) {
        Empresa e = empresas.findById(id).orElseThrow();
        e.setEstado("aprobada");
        empresas.save(e);
    }
    public Iterable<Oferente> oferentesPendientes() {
        return oferentes.findByEstado("pendiente");
    }
    public void aprobarOferente(String id) {
        Oferente o = oferentes.findById(id).orElseThrow();
        o.setEstado("aprobado");
        oferentes.save(o);
    }

    public Iterable<Puesto> puestosPorEmpresa(String empresaId) {
        return puestos.findByEmpresa_Id(empresaId);
    }

    public void crearPuesto(String empresaId, String descripcion, String salario, String tipo,
                            List<String> caracteristicaIds, List<Integer> niveles) {
        Empresa empresa = empresas.findById(empresaId).orElseThrow();
        Puesto p = new Puesto();
        p.setId(UUID.randomUUID().toString());
        p.setDescripcion(descripcion);
        p.setSalario(salario);
        p.setTipo(tipo);
        p.setActivo((byte) 1);
        p.setFechaRegistro(Instant.now());
        p.setEmpresa(empresa);
        puestos.save(p);

        if (caracteristicaIds != null) {
            for (int i = 0; i < caracteristicaIds.size(); i++) {
                String cid = caracteristicaIds.get(i);
                if (cid == null || cid.isEmpty()) continue;
                Caracteristica c = carecteristica.findById(cid).orElse(null);
                if (c == null) continue;
                if (c == null) continue;
                PuestoHasCaracteristica phc = new PuestoHasCaracteristica();
                PuestoHasCaracteristicaId phcId = new PuestoHasCaracteristicaId();
                phcId.setPuestoId(p.getId());
                phcId.setCaracteristicaCaracteristicaId(c.getCaracteristicaId());
                phc.setId(phcId);
                phc.setPuesto(p);
                phc.setCaracteristicaCaracteristica(c);
                phc.setNivel(niveles != null && i < niveles.size() ? niveles.get(i) : 1);
                puestoHasCaracteristicaRepo.save(phc);
            }
        }
    }

    public void desactivarPuesto(String id) {
        Puesto p = puestos.findById(id).orElseThrow();
        p.setActivo((byte) 0);
        puestos.save(p);
    }

    public Puesto findPuestoById(String id) {
        return puestos.findById(id).orElse(null);
    }

    public Oferente findOferenteById(String id) {
        return oferentes.findById(id).orElse(null);
    }

    public Iterable<OferenteHasCaracteristica> habilidadesDeOferente(String oferenteId) {
        return ohcRepo.findByOferente_Id(oferenteId);
    }

    public List<CandidatoDTO> buscarCandidatos(String puestoId) {
        Puesto puesto = puestos.findById(puestoId).orElseThrow();
        List<PuestoHasCaracteristica> requisitos = puesto.getCaracteristicas();
        Iterable<Oferente> todosOferentes = oferentes.findByEstado("aprobado");

        List<CandidatoDTO> resultado = new ArrayList<>();
        for (Oferente o : todosOferentes) {
            List<OferenteHasCaracteristica> habilidades = (List<OferenteHasCaracteristica>)ohcRepo.findByOferente_Id(o.getId());
            int cumplidos = 0;
            for (PuestoHasCaracteristica req : requisitos) {
                for (OferenteHasCaracteristica hab : habilidades) {
                    if (hab.getCaracteristicaCaracteristica().getCaracteristicaId()
                            .equals(req.getCaracteristicaCaracteristica().getCaracteristicaId())
                            && hab.getNivel() >= req.getNivel()) {
                        cumplidos++;
                        break;
                    }
                }
            }
            if (requisitos.isEmpty()) {
                resultado.add(new CandidatoDTO(o, 0, 0, 100.0));
            } else {
                double porcentaje = (cumplidos * 100.0) / requisitos.size();
                resultado.add(new CandidatoDTO(o, cumplidos, requisitos.size(), porcentaje));
            }
        }
        return resultado;
    }

    //Oferente

    public void agregarHabilidad(String oferenteId, String caracteristicaId, int nivel) {
        Oferente o = oferentes.findById(oferenteId).orElseThrow();
        Caracteristica c = carecteristica.findById(caracteristicaId).orElseThrow();
        OferenteHasCaracteristica ohc = new OferenteHasCaracteristica();
        ohc.setId(UUID.randomUUID().toString());
        ohc.setOferente(o);
        ohc.setCaracteristicaCaracteristica(c);
        ohc.setNivel(nivel);
        ohcRepo.save(ohc);
    }

    public void eliminarHabilidad(String id) {
        ohcRepo.deleteById(id);
    }

    //Caracteristica

    public Iterable<Caracteristica> getRaices() {
        return carecteristica.findByPadreIsNull();
    }
    public Iterable<Caracteristica> getHijos(String padreId) {
        return carecteristica.findByPadre_CaracteristicaId(padreId);
    }
    public Caracteristica findCaracteristicaById(String id) {
        return carecteristica.findById(id).orElse(null);
    }
    public void crearCaracteristica(String nombre, String padreId) {
        Caracteristica c = new Caracteristica();
        c.setCaracteristicaId(UUID.randomUUID().toString());
        c.setNombre(nombre);
        if (padreId != null && !padreId.isEmpty()) {
            c.setPadre(carecteristica.findById(padreId).orElse(null));
        }
        carecteristica.save(c);
    }

    public void actualizarCurriculumOferente(String oferenteId, String curriculumPath) {
        Oferente o = oferentes.findById(oferenteId).orElse(null);
        if (o != null) {
            o.setCurriculum(curriculumPath);
            oferentes.save(o);
        }
    }
    //
    //Puesto
    public List<Puesto> buscarPuestosPublicos(List<String> caracteristicaIds) {
        Iterable<Puesto> todos = puestos.findAll();
        List<Puesto> resultado = new ArrayList<>();
        for (Puesto p : todos) {
            if (!"publico".equals(p.getTipo()) || p.getActivo() != 1) continue;
            for (PuestoHasCaracteristica phc : p.getCaracteristicas()) {
                if (caracteristicaIds.contains(phc.getCaracteristicaCaracteristica().getCaracteristicaId())) {
                    resultado.add(p);
                    break;
                }
            }
        }
        return resultado;
    }
}
