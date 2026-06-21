package com.cbc.service;

import com.cbc.dto.room.CreateRoomRequest;
import com.cbc.dto.room.JoinRoomRequest;
import com.cbc.dto.room.RoomResponse;
import com.cbc.entity.Room;
import com.cbc.entity.User;
import com.cbc.repository.RoomRepo;
import com.cbc.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepo roomRepo;
    private final UserRepo userRepo;

    @Transactional
    public RoomResponse createNewRoom(String email, CreateRoomRequest createRoomRequest) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Room room = new Room();
        room.setName(createRoomRequest.roomName());
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
        while (roomRepo.existsByRoomCode(roomCode));
        room.setRoomCode(roomCode);
        roomRepo.save(room);

        user.getRooms().add(room);
        userRepo.save(user);

        return new RoomResponse(room.getId(), room.getName(), roomCode);
    }

    @Transactional
    public RoomResponse joinRoom(String email, JoinRoomRequest joinRoomRequest) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Room room = roomRepo.findByRoomCode(joinRoomRequest.roomCode())
                .orElseThrow(() -> new RuntimeException("Room Not Found"));

        List<Room> userRooms = user.getRooms();
        if (!userRooms.contains(room)) {
            userRooms.add(room);
        }

        user.setRooms(userRooms);
        userRepo.save(user);

        return new RoomResponse(room.getId(), room.getName(), joinRoomRequest.roomCode());
    }


    public List<RoomResponse> getMyRooms(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.getRooms()
                .stream()
                .map(room -> new RoomResponse(room.getId(), room.getName(), room.getRoomCode()))
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

    public void validateRoomMembership(String email, Long roomId) {
        if (!userRepo.isUserMemberOfRoom(email, roomId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not authorized to access this room"
            );
        }
    }

    @Transactional
    public void saveCode(Long roomId, String code, String email) {
        validateRoomMembership(email, roomId);

        Room room = roomRepo.findById(roomId)
                .orElseThrow(() ->
                        new RuntimeException("Room not found"));

        room.setCurrentCode(code);

        roomRepo.save(room);
    }

    public String getCode(Long roomId, String email) {
        validateRoomMembership(email, roomId);

        Room room = roomRepo.findById(roomId)
                .orElseThrow(() ->
                        new RuntimeException("Room not found"));

        String code = room.getCurrentCode();
        return code != null ? code : "public class Main {\n    public static void main(String[] args) {\n  //Start Coding  \n    System.out.println(\"Hello, World!\");\n    }\n}";
    }


}



