package ci.vio.backend.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p JOIN FETCH p.plan JOIN FETCH p.user " +
            "WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.plan JOIN FETCH p.user " +
            "WHERE p.providerPaymentId = :id")
    Optional<Payment> findByProviderPaymentId(@Param("id") String providerPaymentId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.plan JOIN FETCH p.user " +
            "ORDER BY p.createdAt DESC")
    List<Payment> findAllWithDetails();

    @Query("SELECT p FROM Payment p JOIN FETCH p.plan JOIN FETCH p.user " +
            "WHERE p.status = :status ORDER BY p.createdAt DESC")
    List<Payment> findByStatusWithDetails(@Param("status") PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amountXof), 0) FROM Payment p WHERE p.status = 'SUCCESS'")
    long sumSuccessAmount();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'SUCCESS'")
    long countSuccessPayments();
}