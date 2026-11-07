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

    @Test
    @WithMockUser(username = "+22501020304")
    void postPropertyShouldReturn201AndCreatedProperty() throws Exception {
        User owner = new User();
        owner.setId(1L);
        owner.setWhatsapp("+22501020304");

        when(userService.findByWhatsapp("+22501020304")).thenReturn(Optional.of(owner));

        PropertyResponse response = new PropertyResponse(
                10L,
                "Appartement 3 pièces Cocody",
                "Bel appartement rénové",
                "Abidjan",
                "Cocody",
                250000.0,
                PropertyStatus.PENDING,
                Instant.parse("2026-11-07T00:00:00Z"),
                new PropertyResponse.OwnerInfo(1L, "Koffi", "Jean", "+22501020304")
        );

        when(propertyService.create(any(User.class), anyString(), anyString(),
                anyString(), anyString(), anyDouble()))
                .thenReturn(response);

        mockMvc.perform(post("/api/properties")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titre\":\"Appartement 3 pièces Cocody\",\"description\":\"Bel appartement rénové\",\"ville\":\"Abidjan\",\"commune\":\"Cocody\",\"prix\":250000}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.owner.whatsapp").value("+22501020304"));
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
}