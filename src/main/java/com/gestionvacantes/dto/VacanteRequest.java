package com.gestionvacantes.dto;

import com.gestionvacantes.entity.Vacante;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VacanteRequest {

    @NotBlank(message = "El título es obligatorio")
    @Size(max = 200, message = "El título no puede superar 200 caracteres")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    private String requisitos;

    @DecimalMin(value = "0.0", inclusive = false, message = "El salario debe ser mayor a 0")
    @Digits(integer = 10, fraction = 2, message = "El salario debe tener máximo 10 dígitos enteros y 2 decimales")
    private BigDecimal salario;

    @NotBlank(message = "La ubicación es obligatoria")
    @Size(max = 150, message = "La ubicación no puede superar 150 caracteres")
    private String ubicacion;

    @NotNull(message = "El estado es obligatorio")
    private Vacante.Estado estado;

    @NotNull(message = "El ID del reclutador es obligatorio")
    private Long reclutadorId;
}