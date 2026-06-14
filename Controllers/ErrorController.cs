using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace inta.Controllers;

[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
public class ErrorController : ControllerBase
{
    private readonly ILogger<ErrorController> _logger;

    public ErrorController(ILogger<ErrorController> logger)
    {
        _logger = logger;
    }

    [Route("/error")]
    public IActionResult HandleError()
    {
        var exceptionFeature = HttpContext.Features.Get<IExceptionHandlerFeature>();

        if (exceptionFeature?.Error is not null)
        {
            _logger.LogError(exceptionFeature.Error,
                "Unhandled exception at {Path}", exceptionFeature.Path);
        }

        return Problem(
            title: "An unexpected error occurred.",
            statusCode: StatusCodes.Status500InternalServerError);
    }
}
