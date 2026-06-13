using inta.Data;
using Microsoft.EntityFrameworkCore;

namespace inta.Extensions;

/// <summary>
/// Extension methods for database initialization and connection verification.
/// </summary>
public static class DatabaseExtensions
{
    /// <summary>
    /// Resolves the connection string from configuration. Throws if not configured.
    /// </summary>
    public static string ResolveConnectionString(this IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("WedApplication2ConnectionStrings")
                               ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException(
                "No database connection string configured. " +
                "Set 'ConnectionStrings:DefaultConnection' in appsettings.json or environment variables.");
        }

        return connectionString;
    }

    /// <summary>
    /// Tests the database connection and ensures the schema is created.
    /// Only runs in the Development environment.
    /// </summary>
    public static void InitializeDatabase(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
            return;

        try
        {
            StartupLogger.LogSearch("Testing database connection...");

            using var scope = app.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            if (db.Database.CanConnect())
            {
                StartupLogger.LogSuccess("Database connected successfully!");
            }
            else
            {
                StartupLogger.LogWarning("Cannot connect to database. Creating new database...");
            }

            var created = db.Database.EnsureCreated();
            StartupLogger.LogStats($"Database tables ensured: {created}");
        }
        catch (Exception ex)
        {
            StartupLogger.LogError($"DATABASE ERROR: {ex.Message}");
            if (ex.InnerException != null)
            {
                StartupLogger.LogInfo($"Inner Exception: {ex.InnerException.Message}");
            }
        }
    }
}
