package ci.vio.backend.subscription;

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

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SubscriptionController.class)
@Import(SecurityConfig.class)
class SubscriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SubscriptionService subscriptionService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "+22507000001", roles = "OWNER")
    void cancelShouldReturn200() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setWhatsapp("+22507000001");
        when(userService.findByWhatsapp("+22507000001")).thenReturn(Optional.of(user));
        doNothing().when(subscriptionService).cancelActive(any(User.class));

        mockMvc.perform(post("/api/subscriptions/cancel").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }
}