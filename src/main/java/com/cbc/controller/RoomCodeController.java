package com.cbc.controller;

import com.cbc.dto.code.CodeUpdateReq;
import com.cbc.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomCodeController {
    @Autowired
    private final RoomService roomService;

    @PutMapping("/{roomId}/code")
    public ResponseEntity<Void> saveCode(
            @PathVariable Long roomId,
            @RequestBody CodeUpdateReq req,
            Authentication authentication) {

        roomService.saveCode(roomId, req.code(), authentication.getName());

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomId}/code")
    public ResponseEntity<CodeUpdateReq> getCode(
            @PathVariable Long roomId,
            Authentication authentication) {

        String code = roomService.getCode(roomId, authentication.getName());

        return ResponseEntity.ok(new CodeUpdateReq(code));
    }


}
