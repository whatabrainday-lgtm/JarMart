const supportCountKey = "jarmart:support-count";
const encodedSupportCountKey = encodeURIComponent(supportCountKey);

function redisUrl() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        throw new Error("Upstash Redis is not configured.");
    }

    return { url: url.replace(/\/+$/, ""), token };
}

async function redisCommand(path) {
    const redis = redisUrl();
    const response = await fetch(`${redis.url}/${path}`, {
        headers: { Authorization: `Bearer ${redis.token}` }
    });

    if (!response.ok) {
        throw new Error("Upstash Redis request failed.");
    }

    const result = await response.json();
    if (result.error) {
        throw new Error("Upstash Redis command failed.");
    }

    return result.result;
}

module.exports = async function handler(request, response) {
    response.setHeader("Cache-Control", "no-store");

    if (request.method !== "GET" && request.method !== "POST") {
        response.setHeader("Allow", "GET, POST");
        return response.status(405).json({ error: "Method not allowed." });
    }

    if (request.method === "POST" && request.headers.origin) {
        try {
            if (new URL(request.headers.origin).host !== request.headers.host) {
                return response.status(403).json({ error: "Origin not allowed." });
            }
        } catch (error) {
            return response.status(403).json({ error: "Origin not allowed." });
        }
    }

    try {
        await redisCommand(`set/${encodedSupportCountKey}/1/nx`);
        const result = request.method === "POST"
            ? await redisCommand(`incr/${encodedSupportCountKey}`)
            : await redisCommand(`get/${encodedSupportCountKey}`);
        const count = Number(result);

        if (!Number.isSafeInteger(count) || count < 1) {
            throw new Error("Invalid supporter count.");
        }

        return response.status(200).json({ count });
    } catch (error) {
        console.error("Support counter request failed.", error);
        return response.status(503).json({ error: "Support counter is unavailable." });
    }
};