import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8011))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    uvicorn.run("src.api:app", host="0.0.0.0", port=port, reload=reload)
