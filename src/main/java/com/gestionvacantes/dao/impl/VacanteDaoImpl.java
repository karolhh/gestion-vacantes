package com.gestionvacantes.dao.impl;

import com.gestionvacantes.dao.VacanteDao;
import com.gestionvacantes.entity.Vacante;
import com.gestionvacantes.repository.VacanteRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class VacanteDaoImpl implements VacanteDao {

    private final VacanteRepository vacanteRepository;

    public VacanteDaoImpl(VacanteRepository vacanteRepository) {
        this.vacanteRepository = vacanteRepository;
    }

    @Override
    public Vacante save(Vacante vacante) {
        return vacanteRepository.save(vacante);
    }

    @Override
    public Optional<Vacante> findById(Long id) {
        return vacanteRepository.findById(id);
    }

    @Override
    public List<Vacante> findAll() {
        return vacanteRepository.findAll();
    }

    @Override
    public List<Vacante> findByReclutadorId(Long reclutadorId) {
        return vacanteRepository.findByReclutadorId(reclutadorId);
    }

    @Override
    public List<Vacante> findByReclutadorIdAndEstado(Long reclutadorId, Vacante.Estado estado) {
        return vacanteRepository.findByReclutadorIdAndEstado(reclutadorId, estado);
    }

    @Override
    public List<Vacante> findByEstado(Vacante.Estado estado) {
        return vacanteRepository.findByEstado(estado);
    }

    @Override
    public List<Vacante> buscarPorTitulo(String titulo) {
        return vacanteRepository.findByTituloContainingIgnoreCase(titulo);
    }

    @Override
    public List<Vacante> buscarPorUbicacion(String ubicacion) {
        return vacanteRepository.findByUbicacionContainingIgnoreCase(ubicacion);
    }

    @Override
    public List<Vacante> buscarPorTituloYUbicacion(String titulo, String ubicacion) {
        return vacanteRepository.findByTituloContainingIgnoreCaseAndUbicacionContainingIgnoreCase(titulo, ubicacion);
    }

    @Override
    public void deleteById(Long id) {
        vacanteRepository.deleteById(id);
    }
}