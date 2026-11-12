package ci.vio.backend.favorite;

import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.security.JwtService;
import ci.vio.backend.security.SecurityConfig;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FavoriteController.class)
@Import(SecurityConfig.class)
class FavoriteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FavoriteService favoriteService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private User clientUser() {
        User u = new User();
        u.setId(7L);
        u.setWhatsapp("+22507000001");
        return u;
    }

    private FavoriteResponse sample() {
        return new FavoriteResponse(
                1L, 10L, "Villa", "Abidjan", "Cocody", 250000.0, "VILLA",
                Instant.parse("2026-11-12T00:00:00Z")
        );
    }

    @Test
    @WithMockUser(username = "+22507000001", roles = "CLIENT")
    void addShouldReturn201() throws Exception {
        when(userService.findByWhatsapp("+22507000001")).thenReturn(Optional.of(clientUser()));
        when(favoriteService.add(eq(10L), any(User.class))).thenReturn(sample());

        mockMvc.perform(post("/api/favorites/10").with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.propertyId").value(10));
    }

    @Test
    @WithMockUser(username = "+22507000001", roles = "CLIENT")
    void listShouldReturn200() throws Exception {
        when(userService.findByWhatsapp("+22507000001")).thenReturn(Optional.of(clientUser()));
        when(favoriteService.listForUser(any(User.class)))
                .thenReturn(List.of(sample()));

        mockMvc.perform(get("/api/favorites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(username = "+22507000001", roles = "CLIENT")
    void removeShouldReturn204() throws Exception {
        when(userService.findByWhatsapp("+22507000001")).thenReturn(Optional.of(clientUser()));

        mockMvc.perform(delete("/api/favorites/10").with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "+22507000001", roles = "CLIENT")
    void addOnUnknownPropertyShouldReturn404() throws Exception {
        when(userService.findByWhatsapp("+22507000001")).thenReturn(Optional.of(clientUser()));
        when(favoriteService.add(eq(99999L), any(User.class)))
                .thenThrow(new PropertyNotFoundException(99999L));

        mockMvc.perform(post("/api/favorites/99999").with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("PropertyNotFound"));
    }

    @Test
    void listWithoutAuthShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/favorites"))
                .andExpect(status().isUnauthorized());
    }
}