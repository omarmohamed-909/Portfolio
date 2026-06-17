import ActivityLog from "../models/ActivityLogSchema.js";

export async function logActivity({ action, resource, resourceId, details = {}, adminId = "unknown", ip = "" }) {
  try {
    await ActivityLog.create({ action, resource, resourceId, details, adminId, ip });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
}

export function activityLoggerMiddleware(resource) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    let responseBody = null;

    res.json = function (body) {
      responseBody = body;
      return originalJson(body);
    };

    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const action =
          req.method === "POST"
            ? "create"
            : req.method === "PUT"
              ? "update"
              : req.method === "DELETE"
                ? "delete"
                : null;
        if (!action) return;

        const resourceId =
          req.params?.id || responseBody?._id || null;

        logActivity({
          action,
          resource,
          resourceId,
          details: req.activityDetails || {},
          adminId: req.user?.id || "unknown",
          ip: req.ip,
        });
      }
    });

    next();
  };
}
