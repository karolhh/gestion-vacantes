package com.gestionvacantes.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostulacionRequest {

    @NotNull(message = "El ID de la vacante es obligatorio")
    private Long vacanteId;

    @NotNull(message = "El ID del postulante es obligatorio")
    private Long postulanteId;
}