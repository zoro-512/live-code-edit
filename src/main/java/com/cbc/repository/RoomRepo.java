package com.cbc.repository;

import com.cbc.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepo extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomCode(String roomCode);
    boolean existsByRoomCode(String roomCode);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "DELETE FROM user_joined_rooms WHERE room_id = :roomId", nativeQuery = true)
    void deleteRoomAssociations(@org.springframework.data.repository.query.Param("roomId") Long roomId);
}