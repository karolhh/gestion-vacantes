package com.gestionvacantes.dto;

import com.gestionvacantes.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {

    private Long id;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private String direccion;
    private String departamento;
    private Usuario.Rol rol;
    private Boolean activo;
    private LocalDateTime fechaRegistro;

    public UsuarioResponse(Usuario usuario) {
        this.id = usuario.getId();
        this.nombreCompleto = usuario.getNombreCompleto();
        this.email = usuario.getEmail();
        this.telefono = usuario.getTelefono();
        this.direccion = usuario.getDireccion();
        this.departamento = usuario.getDepartamento();
        this.rol = usuario.getRol();
        this.activo = usuario.getActivo();
        this.fechaRegistro = usuario.getFechaRegistro();
    }
}