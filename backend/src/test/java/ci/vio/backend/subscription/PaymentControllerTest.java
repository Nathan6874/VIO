package ci.vio.backend.subscription;

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

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
@Import(SecurityConfig.class)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentService paymentService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(username = "+22507000001", roles = "OWNER")
    void initiateShouldReturn201() throws Exception {
        User owner = new User();
        owner.setId(1L);
        owner.setWhatsapp("+22507000001");
        when(userService.findByWhatsapp("+22507000001")).thenReturn(Optional.of(owner));
        when(paymentService.initiateMock(any(User.class), eq("STD")))
                .thenReturn(new PaymentService.InitiatePaymentResponse(
                        10L, null, "/owner/subscription/mock-pay/10", "mock-payment"));

        mockMvc.perform(post("/api/payments/initiate")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"planCode\":\"STD\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentId").value(10))
                .andExpect(jsonPath("$.redirectUrl").value("/owner/subscription/mock-pay/10"));
    }
}