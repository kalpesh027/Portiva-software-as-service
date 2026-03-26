package com.portiva.backend.repository;

import com.portiva.backend.entity.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TemplateRepository extends JpaRepository<Template, String> {

    /**
     * All active templates — used for public /templates endpoint.
     * Ordered by sortOrder for consistent display.
     */
    List<Template> findByIsActiveTrueOrderBySortOrderAsc();

    /**
     * Templates accessible to a given set of plans.
     * e.g. for 'pro' user: requiredPlanIn(['free','pro'])
     */
    List<Template> findByRequiredPlanInAndIsActiveTrueOrderBySortOrderAsc(List<String> plans);
}
