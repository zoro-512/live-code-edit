package com.cbc.controller;

import com.cbc.dto.CreateRoomRequest;
import com.cbc.dto.RoomResponse;
import com.cbc.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/room")
public class RoomController {
    @Autowired
    private RoomService roomService;

    @Valid
    @PostMapping("/create")
    public ResponseEntity<RoomResponse> createRoom(Authentication authentication, @RequestBody CreateRoomRequest createRoomRequest){
        return ResponseEntity.ok(
                roomService.createNewRoom(authentication.getName(),createRoomRequest)
        );
    }

}
