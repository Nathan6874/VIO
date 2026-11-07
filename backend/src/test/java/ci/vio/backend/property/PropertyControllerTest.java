package ci.vio.backend.property;

import ci.vio.backend.security.JwtService;
import ci.vio.backend.security.SecurityConfig;
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
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser
    void postPropertyShouldReturn201AndCreatedProperty() throws Exception {
        Property property = new Property();
        property.setId(1L);
        property.setTitre("Appartement 3 pièces Cocody");
        property.setDescription("Bel appartement rénové");
        property.setVille("Abidjan");
        property.setCommune("Cocody");
        property.setPrix(250000.0);
        property.setCreatedAt(Instant.parse("2026-11-07T00:00:00Z"));

        when(propertyService.create(anyString(), anyString(), anyString(), anyString(), anyDouble()))
                .thenReturn(property);

        mockMvc.perform(post("/api/properties")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titre\":\"Appartement 3 pièces Cocody\",\"description\":\"Bel appartement rénové\",\"ville\":\"Abidjan\",\"commune\":\"Cocody\",\"prix\":250000}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.titre").value("Appartement 3 pièces Cocody"))
                .andExpect(jsonPath("$.ville").value("Abidjan"))
                .andExpect(jsonPath("$.commune").value("Cocody"))
                .andExpect(jsonPath("$.prix").value(250000.0));
    }

    @Test
    @WithMockUser
    void getPropertyListShouldReturn200AndEmptyList() throws Exception {
        when(propertyService.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/properties"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}