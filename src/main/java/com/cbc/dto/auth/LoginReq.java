package com.cbc.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginReq {

    private String email;
    private String password;
}
