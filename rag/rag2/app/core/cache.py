import json
import redis
from functools import wraps
from typing import Callable, Any, Optional

from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    def __init__(self):
        self._redis_client = None
        try:
            self._redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                decode_responses=True
            )
            self._redis_client.ping()
            logger.info("Successfully connected to Redis cache.")
        except redis.exceptions.ConnectionError as e:
            logger.warning(f"Could not connect to Redis cache: {e}. Falling back to in-memory cache.")
            self._redis_client = None

    def get(self, key: str) -> Optional[str]:
        if self._redis_client:
            return self._redis_client.get(key)
        return None

    def set(self, key: str, value: str, ex: int = settings.CACHE_EXPIRE_SECONDS):
        if self._redis_client:
            self._redis_client.set(key, value, ex=ex)

redis_cache = RedisCache()

def cached(expire: int = settings.CACHE_EXPIRE_SECONDS):
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Create a cache key from function name and arguments
            # For simplicity, we'll use a basic key. In a real app, consider more robust serialization.
            cache_key_parts = [func.__module__, func.__name__]
            cache_key_parts.extend([str(arg) for arg in args])
            cache_key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
            cache_key = ":".join(cache_key_parts)

            cached_result = redis_cache.get(cache_key)
            if cached_result:
                logger.debug(f"Cache hit for {func.__name__}")
                return json.loads(cached_result)

            logger.debug(f"Cache miss for {func.__name__}. Executing function.")
            result = await func(*args, **kwargs) if hasattr(func, '__call__') and 'async' in str(type(func)) else func(*args, **kwargs)
            redis_cache.set(cache_key, json.dumps(result), ex=expire)
            return result
        return wrapper
    return decorator
