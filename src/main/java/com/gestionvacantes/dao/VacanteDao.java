package com.gestionvacantes.dao;

import com.gestionvacantes.entity.Vacante;

import java.util.List;
import java.util.Optional;

public interface VacanteDao {

    Vacante save(Vacante vacante);

    Optional<Vacante> findById(Long id);

    List<Vacante> findAll();

    List<Vacante> findByReclutadorId(Long reclutadorId);

    List<Vacante> findByReclutadorIdAndEstado(Long reclutadorId, Vacante.Estado estado);

    List<Vacante> findByEstado(Vacante.Estado estado);

    List<Vacante> buscarPorTitulo(String titulo);

    List<Vacante> buscarPorUbicacion(String ubicacion);

    List<Vacante> buscarPorTituloYUbicacion(String titulo, String ubicacion);

    void deleteById(Long id);
}