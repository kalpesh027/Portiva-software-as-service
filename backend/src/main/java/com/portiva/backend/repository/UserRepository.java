package com.portiva.backend.repository;

import com.portiva.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Primary lookup for authentication — excludes soft-deleted users.
     */
    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    /**
     * Registration duplicate check.
     */
    boolean existsByEmail(String email);

    /**
     * Find users by role (e.g. 'admin') — excludes soft-deleted.
     */
    List<User> findByRoleAndDeletedAtIsNull(String role);

    /**
     * Pageable list of all active users for admin panel.
     */
    Page<User> findAllByDeletedAtIsNull(Pageable pageable);

    /**
     * Admin search — name or email, pageable, excludes soft-deleted.
     */
    @Query("""
           SELECT u FROM User u
           WHERE u.deletedAt IS NULL
             AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
           """)
    Page<User> searchActiveUsers(@Param("search") String search, Pageable pageable);

    /**
     * Count active (non-deleted) users — used by admin stats.
     */
    long countByDeletedAtIsNull();

    /**
     * Count active users registered in the last N days — admin stats.
     * Uses a @Param cutoff so the caller controls the window (testable).
     * JPQL arithmetic on dates is non-portable; pass LocalDateTime from service layer.
     */
    @Query("""
           SELECT COUNT(u) FROM User u
           WHERE u.deletedAt IS NULL
             AND u.createdAt >= :cutoff
           """)
    long countActiveUsersLast30Days(@Param("cutoff") java.time.LocalDateTime cutoff);
}
