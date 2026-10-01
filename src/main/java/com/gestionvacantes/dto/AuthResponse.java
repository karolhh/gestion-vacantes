package com.gestionvacantes.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String tokenType;
    private String email;
    private String rol;
    private Long expiraEn;

    public AuthResponse(String token, String email, String rol, Long expiraEn) {
        this.token = token;
        this.tokenType = "Bearer";
        this.email = email;
        this.rol = rol;
        this.expiraEn = expiraEn;
    }
}