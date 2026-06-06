package com.cbc.service;

import com.cbc.dto.CreateRoomRequest;
import com.cbc.dto.RoomResponse;
import com.cbc.entity.Room;
import com.cbc.repository.RoomRepo;
import com.cbc.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RoomService {

    @Autowired
    private RoomRepo roomRepo;
    @Autowired
    private UserRepo userRepo;

    public RoomResponse createNewRoom(String email,CreateRoomRequest createRoomRequest){
        Room room=new Room();
        room.setName(createRoomRequest.getRoomName());
        room.setCreatedAt(LocalDateTime.now());
        room.setCreatedBy(userRepo.findByEmail(email).get());
        String roomCode;

        do {
            roomCode = UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 6)
                    .toUpperCase();
        }
        while(roomRepo.existsByRoomCode(roomCode));
        room.setRoomCode(roomCode);
            roomRepo.save(room);


        RoomResponse roomResponse=new RoomResponse();
        roomResponse.setRoomName(room.getName());
        roomResponse.setRoomCode(roomCode);
        roomResponse.setId(room.getId());
        return roomResponse;

    }
}
