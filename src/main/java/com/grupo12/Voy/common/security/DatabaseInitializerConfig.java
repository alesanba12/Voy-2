package com.grupo12.Voy.common.security;

import com.grupo12.Voy.common.security.enums.Permits;
import com.grupo12.Voy.common.security.enums.Roles;
import com.grupo12.Voy.common.security.models.CredentialsEntity;
import com.grupo12.Voy.common.security.models.PermitEntity;
import com.grupo12.Voy.common.security.models.RoleEntity;
import com.grupo12.Voy.common.security.repository.CredentialsRepository;
import com.grupo12.Voy.common.security.repository.PermitRepository;
import com.grupo12.Voy.common.security.repository.RoleRepository;
import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.parties.repository.PartyRepository;
import com.grupo12.Voy.features.tags.TagsRepository;
import com.grupo12.Voy.features.tags.models.TagEntity;
import com.grupo12.Voy.features.users.UserRepository;
import com.grupo12.Voy.features.users.models.UserEntity;
import jakarta.transaction.Transactional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Configuration
public class DatabaseInitializerConfig {

    @Bean
    @Transactional
    public CommandLineRunner initDatabase(
            PermitRepository permitRepository,
            RoleRepository roleRepository,
            CredentialsRepository credentialsRepository,
            UserRepository userRepository,
            TagsRepository tagsRepository,
            PartyRepository partyRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // 1. Evitar duplicados si el ddl-auto no está en create-drop
            if (permitRepository.count() > 0) return;

            System.out.println(">> Cargando datos de prueba en la base de datos...");

            // 2. Crear y guardar Permisos
            PermitEntity altaProd = permitRepository.save(PermitEntity.builder().permit(Permits.CREAR_USUARIO).build());
            PermitEntity crearCuenta = permitRepository.save(PermitEntity.builder().permit(Permits.ACTUALIZAR_CUENTA).build());
            PermitEntity verUsuarios = permitRepository.save(PermitEntity.builder().permit(Permits.ELIMINAR_USUARIO).build());

            // 3. Crear y guardar Roles asignando los permisos correspondientes
            RoleEntity roleUser = new RoleEntity(Roles.ROLE_USER);
            roleUser.getPermits().add(crearCuenta);
            roleUser.getPermits().add(verUsuarios);
            roleRepository.save(roleUser);

            RoleEntity roleAdmin = new RoleEntity(Roles.ROLE_ADMIN);
            roleAdmin.getPermits().add(altaProd);
            roleRepository.save(roleAdmin);

            RoleEntity roleOrganizer = new RoleEntity(Roles.ROLE_ORGANIZATOR);
            roleOrganizer.getPermits().add(altaProd);
            roleRepository.save(roleOrganizer);

            // 4. Crear los 10 usuarios de prueba en un bucle
            String passwordPlano = "Password123#";
            String passwordEncriptada = passwordEncoder.encode(passwordPlano);

            // Ejemplo: Crear Admin
            UserEntity adminUser = new UserEntity();
            adminUser.setExternalId(UUID.randomUUID());
            adminUser.setUsername("admin");
            adminUser.setEmail("admin@example.com");
            adminUser.setBirthdate(LocalDate.parse("2000-09-18"));
            userRepository.save(adminUser);

            CredentialsEntity adminCreds = new CredentialsEntity();
            adminCreds.setUsername("admin");
            adminCreds.setPassword(passwordEncriptada);
            adminCreds.setEnabled(true);
            adminCreds.setUsuario(adminUser);
            adminCreds.getRoles().add(roleAdmin);
            credentialsRepository.save(adminCreds);

            // Ejemplo: Crear los 9 usuarios restantes con un for-loop dinámico
            for (int i = 1; i <= 9; i++) {
                UserEntity user = new UserEntity();
                user.setExternalId(UUID.randomUUID());
                user.setUsername("user" + i);
                user.setEmail("user" + i + "@example.com");
                user.setBirthdate(LocalDate.parse("2000-09-18"));
                userRepository.save(user);

                CredentialsEntity creds = new CredentialsEntity();
                creds.setUsername("user" + i);
                creds.setPassword(passwordEncriptada);
                // El usuario 9 lo creamos deshabilitado para mostrar la excepción en clase
                creds.setEnabled(true);
                creds.setUsuario(user);
                creds.getRoles().add(roleUser);
                credentialsRepository.save(creds);
            }

            for (int i=0; i<3; i++){
                TagEntity tag = new TagEntity();
                tag.setName("testTag"+i);
                tagsRepository.save(tag);
            }

            PartyEntity party = new PartyEntity();
            party.setExternalId(UUID.randomUUID());
            party.getTagsList().add(tagsRepository.findById(1L).orElseThrow());
            party.setAdress("Constitucion 0");
            party.setCity("Mar del plata");
            party.setDescription("Una fiesta en el mar");
            party.setTitle("Fiesta en el mar");
            party.setPrice(BigDecimal.ZERO);
            party.setDateTime(LocalDateTime.now().plusDays(10));
            party.setGuestLimit(20);
            party.setPartyAccesibility(true);
            party.setOrganizer(userRepository.findById(2L).orElseThrow());
            partyRepository.save(party);

            System.out.println(">> ¡Datos de prueba cargados exitosamente usando el PasswordEncoder");
        };
    }
}