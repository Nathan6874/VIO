package ci.vio.backend.security;

import ci.vio.backend.user.User;
import ci.vio.backend.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String whatsapp) throws UsernameNotFoundException {
        User user = userRepository.findByWhatsapp(whatsapp)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + whatsapp));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getWhatsapp())
                .password(user.getPassword())
                .authorities(Collections.emptyList())
                .build();
    }
}