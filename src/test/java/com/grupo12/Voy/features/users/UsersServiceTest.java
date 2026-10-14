package com.grupo12.Voy.features.users;

import com.grupo12.Voy.common.exceptions.EntityDuplicatedException;
import com.grupo12.Voy.common.exceptions.EntityNotFoundException;
import com.grupo12.Voy.common.exceptions.NotAllowedException;
import com.grupo12.Voy.common.security.enums.Roles;
import com.grupo12.Voy.common.security.models.CredentialsEntity;
import com.grupo12.Voy.common.security.models.RoleEntity;
import com.grupo12.Voy.common.security.repository.CredentialsRepository;
import com.grupo12.Voy.common.security.repository.RoleRepository;
import com.grupo12.Voy.features.parties.Dto.PartyUsersDto;
import com.grupo12.Voy.features.parties.mapper.PartyMapper;
import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.parties.repository.PartyRepository;
import com.grupo12.Voy.features.receipts.ReceiptMapper;
import com.grupo12.Voy.features.tickets.TicketMapper;
import com.grupo12.Voy.features.users.Dto.UserDto;
import com.grupo12.Voy.features.users.Dto.UserFollowDto;
import com.grupo12.Voy.features.users.Dto.UserUpdateDto;
import com.grupo12.Voy.features.users.Mapper.NewUserDtoMapper;
import com.grupo12.Voy.features.users.Mapper.UserFollowMapper;
import com.grupo12.Voy.features.users.Mapper.UserMapper;
import com.grupo12.Voy.features.users.Mapper.UserUpdateMapper;
import com.grupo12.Voy.features.users.Service.UsersService;
import com.grupo12.Voy.features.users.models.UserEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class UsersServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PartyRepository partyRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private NewUserDtoMapper newUserDtoMapper;

    @Mock
    private UserFollowMapper userFollowMapper;

    @Mock
    private UserUpdateMapper userUpdateMapper;

    @Mock
    private TicketMapper ticketMapper;

    @Mock
    private ReceiptMapper receiptMapper;

    @Mock
    private PartyMapper partyMapper;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CredentialsRepository credentialsRepository;

    @InjectMocks
    private UsersService usersService;

    @Test
    @DisplayName("alterFollow: Debe seguir exitosamente cuando el usuario destino tiene rol de organizador")
    void alterFollow_whenTargetIsOrganizer_shouldFollowSuccessfully() {
        // Given
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        UserEntity user = UserEntity.builder()
                .externalId(userId)
                .username("followerUser")
                .followsList(new HashSet<>())
                .build();

        RoleEntity organizerRole = new RoleEntity(Roles.ROLE_ORGANIZATOR);
        CredentialsEntity organizerCredentials = CredentialsEntity.builder()
                .username("organizerUser")
                .roles(new HashSet<>(Set.of(organizerRole)))
                .build();

        UserEntity otherUser = UserEntity.builder()
                .externalId(otherUserId)
                .username("organizerUser")
                .credentials(organizerCredentials)
                .followersList(new HashSet<>())
                .build();

        UserFollowDto followDto = new UserFollowDto(otherUserId, "organizerUser");

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(user));
        given(userRepository.findByExternalId(otherUserId)).willReturn(Optional.of(otherUser));
        given(userRepository.save(otherUser)).willReturn(otherUser);
        given(userRepository.save(user)).willReturn(user);
        given(userFollowMapper.toDto(otherUser)).willReturn(followDto);

        // When
        List<UserFollowDto> result = usersService.alterFollow(userId, otherUserId);

        // Then
        assertThat(result).isNotNull().containsExactly(followDto);
        assertThat(user.getFollowsList()).contains(otherUser);
        assertThat(otherUser.getFollowersList()).contains(user);

        then(userRepository).should().save(otherUser);
        then(userRepository).should().save(user);
        then(userFollowMapper).should().toDto(otherUser);
    }

    @Test
    @DisplayName("alterFollow: Debe lanzar NotAllowedException cuando el usuario destino no es organizador")
    void alterFollow_whenTargetIsNotOrganizer_shouldThrowNotAllowedException() {
        // Given
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        UserEntity user = UserEntity.builder()
                .externalId(userId)
                .username("followerUser")
                .build();

        RoleEntity userRole = new RoleEntity(Roles.ROLE_USER);
        CredentialsEntity userCredentials = CredentialsEntity.builder()
                .username("regularUser")
                .roles(new HashSet<>(Set.of(userRole)))
                .build();

        UserEntity otherUser = UserEntity.builder()
                .externalId(otherUserId)
                .username("regularUser")
                .credentials(userCredentials)
                .build();

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(user));
        given(userRepository.findByExternalId(otherUserId)).willReturn(Optional.of(otherUser));

        // When / Then
        NotAllowedException exception = assertThrows(NotAllowedException.class,
                () -> usersService.alterFollow(userId, otherUserId));

        assertThat(exception.getMessage()).isEqualTo("Solo es posible seguir a usuarios con rol de organizador");
        then(userRepository).should(never()).save(any());
    }

    @Test
    @DisplayName("alterFollow: Debe lanzar NotAllowedException cuando el usuario intenta seguirse a sí mismo")
    void alterFollow_whenFollowingSelf_shouldThrowNotAllowedException() {
        // Given
        UUID userId = UUID.randomUUID();

        // When / Then
        NotAllowedException exception = assertThrows(NotAllowedException.class,
                () -> usersService.alterFollow(userId, userId));

        assertThat(exception.getMessage()).isEqualTo("No puede un usuario seguirse a si mismo");
        then(userRepository).shouldHaveNoInteractions();
    }

    @Test
    @DisplayName("alterFollow: Debe dejar de seguir al organizador cuando ya se encontraba en followsList")
    void alterFollow_whenAlreadyFollowing_shouldUnfollowSuccessfully() {
        // Given
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        RoleEntity organizerRole = new RoleEntity(Roles.ROLE_ORGANIZATOR);
        CredentialsEntity organizerCredentials = CredentialsEntity.builder()
                .username("organizerUser")
                .roles(new HashSet<>(Set.of(organizerRole)))
                .build();

        UserEntity otherUser = UserEntity.builder()
                .externalId(otherUserId)
                .username("organizerUser")
                .credentials(organizerCredentials)
                .followersList(new HashSet<>())
                .build();

        UserEntity user = UserEntity.builder()
                .externalId(userId)
                .username("followerUser")
                .followsList(new HashSet<>(Set.of(otherUser)))
                .build();

        otherUser.getFollowersList().add(user);

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(user));
        given(userRepository.findByExternalId(otherUserId)).willReturn(Optional.of(otherUser));
        given(userRepository.save(otherUser)).willReturn(otherUser);
        given(userRepository.save(user)).willReturn(user);

        // When
        List<UserFollowDto> result = usersService.alterFollow(userId, otherUserId);

        // Then
        assertThat(result).isEmpty();
        assertThat(user.getFollowsList()).doesNotContain(otherUser);
        assertThat(otherUser.getFollowersList()).doesNotContain(user);

        then(userRepository).should().save(otherUser);
        then(userRepository).should().save(user);
    }

    @Test
    @DisplayName("updateUser: Debe lanzar EntityDuplicatedException cuando el username ya existe")
    void updateUser_whenUsernameAlreadyExists_shouldThrowEntityDuplicatedException() {
        // Given
        UUID userId = UUID.randomUUID();
        UserUpdateDto updateDto = new UserUpdateDto("existingUsername", "Secret123!");

        UserEntity user = UserEntity.builder()
                .externalId(userId)
                .username("currentUsername")
                .build();

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(user));
        given(userRepository.existsByUsername("existingUsername")).willReturn(true);

        // When / Then
        EntityDuplicatedException exception = assertThrows(EntityDuplicatedException.class,
                () -> usersService.updateUser(userId, updateDto));

        assertThat(exception.getMessage()).isEqualTo("El nombre de usuario ya se encuentra registrado");
        then(credentialsRepository).shouldHaveNoInteractions();
        then(passwordEncoder).shouldHaveNoInteractions();
    }

    @Test
    @DisplayName("updateUser: Debe actualizar credenciales y usuario exitosamente retornando UserDto")
    void updateUser_successful_shouldUpdateCredentialsAndReturnUserDto() {
        // Given
        UUID userId = UUID.randomUUID();
        UserUpdateDto updateDto = new UserUpdateDto("newUsername", "NewPassword123!");

        CredentialsEntity credentials = CredentialsEntity.builder()
                .username("oldUsername")
                .password("oldHashedPass")
                .build();

        UserEntity user = UserEntity.builder()
                .externalId(userId)
                .username("oldUsername")
                .email("user@example.com")
                .credentials(credentials)
                .build();

        UserDto expectedDto = new UserDto(userId, "newUsername", "user@example.com");

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(user));
        given(userRepository.existsByUsername("newUsername")).willReturn(false);
        given(passwordEncoder.encode("NewPassword123!")).willReturn("newHashedPass");
        given(userRepository.save(user)).willReturn(user);
        given(userMapper.userToDto(user)).willReturn(expectedDto);

        // When
        UserDto result = usersService.updateUser(userId, updateDto);

        // Then
        assertThat(result).isEqualTo(expectedDto);
        assertThat(user.getUsername()).isEqualTo("newUsername");
        assertThat(credentials.getUsername()).isEqualTo("newUsername");
        assertThat(credentials.getPassword()).isEqualTo("newHashedPass");

        then(passwordEncoder).should().encode("NewPassword123!");
        then(credentialsRepository).should().save(credentials);
        then(userRepository).should().save(user);
        then(userMapper).should().userToDto(user);
    }

    @Test
    @DisplayName("updateUser: No debe validar duplicidad si el username no fue modificado")
    void updateUser_whenUsernameUnchanged_shouldNotCheckDuplicationAndUpdatePassword() {
        // Given
        UUID userId = UUID.randomUUID();
        UserUpdateDto updateDto = new UserUpdateDto("sameUsername", "NewPass1234!");

        CredentialsEntity credentials = CredentialsEntity.builder()
                .username("sameUsername")
                .password("oldHashedPass")
                .build();

        UserEntity user = UserEntity.builder()
                .externalId(userId)
                .username("sameUsername")
                .email("same@example.com")
                .credentials(credentials)
                .build();

        UserDto expectedDto = new UserDto(userId, "sameUsername", "same@example.com");

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(user));
        given(passwordEncoder.encode("NewPass1234!")).willReturn("encodedNewPass");
        given(userRepository.save(user)).willReturn(user);
        given(userMapper.userToDto(user)).willReturn(expectedDto);

        // When
        UserDto result = usersService.updateUser(userId, updateDto);

        // Then
        assertThat(result).isEqualTo(expectedDto);
        assertThat(credentials.getPassword()).isEqualTo("encodedNewPass");

        then(userRepository).should(never()).existsByUsername(any());
        then(credentialsRepository).should().save(credentials);
        then(userRepository).should().save(user);
    }

    @Test
    @DisplayName("userToPublic: Debe promover al usuario a organizador cambiando ROLE_USER por ROLE_ORGANIZATOR")
    void userToPublic_successful_shouldPromoteToOrganizer() {
        // Given
        UUID userId = UUID.randomUUID();

        RoleEntity userRole = new RoleEntity(Roles.ROLE_USER);
        RoleEntity organizerRole = new RoleEntity(Roles.ROLE_ORGANIZATOR);

        Set<RoleEntity> roles = new HashSet<>();
        roles.add(userRole);

        CredentialsEntity credentials = CredentialsEntity.builder()
                .roles(roles)
                .build();

        UserEntity user = UserEntity.builder()
                .externalId(userId)
                .accesibilityUser(false)
                .credentials(credentials)
                .build();

        UserDto expectedDto = new UserDto(userId, "promotedUser", "user@test.com");

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(user));
        given(roleRepository.findByRole(Roles.ROLE_ORGANIZATOR)).willReturn(organizerRole);
        given(userRepository.save(user)).willReturn(user);
        given(userMapper.userToDto(user)).willReturn(expectedDto);

        // When
        UserDto result = usersService.userToPublic(userId);

        // Then
        assertThat(result).isEqualTo(expectedDto);
        assertThat(user.getAccesibilityUser()).isTrue();
        assertThat(credentials.getRoles()).doesNotContain(userRole);
        assertThat(credentials.getRoles()).contains(organizerRole);

        then(roleRepository).should().findByRole(Roles.ROLE_ORGANIZATOR);
        then(userRepository).should().save(user);
        then(userMapper).should().userToDto(user);
    }

    @Test
    @DisplayName("userToPublic: Debe lanzar EntityNotFoundException si el rol organizador no existe en el sistema")
    void userToPublic_whenOrganizerRoleNotFound_shouldThrowEntityNotFoundException() {
        // Given
        UUID userId = UUID.randomUUID();
        UserEntity user = UserEntity.builder()
                .externalId(userId)
                .build();

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(user));
        given(roleRepository.findByRole(Roles.ROLE_ORGANIZATOR)).willReturn(null);

        // When / Then
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> usersService.userToPublic(userId));

        assertThat(exception.getMessage()).isEqualTo("El rol de organizador no existe en el sistema");
        then(userRepository).should(never()).save(any());
    }

    @Test
    @DisplayName("alterFollowParty: Debe lanzar NotAllowedException cuando el usuario intenta seguir su propia fiesta")
    void alterFollowParty_whenPartyIsOwn_shouldThrowNotAllowedException() {
        // Given
        UUID userId = UUID.randomUUID();
        UUID partyId = UUID.randomUUID();

        UserEntity organizer = UserEntity.builder()
                .externalId(userId)
                .username("organizerUser")
                .build();

        PartyEntity party = new PartyEntity();
        party.setExternalId(partyId);
        party.setOrganizer(organizer);

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(organizer));
        given(partyRepository.findByExternalIdAndLogicStateTrue(partyId)).willReturn(Optional.of(party));

        // When / Then
        NotAllowedException exception = assertThrows(NotAllowedException.class,
                () -> usersService.alterFollowParty(userId, partyId));

        assertThat(exception.getMessage()).isEqualTo("No puede un usuario seguir sus propias fiestas");
        then(userRepository).should(never()).save(any());
    }

    @Test
    @DisplayName("alterFollowParty: Debe seguir la fiesta exitosamente cuando no es propia")
    void alterFollowParty_whenPartyIsNotOwn_shouldFollowSuccessfully() {
        // Given
        UUID userId = UUID.randomUUID();
        UUID organizerId = UUID.randomUUID();
        UUID partyId = UUID.randomUUID();

        UserEntity user = UserEntity.builder()
                .externalId(userId)
                .username("regularUser")
                .followedParties(new HashSet<>())
                .build();

        UserEntity organizer = UserEntity.builder()
                .externalId(organizerId)
                .username("partyOrganizer")
                .build();

        PartyEntity party = new PartyEntity();
        party.setExternalId(partyId);
        party.setOrganizer(organizer);

        PartyUsersDto partyDto = new PartyUsersDto("Fiesta Epica", "Desc", "Rosario",
                BigDecimal.valueOf(1000), "Calle 123", LocalDateTime.now(), null);

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(user));
        given(partyRepository.findByExternalIdAndLogicStateTrue(partyId)).willReturn(Optional.of(party));
        given(userRepository.save(user)).willReturn(user);
        given(partyMapper.toUserFromEntity(party)).willReturn(partyDto);

        // When
        List<PartyUsersDto> result = usersService.alterFollowParty(userId, partyId);

        // Then
        assertThat(result).containsExactly(partyDto);
        assertThat(user.getFollowedParties()).contains(party);

        then(userRepository).should().save(user);
        then(partyMapper).should().toUserFromEntity(party);
    }

    @Test
    @DisplayName("alterFollowParty: Debe dejar de seguir la fiesta cuando ya estaba en followedParties")
    void alterFollowParty_whenAlreadyFollowing_shouldUnfollowPartySuccessfully() {
        // Given
        UUID userId = UUID.randomUUID();
        UUID organizerId = UUID.randomUUID();
        UUID partyId = UUID.randomUUID();

        PartyEntity party = new PartyEntity();
        party.setExternalId(partyId);

        UserEntity organizer = UserEntity.builder()
                .externalId(organizerId)
                .username("partyOrganizer")
                .build();
        party.setOrganizer(organizer);

        UserEntity user = UserEntity.builder()
                .externalId(userId)
                .username("regularUser")
                .followedParties(new HashSet<>(Set.of(party)))
                .build();

        given(userRepository.findByExternalId(userId)).willReturn(Optional.of(user));
        given(partyRepository.findByExternalIdAndLogicStateTrue(partyId)).willReturn(Optional.of(party));
        given(userRepository.save(user)).willReturn(user);

        // When
        List<PartyUsersDto> result = usersService.alterFollowParty(userId, partyId);

        // Then
        assertThat(result).isEmpty();
        assertThat(user.getFollowedParties()).doesNotContain(party);

        then(userRepository).should().save(user);
    }
}
