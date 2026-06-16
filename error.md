⨯ 422 Unprocessable Entity
"method: post url: https://api.github.com/repos/Saboor-Hamedi/TrayFocus/releases\n\n          Data:\n          {\n  \"message\": \"Validation Failed\",\n  \"errors\": [\n    {\n      \"resource\": \"Release\",\n      \"code\": \"already_exists\",\n      \"field\": \"tag_name\"\n    }\n  ],\n  \"documentation_url\": \"https://docs.github.com/rest/releases/releases#create-a-release\",\n  \"status\": \"422\"\n}\n          "
Headers: {
  "date": "Tue, 16 Jun 2026 20:27:00 GMT",
  "content-type": "application/json; charset=utf-8",
  "content-length": "209",
  "x-oauth-scopes": "b894ca4f0f304deb58b4c83ccf5b37ac3c8f80e097a91bd5d8b39430c410f901 (sha256 hash)",
  "x-accepted-oauth-scopes": "071ca2227754705837aa3ef9748ed59e9f8a015fd765c42f391a4cbc271c6d5e (sha256 hash)",
  "github-authentication-token-expiration": "cf1d53ff4a3ae467b246ae9bd4a513e6c9c7ea90fde4907d0e16bad31d55758c (sha256 hash)",
  "x-github-media-type": "github.v3; format=json",
  "x-github-api-version-selected": "2022-11-28",
  "access-control-expose-headers": "ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Resource, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, X-GitHub-SSO, X-GitHub-Request-Id, Deprecation, Sunset, Warning",
  "access-control-allow-origin": "*",
  "strict-transport-security": "max-age=31536000; includeSubdomains; preload",
  "x-frame-options": "deny",
  "x-content-type-options": "nosniff",
  "x-xss-protection": "0",
  "referrer-policy": "origin-when-cross-origin, strict-origin-when-cross-origin",
  "content-security-policy": "default-src 'none'",
  "vary": "Accept-Encoding, Accept, X-Requested-With",
  "server": "github.com",
  "x-ratelimit-limit": "5000",
  "x-ratelimit-remaining": "4964",
  "x-ratelimit-reset": "1781643001",
  "x-ratelimit-used": "36",
  "x-ratelimit-resource": "core",
  "x-github-request-id": "E982:2E392B:96FA6:AA5CE:6A31B193"
}  failedTask=build stackTrace=HttpError: 422 Unprocessable Entity
"method: post url: https://api.github.com/repos/Saboor-Hamedi/TrayFocus/releases\n\n          Data:\n          {\n  \"message\": \"Validation Failed\",\n  \"errors\": [\n    {\n      \"resource\": \"Release\",\n      \"code\": \"already_exists\",\n      \"field\": \"tag_name\"\n    }\n  ],\n  \"documentation_url\": \"https://docs.github.com/rest/releases/releases#create-a-release\",\n  \"status\": \"422\"\n}\n          "
Headers: {
  "date": "Tue, 16 Jun 2026 20:27:00 GMT",
  "content-type": "application/json; charset=utf-8",
  "content-length": "209",
  "x-oauth-scopes": "b894ca4f0f304deb58b4c83ccf5b37ac3c8f80e097a91bd5d8b39430c410f901 (sha256 hash)",
  "x-accepted-oauth-scopes": "071ca2227754705837aa3ef9748ed59e9f8a015fd765c42f391a4cbc271c6d5e (sha256 hash)",
  "github-authentication-token-expiration": "cf1d53ff4a3ae467b246ae9bd4a513e6c9c7ea90fde4907d0e16bad31d55758c (sha256 hash)",
  "x-github-media-type": "github.v3; format=json",
  "x-github-api-version-selected": "2022-11-28",
  "access-control-expose-headers": "ETag, Link, Location, Retry-After, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Used, X-RateLimit-Resource, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval, X-GitHub-Media-Type, X-GitHub-SSO, X-GitHub-Request-Id, Deprecation, Sunset, Warning",
  "access-control-allow-origin": "*",
  "strict-transport-security": "max-age=31536000; includeSubdomains; preload",
  "x-frame-options": "deny",
  "x-content-type-options": "nosniff",
  "x-xss-protection": "0",
  "referrer-policy": "origin-when-cross-origin, strict-origin-when-cross-origin",
  "content-security-policy": "default-src 'none'",
  "vary": "Accept-Encoding, Accept, X-Requested-With",
  "server": "github.com",
  "x-ratelimit-limit": "5000",
  "x-ratelimit-remaining": "4964",
  "x-ratelimit-reset": "1781643001",
  "x-ratelimit-used": "36",
  "x-ratelimit-resource": "core",
  "x-github-request-id": "E982:2E392B:96FA6:AA5CE:6A31B193"
}
    at createHttpError (B:\electron\TrayFocus\node_modules\builder-util-runtime\src\httpExecutor.ts:66:10)
    at IncomingMessage.<anonymous> (B:\electron\TrayFocus\node_modules\builder-util-runtime\src\httpExecutor.ts:241:13)
    at IncomingMessage.emit (node:events:531:35)
    at endReadableNT (node:internal/streams/readable:1698:12)
    at processTicksAndRejections (node:internal/process/task_queues:90:21)