package com.bloodbridge;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class FlywayMigrationTest {

    @Test
    @DisplayName("Flyway migrations execute cleanly and can be applied repeatedly")
    void testFlywayMigrationExecution() {
        // Run Flyway against a dedicated in-memory database to test the V1 migration script
        Flyway flyway = Flyway.configure()
                .dataSource("jdbc:h2:mem:flyway_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH", "sa", "")
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();

        MigrateResult result = flyway.migrate();
        assertTrue(result.migrationsExecuted > 0, "At least one migration should be executed");
        assertEquals("2", result.targetSchemaVersion, "Schema version should match V2");

        // Verify repeatable migration check (subsequent migrate run does not fail or duplicate)
        MigrateResult repeatResult = flyway.migrate();
        assertEquals(0, repeatResult.migrationsExecuted, "No new migrations should execute on repeated run");
    }
}
