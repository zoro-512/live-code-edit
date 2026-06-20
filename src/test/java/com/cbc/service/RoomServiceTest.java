package com.cbc.service;

import com.cbc.dto.room.CreateRoomRequest;
import com.cbc.dto.room.JoinRoomRequest;
import com.cbc.dto.room.RoomResponse;
import com.cbc.entity.Room;
import com.cbc.entity.User;
import com.cbc.repository.RoomRepo;
import com.cbc.repository.UserRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepo roomRepo;

    @Mock
    private UserRepo userRepo;

    @InjectMocks
    private RoomService roomService;

    private User testUser;
    private Room testRoom;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setEmail("user@test.com");
        testUser.setRooms(new ArrayList<>());

        testRoom = new Room();
        testRoom.setId(1L);
        testRoom.setName("Test Room");
        testRoom.setRoomCode("ABC123");
    }

    @Test
    void createNewRoom_WithValidUser_ReturnsRoomResponse() {

        when(userRepo.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));
        when(roomRepo.existsByRoomCode(anyString())).thenReturn(false);
        when(roomRepo.save(any(Room.class))).thenAnswer(inv -> {
            Room r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(userRepo.save(any(User.class))).thenReturn(testUser);


        RoomResponse response = roomService.createNewRoom("user@test.com", new CreateRoomRequest("My Room"));


        assertNotNull(response);
        assertEquals("My Room", response.roomName());
        assertNotNull(response.roomCode());
        assertEquals(6, response.roomCode().length());
    }

    @Test
    void joinRoom_WithValidCode_AddsUserToRoom() {

        when(userRepo.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));
        when(roomRepo.findByRoomCode("ABC123")).thenReturn(Optional.of(testRoom));
        when(userRepo.save(any(User.class))).thenReturn(testUser);


        RoomResponse response = roomService.joinRoom("user@test.com", new JoinRoomRequest("ABC123"));


        assertNotNull(response);
        assertEquals("ABC123", response.roomCode());
        assertTrue(testUser.getRooms().contains(testRoom));
    }

    @Test
    void joinRoom_AlreadyMember_DoesNotAddDuplicate() {

        testUser.getRooms().add(testRoom);
        when(userRepo.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));
        when(roomRepo.findByRoomCode("ABC123")).thenReturn(Optional.of(testRoom));
        when(userRepo.save(any(User.class))).thenReturn(testUser);


        roomService.joinRoom("user@test.com", new JoinRoomRequest("ABC123"));


        assertEquals(1, testUser.getRooms().size()); // Still only one instance
    }

    @Test
    void validateRoomMembership_WhenNotMember_ThrowsAccessDeniedException() {

        when(userRepo.isUserMemberOfRoom("stranger@test.com", 1L)).thenReturn(false);


        assertThrows(AccessDeniedException.class, () ->
            roomService.validateRoomMembership("stranger@test.com", 1L)
        );
    }

    @Test
    void validateRoomMembership_WhenMember_DoesNotThrow() {

        when(userRepo.isUserMemberOfRoom("user@test.com", 1L)).thenReturn(true);


        assertDoesNotThrow(() -> roomService.validateRoomMembership("user@test.com", 1L));
    }

    @Test
    void getMyRooms_ReturnsAllUserRooms() {

        testUser.getRooms().add(testRoom);
        when(userRepo.findByEmail("user@test.com")).thenReturn(Optional.of(testUser));


        List<RoomResponse> rooms = roomService.getMyRooms("user@test.com");


        assertEquals(1, rooms.size());
        assertEquals("ABC123", rooms.get(0).roomCode());
    }

    @Test
    void deleteRoom_ByOwner_DeletesSuccessfully() {

        testRoom.setCreatedBy(testUser);
        when(roomRepo.findById(1L)).thenReturn(Optional.of(testRoom));
        doNothing().when(roomRepo).deleteRoomAssociations(1L);
        doNothing().when(roomRepo).delete(testRoom);


        assertDoesNotThrow(() -> roomService.deleteRoom(1L, "user@test.com"));
        verify(roomRepo).deleteRoomAssociations(1L);
        verify(roomRepo).delete(testRoom);
    }

    @Test
    void deleteRoom_ByNonOwner_ThrowsRuntimeException() {

        User ownerUser = new User();
        ownerUser.setEmail("owner@test.com");
        testRoom.setCreatedBy(ownerUser);
        when(roomRepo.findById(1L)).thenReturn(Optional.of(testRoom));


        assertThrows(RuntimeException.class, () -> roomService.deleteRoom(1L, "hacker@test.com"));
        verify(roomRepo, never()).delete(any());
    }
}
