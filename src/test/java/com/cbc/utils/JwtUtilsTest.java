package com.cbc.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() throws Exception {
        jwtUtils = new JwtUtils();
        

        Field secretKeyField = JwtUtils.class.getDeclaredField("SECRET_KEY");
        secretKeyField.setAccessible(true);
        secretKeyField.set(jwtUtils, "myVeryLongSecretKeyForJwtAuthenticationProject2026");


        Field expirationField = JwtUtils.class.getDeclaredField("expiration");
        expirationField.setAccessible(true);
        expirationField.set(jwtUtils, 86400000L); // 1 day
    }

    @Test
    void testTokenGenerationAndValidation() {
        String username = "testuser@domain.com";
        String token = jwtUtils.generateToken(username);

        assertNotNull(token);
        assertEquals(username, jwtUtils.extractUsername(token));
        assertTrue(jwtUtils.validateToken(token));
    }
}
