package com.gestionvacantes.service;

import com.gestionvacantes.dao.UsuarioDao;
import com.gestionvacantes.dao.VacanteDao;
import com.gestionvacantes.dto.VacanteRequest;
import com.gestionvacantes.dto.VacanteResponse;
import com.gestionvacantes.entity.Usuario;
import com.gestionvacantes.entity.Vacante;
import com.gestionvacantes.exception.OperacionNoPermitidaException;
import com.gestionvacantes.exception.RecursoNoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VacanteService {

    private final VacanteDao vacanteDao;
    private final UsuarioDao usuarioDao;

    public VacanteService(VacanteDao vacanteDao, UsuarioDao usuarioDao) {
        this.vacanteDao = vacanteDao;
        this.usuarioDao = usuarioDao;
    }

    // =====================================================
    // LISTAR TODAS
    // =====================================================
    @Transactional(readOnly = true)
    public List<VacanteResponse> listarTodas() {
        return vacanteDao.findAll().stream()
                .map(VacanteResponse::new)
                .toList();
    }

    // =====================================================
    // LISTAR POR RECLUTADOR
    // =====================================================
    @Transactional(readOnly = true)
    public List<VacanteResponse> listarPorReclutador(Long reclutadorId) {
        return vacanteDao.findByReclutadorId(reclutadorId).stream()
                .map(VacanteResponse::new)
                .toList();
    }

    // =====================================================
    // LISTAR POR RECLUTADOR Y ESTADO
    // =====================================================
    @Transactional(readOnly = true)
    public List<VacanteResponse> listarPorReclutadorYEstado(Long reclutadorId, Vacante.Estado estado) {
        return vacanteDao.findByReclutadorIdAndEstado(reclutadorId, estado).stream()
                .map(VacanteResponse::new)
                .toList();
    }

    // =====================================================
    // LISTAR POR ESTADO (para postulantes y visitantes)
    // =====================================================
    @Transactional(readOnly = true)
    public List<VacanteResponse> listarPorEstado(Vacante.Estado estado) {
        return vacanteDao.findByEstado(estado).stream()
                .map(VacanteResponse::new)
                .toList();
    }

    // =====================================================
    // BUSCAR POR ID
    // =====================================================
    @Transactional(readOnly = true)
    public VacanteResponse buscarPorId(Long id) {
        Vacante vacante = vacanteDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Vacante no encontrada con id: " + id));
        return new VacanteResponse(vacante);
    }

    // =====================================================
    // BUSCAR POR TÍTULO
    // =====================================================
    @Transactional(readOnly = true)
    public List<VacanteResponse> buscarPorTitulo(String titulo) {
        return vacanteDao.buscarPorTitulo(titulo).stream()
                .map(VacanteResponse::new)
                .toList();
    }

    // =====================================================
    // BUSCAR POR UBICACIÓN
    // =====================================================
    @Transactional(readOnly = true)
    public List<VacanteResponse> buscarPorUbicacion(String ubicacion) {
        return vacanteDao.buscarPorUbicacion(ubicacion).stream()
                .map(VacanteResponse::new)
                .toList();
    }

    // =====================================================
    // BUSCAR POR TÍTULO Y UBICACIÓN
    // =====================================================
    @Transactional(readOnly = true)
    public List<VacanteResponse> buscarPorTituloYUbicacion(String titulo, String ubicacion) {
        return vacanteDao.buscarPorTituloYUbicacion(titulo, ubicacion).stream()
                .map(VacanteResponse::new)
                .toList();
    }

    // =====================================================
    // CREAR VACANTE
    // =====================================================
    @Transactional
    public VacanteResponse crear(VacanteRequest request) {

        Usuario reclutador = usuarioDao.findById(request.getReclutadorId())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Reclutador no encontrado con id: " + request.getReclutadorId()));

        if (reclutador.getRol() != Usuario.Rol.RECLUTADOR) {
            throw new OperacionNoPermitidaException("El usuario indicado no tiene rol RECLUTADOR");
        }

        if (!Boolean.TRUE.equals(reclutador.getActivo())) {
            throw new OperacionNoPermitidaException("El reclutador está deshabilitado");
        }

        Vacante vacante = new Vacante();
        vacante.setTitulo(request.getTitulo());
        vacante.setDescripcion(request.getDescripcion());
        vacante.setRequisitos(request.getRequisitos());
        vacante.setSalario(request.getSalario());
        vacante.setUbicacion(request.getUbicacion());
        vacante.setEstado(Vacante.Estado.ABIERTA);
        vacante.setReclutador(reclutador);

        Vacante guardada = vacanteDao.save(vacante);
        return new VacanteResponse(guardada);
    }

    // =====================================================
    // ACTUALIZAR VACANTE
    // =====================================================
    @Transactional
    public VacanteResponse actualizar(Long id, VacanteRequest request) {

        Vacante vacante = vacanteDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Vacante no encontrada con id: " + id));

        if (vacante.getEstado() == Vacante.Estado.CERRADA) {
            throw new OperacionNoPermitidaException("No se puede editar una vacante CERRADA");
        }

        vacante.setTitulo(request.getTitulo());
        vacante.setDescripcion(request.getDescripcion());
        vacante.setRequisitos(request.getRequisitos());
        vacante.setSalario(request.getSalario());
        vacante.setUbicacion(request.getUbicacion());

        if (request.getEstado() != null) {
            vacante.setEstado(request.getEstado());
        }

        Vacante actualizada = vacanteDao.save(vacante);
        return new VacanteResponse(actualizada);
    }

    // =====================================================
    // CERRAR VACANTE
    // =====================================================
    @Transactional
    public VacanteResponse cerrar(Long id) {

        Vacante vacante = vacanteDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Vacante no encontrada con id: " + id));

        if (vacante.getEstado() == Vacante.Estado.CERRADA) {
            throw new OperacionNoPermitidaException("La vacante ya está cerrada");
        }

        vacante.setEstado(Vacante.Estado.CERRADA);
        vacante.setFechaCierre(LocalDateTime.now());

        Vacante cerrada = vacanteDao.save(vacante);
        return new VacanteResponse(cerrada);
    }

    // =====================================================
    // ELIMINAR VACANTE
    // =====================================================
    @Transactional
    public void eliminar(Long id) {

        Vacante vacante = vacanteDao.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Vacante no encontrada con id: " + id));

        vacanteDao.deleteById(id);
    }
}