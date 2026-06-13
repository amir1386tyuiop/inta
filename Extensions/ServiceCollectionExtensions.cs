using System.Threading.RateLimiting;
using inta.Data;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace inta.Extensions;

/// <summary>
/// Extension methods for registering application services.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers the Entity Framework DbContext with the resolved connection string.
    /// </summary>
    public static IServiceCollection AddApplicationDatabase(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.ResolveConnectionString();
        StartupLogger.LogInfo($"Using connection string: {connectionString}");

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(connectionString));

        return services;
    }

    /// <summary>
    /// Registers common API services (controllers, Swagger, HttpClient).
    /// </summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddControllers();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();
        services.AddHttpClient();

        return services;
    }

    /// <summary>
    /// Registers authentication, authorization, CORS, and rate limiting.
    /// </summary>
    public static IServiceCollection AddApplicationSecurity(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddAuthentication();
        services.AddAuthorization();

        var allowedOrigins = configuration.GetSection("AllowedOrigins").Get<string[]>()
                             ?? Array.Empty<string>();
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                if (allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                }
                else
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                }
            });
        });

        services.AddRateLimiter(options =>
        {
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 100,
                        Window = TimeSpan.FromMinutes(1)
                    }));
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        });

        return services;
    }
}
