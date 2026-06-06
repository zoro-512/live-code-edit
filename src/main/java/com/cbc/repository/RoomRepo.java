package com.cbc.repository;

import com.cbc.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomRepo extends JpaRepository<Room, Long> {

    Optional<Room> findByRoomCode(String roomCode);

}