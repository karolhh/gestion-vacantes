package com.gestionvacantes.dto;

import com.gestionvacantes.entity.Vacante;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VacanteResponse {

    private Long id;
    private String titulo;
    private String descripcion;
    private String requisitos;
    private BigDecimal salario;
    private String ubicacion;
    private Vacante.Estado estado;
    private Long reclutadorId;
    private String reclutadorNombre;
    private LocalDateTime fechaPublicacion;
    private LocalDateTime fechaCierre;

    public VacanteResponse(Vacante vacante) {
        this.id = vacante.getId();
        this.titulo = vacante.getTitulo();
        this.descripcion = vacante.getDescripcion();
        this.requisitos = vacante.getRequisitos();
        this.salario = vacante.getSalario();
        this.ubicacion = vacante.getUbicacion();
        this.estado = vacante.getEstado();
        this.fechaPublicacion = vacante.getFechaPublicacion();
        this.fechaCierre = vacante.getFechaCierre();

        if (vacante.getReclutador() != null) {
            this.reclutadorId = vacante.getReclutador().getId();
            this.reclutadorNombre = vacante.getReclutador().getNombreCompleto();
        }
    }
}