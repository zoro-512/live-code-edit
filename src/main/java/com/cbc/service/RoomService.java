package com.cbc.service;

import com.cbc.dto.CreateRoomRequest;
import com.cbc.dto.JoinRoomRequest;
import com.cbc.dto.RoomResponse;
import com.cbc.entity.Room;
import com.cbc.entity.User;
import com.cbc.repository.RoomRepo;
import com.cbc.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class RoomService {

    @Autowired
    private RoomRepo roomRepo;
    @Autowired
    private UserRepo userRepo;

    @Transactional
    public RoomResponse createNewRoom(String email,CreateRoomRequest createRoomRequest){
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Room room=new Room();
        room.setName(createRoomRequest.getRoomName());
        room.setCreatedAt(LocalDateTime.now());
        room.setCreatedBy(user);
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

        user.getRooms().add(room);
        userRepo.save(user);

        RoomResponse roomResponse=new RoomResponse();
        roomResponse.setRoomName(room.getName());
        roomResponse.setRoomCode(roomCode);
        roomResponse.setId(room.getId());
        return roomResponse;

    }

    @Transactional
    public RoomResponse joinRoom(String email,JoinRoomRequest joinRoomRequest) {
        User u = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Room room =roomRepo.findByRoomCode(joinRoomRequest.getRoomCode())
                .orElseThrow( () -> new RuntimeException("Room Not Found"));

        List<Room> nl=u.getRooms();
        if (!nl.contains(room)) {
            nl.add(room);
        }

        u.setRooms(nl);
        userRepo.save(u);

        RoomResponse roomResponse=new RoomResponse();
        roomResponse.setRoomName(room.getName());
        roomResponse.setRoomCode(joinRoomRequest.getRoomCode());
        roomResponse.setId(room.getId());
        return roomResponse;
    }


    public List<RoomResponse> getMyRooms(String email) {
        User u = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return u.getRooms()
                .stream()
                .map(room -> {
                    RoomResponse response = new RoomResponse();
                    response.setId(room.getId());
                    response.setRoomName(room.getName());
                    response.setRoomCode(room.getRoomCode());
                    return response;
                })
                .toList();
    }


    @Transactional
    public void deleteRoom(Long roomId, String email) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() ->
                        new RuntimeException("Room not found"));

        if (!room.getCreatedBy().getEmail().equals(email)) {
            throw new RuntimeException(
                    "You are not authorized to delete this room"
            );
        }

        roomRepo.deleteRoomAssociations(roomId);
        roomRepo.delete(room);

    }

    @Transactional
    public void saveCode(Long roomId, String code) {

        Room room = roomRepo.findById(roomId)
                .orElseThrow(() ->
                        new RuntimeException("Room not found"));

        room.setCurrentCode(code);

        roomRepo.save(room);
    }

    public String getCode(Long roomId) {

        Room room = roomRepo.findById(roomId)
                .orElseThrow(() ->
                        new RuntimeException("Room not found"));

        String code = room.getCurrentCode();
        return code != null ? code : "// Welcome to the collaborative workspace!\n// Start coding here...";
    }


}
