namespace inta.Extensions;

/// <summary>
/// Centralized startup logging utility to replace scattered Console.WriteLine calls.
/// </summary>
public static class StartupLogger
{
    public static void LogInfo(string message) =>
        Console.WriteLine($"📌 {message}");

    public static void LogSearch(string message) =>
        Console.WriteLine($"🔍 {message}");

    public static void LogSuccess(string message) =>
        Console.WriteLine($"✅ {message}");

    public static void LogWarning(string message) =>
        Console.WriteLine($"⚠️ {message}");

    public static void LogError(string message) =>
        Console.WriteLine($"❌ {message}");

    public static void LogStats(string message) =>
        Console.WriteLine($"📊 {message}");

    public static void LogStartup(string message) =>
        Console.WriteLine($"🚀 {message}");

    public static void LogUrl(string message) =>
        Console.WriteLine($"🌐 {message}");
}
