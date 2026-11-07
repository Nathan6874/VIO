package ci.vio.backend.property;

import ci.vio.backend.security.JwtService;
import ci.vio.backend.security.SecurityConfig;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PropertyController.class)
@Import(SecurityConfig.class)
class PropertyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PropertyService propertyService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private PropertyResponse sampleResponse(PropertyStatus status) {
        return new PropertyResponse(
                10L,
                "Appartement 3 pièces Cocody",
                "Bel appartement rénové",
                "Abidjan",
                "Cocody",
                250000.0,
                PropertyType.APPARTEMENT,
                3,
                75.0,
                status,
                Instant.parse("2026-11-07T00:00:00Z"),
                new PropertyResponse.OwnerInfo(1L, "Koffi", "Jean", "+22501020304")
        );
    }

    @Test
    @WithMockUser(username = "+22501020304")
    void postPropertyShouldReturn201AndCreatedProperty() throws Exception {
        User owner = new User();
        owner.setId(1L);
        owner.setWhatsapp("+22501020304");

        when(userService.findByWhatsapp("+22501020304")).thenReturn(Optional.of(owner));

        PropertyResponse response = sampleResponse(PropertyStatus.PENDING);

        when(propertyService.create(any(User.class), anyString(), anyString(),
                anyString(), anyString(), anyDouble(), any(PropertyType.class),
                anyInt(), anyDouble()))
                .thenReturn(response);

        mockMvc.perform(post("/api/properties")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titre\":\"Appartement 3 pièces Cocody\",\"description\":\"Bel appartement rénové\",\"ville\":\"Abidjan\",\"commune\":\"Cocody\",\"prix\":250000,\"type\":\"APPARTEMENT\",\"nombrePieces\":3,\"surface\":75}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.type").value("APPARTEMENT"))
                .andExpect(jsonPath("$.nombrePieces").value(3))
                .andExpect(jsonPath("$.surface").value(75.0))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @WithMockUser(username = "+22501020304")
    void getPropertyListShouldReturn200AndOnlyOwnerProperties() throws Exception {
        User owner = new User();
        owner.setId(1L);
        owner.setWhatsapp("+22501020304");

        when(userService.findByWhatsapp("+22501020304")).thenReturn(Optional.of(owner));
        when(propertyService.findAllByOwner(owner)).thenReturn(List.of());

        mockMvc.perform(get("/api/properties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void getPublicPropertiesShouldReturn200WithoutAuth() throws Exception {
        PropertyResponse approved = sampleResponse(PropertyStatus.APPROVED);

        when(propertyService.findAllApproved()).thenReturn(List.of(approved));

        mockMvc.perform(get("/api/properties/public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("APPROVED"))
                .andExpect(jsonPath("$[0].type").value("APPARTEMENT"));
    }
}