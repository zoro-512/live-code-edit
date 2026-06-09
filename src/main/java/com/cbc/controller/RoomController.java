package com.cbc.controller;

import com.cbc.dto.room.CreateRoomRequest;
import com.cbc.dto.room.JoinRoomRequest;
import com.cbc.dto.room.RoomResponse;
import com.cbc.dto.code.SaveCodeRequest;
import com.cbc.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(Authentication authentication,@RequestBody JoinRoomRequest joinRoomRequest){
        return ResponseEntity.ok(
                roomService.joinRoom(authentication.getName(),joinRoomRequest)
        );
    }

    @GetMapping("/myRooms")
    public ResponseEntity<List<RoomResponse>> getRoom(Authentication authentication) {

        return ResponseEntity.ok(
                roomService.getMyRooms(authentication.getName())
        );
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<String> deleteRoom(
            @PathVariable Long roomId,
            Authentication authentication) {

        roomService.deleteRoom(
                roomId,
                authentication.getName()
        );

        return ResponseEntity.ok("Room deleted successfully");
    }

    @GetMapping("/{roomId}/code")
    public ResponseEntity<String> getRoomCode(@PathVariable Long roomId) {
        return ResponseEntity.ok(
                roomService.getCode(roomId)
        );
    }
    @PostMapping("/{roomId}/save")
    public ResponseEntity<String> saveRoomCode(@PathVariable Long roomId, @RequestBody SaveCodeRequest request) {
        roomService.saveCode(roomId, request.getCode());
        return ResponseEntity.ok("Code saved successfully");
    }

}
