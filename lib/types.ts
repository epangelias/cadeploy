/** Represents a network address in the format "host:port" or ":port" (e.g., ":80", "localhost:8080"). */
export type NetworkAddress = string;

/** Defines a matcher for routing requests based on hostnames. */
export type HostMatcher = {
  /** List of hostnames to match (e.g., ["example.com", "*.example.com"]). */
  host: string[];
};

/** Defines an upstream server for proxying requests. */
export type Upstream = {
  /** Address to forward requests to (e.g., "backend:8080"). */
  dial: NetworkAddress;
  /** Optional weight for load balancing (higher means more traffic). */
  weight?: number;
  /** Optional maximum concurrent requests to this upstream. */
  maxRequests?: number;
};

/** Defines a handler for processing HTTP requests. */
export type Handler = {
  /** Type of handler (e.g., "reverse_proxy", "static_response", "file_server", or custom). */
  handler: 'reverse_proxy' | 'static_response' | 'file_server' | string;
  /** List of upstream servers for reverse_proxy handler. */
  upstreams?: Upstream[];
  /** Response configuration for static_response handler. */
  response?: {
    /** HTTP status code (e.g., 200, 404). */
    status?: number;
    /** Response body content. */
    body?: string;
  };
  /** Root directory for file_server handler (e.g., "/var/www/html"). */
  root?: string;
};

/** Defines a route for handling HTTP requests. */
export type Route = {
  /** Conditions for matching the route (e.g., host-based matching). */
  match?: HostMatcher[];
  /** Handlers to process the request, executed in order. */
  handle: Handler[];
  /** Whether to stop processing further routes after this one. */
  terminal?: boolean;
};

/** Defines an HTTP server configuration. */
export type HttpServer = {
  /** Addresses to listen on (e.g., [":80", ":443"]). */
  listen: NetworkAddress[];
  /** Routes for handling requests. */
  routes: Route[];
  /** Automatic HTTPS configuration ("on" to enable, "off" to disable). */
  autoHttps?: 'off' | 'on';
};

/** Defines the HTTP application containing server configurations. */
export type HttpApp = {
  /** Server configurations, keyed by server name. */
  servers: Record<string, HttpServer>;
};

/** Defines the top-level Caddy configuration. */
export type CaddyConfig = {
  /** Applications configured in Caddy. */
  apps: {
    /** HTTP application configuration. */
    http: HttpApp;
    /** TLS configuration for secure connections. */
    tls?: {
      /** Certificate management settings. */
      certificates?: {
        /** Paths to load certificate files from. */
        load_files?: { path: string }[];
      };
    };
    /** Logging configuration. */
    logging?: {
      /** Log configurations, keyed by log name. */
      logs: Record<string, {
        /** Log level (e.g., "DEBUG", "INFO", "WARN", "ERROR"). */
        level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
      }>;
    };
  };
};