package com.gestionvacantes.repository;

import com.gestionvacantes.entity.Vacante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VacanteRepository extends JpaRepository<Vacante, Long> {

    List<Vacante> findByReclutadorId(Long reclutadorId);

    List<Vacante> findByReclutadorIdAndEstado(Long reclutadorId, Vacante.Estado estado);

    List<Vacante> findByEstado(Vacante.Estado estado);

    List<Vacante> findByTituloContainingIgnoreCase(String titulo);

    List<Vacante> findByUbicacionContainingIgnoreCase(String ubicacion);

    List<Vacante> findByTituloContainingIgnoreCaseAndUbicacionContainingIgnoreCase(String titulo, String ubicacion);
}