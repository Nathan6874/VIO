package ci.vio.backend.admin;

import ci.vio.backend.property.PropertyNotFoundException;
import ci.vio.backend.property.PropertyResponse;
import ci.vio.backend.property.PropertyStatus;
import ci.vio.backend.property.PropertyType;
import ci.vio.backend.security.JwtService;
import ci.vio.backend.security.SecurityConfig;
import ci.vio.backend.user.AccountStatus;
import ci.vio.backend.user.User;
import ci.vio.backend.user.UserRole;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminService adminService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private User adminUser() {
        User u = new User();
        u.setId(1L);
        u.setWhatsapp("+22501020304");
        u.setRole(UserRole.ADMIN);
        u.setAccountStatus(AccountStatus.ACTIVE);
        return u;
    }

    private PropertyResponse sampleResponse(PropertyStatus status) {
        return new PropertyResponse(
                10L, "Appartement Cocody", "Chez Koffi",
                "Abidjan", "Cocody", 250000.0,
                PropertyType.APPARTEMENT, 3, 75.0,
                status,
                Instant.parse("2026-11-07T00:00:00Z"),
                new PropertyResponse.OwnerInfo(6L, "Koffi", "Jean", "+22501020304")
        );
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "ADMIN")
    void approveShouldReturn200WhenAdmin() throws Exception {
        when(userService.findByWhatsapp("+22501020304")).thenReturn(Optional.of(adminUser()));
        when(adminService.approve(eq(10L), any(User.class)))
                .thenReturn(sampleResponse(PropertyStatus.APPROVED));

        mockMvc.perform(put("/api/admin/properties/10/approve").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "ADMIN")
    void rejectShouldReturn200WhenAdmin() throws Exception {
        when(userService.findByWhatsapp("+22501020304")).thenReturn(Optional.of(adminUser()));
        when(adminService.reject(eq(10L), any(User.class)))
                .thenReturn(sampleResponse(PropertyStatus.REJECTED));

        mockMvc.perform(put("/api/admin/properties/10/reject").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    @WithMockUser(username = "+22505060708", roles = "OWNER")
    void approveShouldReturn403WhenOwner() throws Exception {
        mockMvc.perform(put("/api/admin/properties/10/approve").with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "ADMIN")
    void approveShouldReturn404WhenPropertyNotFound() throws Exception {
        when(userService.findByWhatsapp("+22501020304")).thenReturn(Optional.of(adminUser()));
        when(adminService.approve(eq(99999L), any(User.class)))
                .thenThrow(new PropertyNotFoundException(99999L));

        mockMvc.perform(put("/api/admin/properties/99999/approve").with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "ADMIN")
    void getStatsShouldReturn200() throws Exception {
        when(adminService.getStats()).thenReturn(
                new AdminDtos.AdminStatsDto(50, 30, 20, 100, 5, 90, 5, 2, 4)
        );

        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(50))
                .andExpect(jsonPath("$.pendingProperties").value(5));
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "ADMIN")
    void findAllUsersShouldReturn200() throws Exception {
        when(adminService.findAllUsers()).thenReturn(List.of());

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "ADMIN")
    void suspendUserShouldReturn200() throws Exception {
        when(userService.findByWhatsapp("+22501020304")).thenReturn(Optional.of(adminUser()));
        when(adminService.suspendUser(eq(5L), any(User.class), any(AdminDtos.SuspendUserRequest.class)))
                .thenReturn(new AdminDtos.AdminUserDto(5L, "Koffi", "Jean",
                        "+22507000001", UserRole.OWNER, AccountStatus.SUSPENDED, Instant.now()));

        mockMvc.perform(put("/api/admin/users/5/suspend")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"Comportement suspect\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accountStatus").value("SUSPENDED"));
    }

    @Test
    @WithMockUser(username = "+22501020304", roles = "ADMIN")
    void getReportsShouldReturn200() throws Exception {
        when(adminService.findAllReports()).thenReturn(List.of());

        mockMvc.perform(get("/api/admin/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}