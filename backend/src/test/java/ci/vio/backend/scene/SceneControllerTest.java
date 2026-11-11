package ci.vio.backend.scene;

import ci.vio.backend.property.PropertyNotFoundException;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SceneController.class)
@Import(SecurityConfig.class)
class SceneControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SceneService sceneService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private User ownerUser() {
        User u = new User();
        u.setId(1L);
        u.setWhatsapp("+22501020304");
        return u;
    }

    private SceneResponse sampleScene(Long id) {
        return new SceneResponse(
                id, 10L, "Salon",
                "/uploads/salon.jpg",
                0, true, 0.0, 0.0,
                Instant.parse("2026-11-10T00:00:00Z")
        );
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "OWNER")
    void postSceneShouldReturn201() throws Exception {
        when(userService.findByWhatsapp("+22501020304")).thenReturn(Optional.of(ownerUser()));
        when(sceneService.createScene(eq(10L), any(User.class), any(SceneRequest.class)))
                .thenReturn(sampleScene(1L));

        mockMvc.perform(post("/api/properties/10/scenes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"Salon\",\"panoramaUrl\":\"/uploads/salon.jpg\",\"sceneOrder\":0,\"isMainScene\":true}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.label").value("Salon"))
                .andExpect(jsonPath("$.isMainScene").value(true));
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "OWNER")
    void getScenesShouldReturn200() throws Exception {
        when(userService.findByWhatsapp("+22501020304")).thenReturn(Optional.of(ownerUser()));
        when(sceneService.findScenesByProperty(eq(10L), any(User.class)))
                .thenReturn(List.of(sampleScene(1L), sampleScene(2L)));

        mockMvc.perform(get("/api/properties/10/scenes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getScenesPublicShouldReturn200WithoutAuth() throws Exception {
        when(sceneService.findScenesByPropertyPublic(10L))
                .thenReturn(List.of(sampleScene(1L)));

        mockMvc.perform(get("/api/properties/10/scenes/public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].label").value("Salon"));
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "OWNER")
    void postSceneOnUnknownPropertyShouldReturn404() throws Exception {
        when(userService.findByWhatsapp("+22501020304")).thenReturn(Optional.of(ownerUser()));
        when(sceneService.createScene(eq(99999L), any(User.class), any(SceneRequest.class)))
                .thenThrow(new PropertyNotFoundException(99999L));

        mockMvc.perform(post("/api/properties/99999/scenes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"X\",\"panoramaUrl\":\"/x.jpg\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("PropertyNotFound"));
    }

    @Test
    void getScenesPublicWithoutAuthShouldWorkForApprovedOnly() throws Exception {
        when(sceneService.findScenesByPropertyPublic(99999L))
                .thenThrow(new PropertyNotFoundException(99999L));

        mockMvc.perform(get("/api/properties/99999/scenes/public"))
                .andExpect(status().isNotFound());
    }
}