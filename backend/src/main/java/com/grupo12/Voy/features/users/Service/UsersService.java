package com.grupo12.Voy.features.users.Service;


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
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;
import com.grupo12.Voy.features.receipts.ReceiptMapper;
import com.grupo12.Voy.features.tickets.TicketMapper;
import com.grupo12.Voy.features.tickets.models.DTO.TicketUsersDto;
import com.grupo12.Voy.features.users.Dto.NewUserDto;
import com.grupo12.Voy.features.users.Dto.UserFollowDto;
import com.grupo12.Voy.features.users.Dto.UserUpdateDto;
import com.grupo12.Voy.features.users.Mapper.NewUserDtoMapper;
import com.grupo12.Voy.features.users.Mapper.UserFollowMapper;
import com.grupo12.Voy.features.users.Mapper.UserMapper;
import com.grupo12.Voy.features.users.UserRepository;
import com.grupo12.Voy.features.users.models.UserEntity;
import com.grupo12.Voy.features.users.Dto.UserDto;
import com.grupo12.Voy.features.users.specification.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.PredicateSpecification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsersService implements IUsersService{
    private final UserRepository userRepository;
    private final PartyRepository partyRepository;
    private final UserMapper userMapper;
    private final NewUserDtoMapper newUserDtoMapper;
    private final UserFollowMapper userFollowMapper;
    private final TicketMapper ticketMapper;
    private final ReceiptMapper receiptMapper;
    private final PartyMapper partyMapper;

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CredentialsRepository credentialsRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDto findByExternalId(UUID userUuid){
        return userMapper.userToDto(getUser(userUuid));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAll(String username, String email){
        PredicateSpecification<UserEntity> spec = PredicateSpecification.allOf(
                UserSpecification.usernameContains(username),
                UserSpecification.emailContains(email));

        if (!isAdmin()) {
            spec = spec.and(UserSpecification.isOrganizer());
        }

        return userRepository.findAll(spec).stream().map(userMapper::userToDto).toList();
    }


    @Override
    @Transactional
    public void deleteUser(UUID externalId){
        userRepository.delete(getUser(externalId));
    }

    @Override
    @Transactional
    public UserDto newUser(NewUserDto newUserDto) {
        if (userRepository.existsByEmail(newUserDto.email()) ||
                userRepository.existsByUsername(newUserDto.username())) {
            throw new EntityDuplicatedException("Usuario duplicado");
        }

        UserEntity user = newUserDtoMapper.newUserToEntity(newUserDto);

        UserEntity userEntity = userRepository.save(user);

        RoleEntity defaultRole = roleRepository.findByRole(Roles.ROLE_USER);

        CredentialsEntity credentials = CredentialsEntity.builder()
                .username(newUserDto.username())
                .enabled(true)
                .usuario(userEntity)
                .roles(new HashSet<>(Set.of(defaultRole)))
                .password(passwordEncoder.encode(newUserDto.password()))
                .build();

        credentialsRepository.save(credentials);

        return userMapper.userToDto(userEntity);
    }

    @Override
    @Transactional
    public UserDto updateUser(UUID userUuid, UserUpdateDto userUpdateDto){
       UserEntity user = getUser(userUuid);
       if (!user.getUsername().equals(userUpdateDto.username())) {
           if (userRepository.existsByUsername(userUpdateDto.username())) {
               throw new EntityDuplicatedException("El nombre de usuario ya se encuentra registrado");
           }
           user.setUsername(userUpdateDto.username());
       }

       CredentialsEntity credentials = user.getCredentials();
       if (credentials != null) {
           credentials.setUsername(userUpdateDto.username());
           credentials.setPassword(passwordEncoder.encode(userUpdateDto.password()));
           credentialsRepository.save(credentials);
       }

       return userMapper.userToDto(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserFollowDto> listFollowList(UUID userUuid){
          UserEntity user = getUser(userUuid);
          return user.getFollowsList().stream().map(userFollowMapper::toDto).toList();
    }

    @Override
    @Transactional
    public List<UserFollowDto> alterFollow(UUID userId, UUID otherUserId){
        if(userId.equals(otherUserId)){
            throw new NotAllowedException("No puede un usuario seguirse a si mismo");
        }
        UserEntity user = getUser(userId);
        UserEntity otherUser = getUser(otherUserId);

        boolean isOrganizer = otherUser.getCredentials() != null &&
                otherUser.getCredentials().getRoles().stream()
                        .anyMatch(role -> role.getRole() == Roles.ROLE_ORGANIZATOR);
        if (!isOrganizer) {
            throw new NotAllowedException("Solo es posible seguir a usuarios con rol de organizador");
        }

        if(user.getFollowsList().contains(otherUser)) {
            user.getFollowsList().remove(otherUser);
            otherUser.getFollowersList().remove(user);
        } else {
            user.getFollowsList().add(otherUser);
            otherUser.getFollowersList().add(user);
        }
        userRepository.save(otherUser);
        return userRepository
                .save(user)
                .getFollowsList()
                .stream()
                .map(userFollowMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserFollowDto> listFollowersList(UUID userUuid){
        UserEntity  user = getUser(userUuid);
        return user.getFollowersList().stream().map(userFollowMapper::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartyUsersDto> listFollowedParties(UUID userUuid){
        UserEntity user = getUser(userUuid);
        return user.getFollowedParties().stream().map(partyMapper::toUserFromEntity).toList();
    }

    @Override
    @Transactional
    public List<PartyUsersDto> alterFollowParty(UUID userId, UUID partyId){
        UserEntity user = getUser(userId);
        PartyEntity party = partyRepository
                .findByExternalIdAndLogicStateTrue(partyId)
                .orElseThrow(()-> new EntityNotFoundException("Evento no encontrado"));
        if(userId.equals(party.getOrganizer().getExternalId())){
            throw new NotAllowedException("No puede un usuario seguir sus propias fiestas");
        }
        if(user.getFollowedParties().contains(party))
            user.getFollowedParties().remove(party);
        else
            user.getFollowedParties().add(party);
        return userRepository
                .save(user)
                .getFollowedParties()
                .stream()
                .map(partyMapper::toUserFromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartyUsersDto> listMyParties(UUID userId){
        UserEntity user = getUser(userId);
        return user.getMyParties().stream().map(partyMapper::toUserFromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketUsersDto> listTickets(UUID userUuid){
        UserEntity user = getUser(userUuid);
        return user.getMyTickets().stream().map(ticketMapper::toUsersDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReceiptResponseDTO> listReceipt(UUID userUuid){
        UserEntity user = getUser(userUuid);
        return user.getMyReceipts().stream().map(receiptMapper::toResponseDTO).toList();
    }

    @Override
    @Transactional
    public UserDto promoteToOrganizer(UUID userId){
        UserEntity user = userRepository
                .findByExternalId(userId)
                .orElseThrow(()->new EntityNotFoundException("Usuario no encontrado"));
        user.setIsOrganizer(true);

        RoleEntity organizerRole = roleRepository.findByRole(Roles.ROLE_ORGANIZATOR);
        if (organizerRole == null) {
            throw new EntityNotFoundException("El rol de organizador no existe en el sistema");
        }

        if (user.getCredentials() != null) {
            user.getCredentials().getRoles().removeIf(r -> r.getRole() == Roles.ROLE_USER);
            user.getCredentials().getRoles().add(organizerRole);
        }

        return userMapper.userToDto(userRepository.save(user));
    }

    private UserEntity getUser(UUID userId){
        return userRepository
                .findByExternalId(userId)
                .orElseThrow(()-> new EntityNotFoundException("Usuario no encontrado"));
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() 
        && auth.getAuthorities().stream()
               .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
