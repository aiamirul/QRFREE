/**
 * OpenAPI 3.1.0 Specification Definition for AmirulQR Free Foreva API
 */

export const OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "AmirulQR Free Foreva API & Engine",
    version: "1.4.0",
    description: "AmirulQR Free Foreva: 100% free forever high-resolution QR code generator with centered brand logos, automated URL normalization, Reed-Solomon Level H calibration (30% error correction), and multi-format output (Interactive Inspector, Vector SVG, Binary PNG, and RESTful JSON).",
    contact: {
      name: "AmirulQR Free Foreva Support",
      url: "https://amirulqr.free"
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT"
    }
  },
  servers: [
    {
      url: "/",
      description: "Current Application Host (AI Studio Deployment)"
    },
    {
      url: "/?mode=api",
      description: "Direct API Gateway Endpoint"
    }
  ],
  tags: [
    {
      name: "QR Generation",
      description: "Core QR rendering and badge embedding endpoints"
    },
    {
      name: "Formats",
      description: "Output streaming formats (JSON, SVG, PNG, HTML)"
    }
  ],
  paths: {
    "/?mode=api": {
      get: {
        tags: ["QR Generation"],
        summary: "Generate QR Code with Centered Brand Logo",
        description: "Renders a scannable QR code matrix embedding a calibrated center brand logo (Google Play, Apple, WhatsApp, Instagram, Website globe, etc.) or custom image URL. Automatically normalizes target URLs and enforces high error-correction redundancy.",
        operationId: "generateQrCode",
        parameters: [
          {
            name: "mode",
            in: "query",
            required: true,
            description: "Enables API dispatch mode.",
            schema: {
              type: "string",
              enum: ["api"],
              default: "api"
            },
            example: "api"
          },
          {
            name: "url",
            in: "query",
            required: false,
            description: "Destination URL or encoded payload. If the protocol is omitted (e.g. `mystery.com`), `https://` is prepended automatically.",
            schema: {
              type: "string",
              default: "mystery.com"
            },
            example: "mystery.com"
          },
          {
            name: "centerlogo",
            in: "query",
            required: false,
            description: "Identifier of the centered brand logo badge or direct HTTPS image URL. Aliases such as `playstore`, `globe`, `wa`, `insta` are resolved automatically.",
            schema: {
              type: "string",
              enum: [
                "website",
                "google-play",
                "apple",
                "apple-brand",
                "whatsapp",
                "instagram",
                "x",
                "youtube",
                "linkedin",
                "tiktok",
                "facebook",
                "github",
                "telegram",
                "spotify",
                "wifi",
                "none"
              ],
              default: "website"
            },
            example: "website"
          },
          {
            name: "format",
            in: "query",
            required: false,
            description: "Desired output serialization format.",
            schema: {
              type: "string",
              enum: ["view", "svg", "png", "json"],
              default: "view"
            },
            example: "view"
          },
          {
            name: "ec",
            in: "query",
            required: false,
            description: "Reed-Solomon Error Correction level. Level H (High) provides ~30% damage tolerance, critical for center logo obstruction.",
            schema: {
              type: "string",
              enum: ["L", "M", "Q", "H"],
              default: "H"
            },
            example: "H"
          },
          {
            name: "color",
            in: "query",
            required: false,
            description: "Foreground color for QR modules. Supports 6-digit hex code with or without leading `#`.",
            schema: {
              type: "string",
              default: "0f172a"
            },
            example: "01875F"
          },
          {
            name: "bg",
            in: "query",
            required: false,
            description: "Background color hex code or 'transparent' for alpha transparency.",
            schema: {
              type: "string",
              default: "ffffff"
            },
            example: "ffffff"
          },
          {
            name: "size",
            in: "query",
            required: false,
            description: "Width and height dimensions in pixels.",
            schema: {
              type: "integer",
              minimum: 128,
              maximum: 2048,
              default: 512
            },
            example: 512
          },
          {
            name: "download",
            in: "query",
            required: false,
            description: "If set to `1` or `true`, automatically prompts the client browser to download the file.",
            schema: {
              type: "string",
              enum: ["0", "1", "true", "false"],
              default: "0"
            },
            example: "0"
          }
        ],
        responses: {
          "200": {
            description: "Successful QR Code generation.",
            content: {
              "text/html": {
                schema: {
                  type: "string",
                  description: "Interactive Developer Inspector view with live canvas, copyable code snippets, latency metric, and full studio link."
                }
              },
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QrCodeResponseJson"
                }
              },
              "image/svg+xml": {
                schema: {
                  type: "string",
                  format: "binary",
                  description: "Raw standalone SVG vector graphics markup with embedded logo vectors."
                }
              },
              "image/png": {
                schema: {
                  type: "string",
                  format: "binary",
                  description: "Rasterized high-definition PNG image binary stream."
                }
              }
            }
          },
          "400": {
            description: "Invalid query parameters provided.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      QrCodeResponseJson: {
        type: "object",
        required: ["success", "status", "targetUrl", "logo", "svg", "pngBase64", "meta"],
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          status: {
            type: "integer",
            example: 200
          },
          targetUrl: {
            type: "string",
            format: "uri",
            example: "https://mystery.com"
          },
          logo: {
            $ref: "#/components/schemas/LogoMetadata"
          },
          svg: {
            type: "string",
            description: "Full SVG markup containing path definitions and center logo.",
            example: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\">...</svg>"
          },
          pngBase64: {
            type: "string",
            description: "Data URI Base64 encoded PNG for immediate HTML image embedding.",
            example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
          },
          meta: {
            $ref: "#/components/schemas/MetaInfo"
          }
        }
      },
      LogoMetadata: {
        type: "object",
        required: ["name", "type"],
        properties: {
          name: {
            type: "string",
            example: "Website / Web"
          },
          type: {
            type: "string",
            enum: ["preset", "url", "none"],
            example: "preset"
          },
          presetId: {
            type: "string",
            nullable: true,
            example: "globe"
          },
          customUrl: {
            type: "string",
            nullable: true,
            example: null
          }
        }
      },
      MetaInfo: {
        type: "object",
        required: ["errorCorrection", "dimensions", "foreground", "background", "generatedAt"],
        properties: {
          errorCorrection: {
            type: "string",
            enum: ["L", "M", "Q", "H"],
            example: "H"
          },
          dimensions: {
            type: "integer",
            example: 512
          },
          foreground: {
            type: "string",
            example: "#0f172a"
          },
          background: {
            type: "string",
            example: "#ffffff"
          },
          generatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-09-23T12:00:00.000Z"
          }
        }
      },
      ErrorResponse: {
        type: "object",
        required: ["success", "status", "error"],
        properties: {
          success: {
            type: "boolean",
            example: false
          },
          status: {
            type: "integer",
            example: 400
          },
          error: {
            type: "string",
            example: "Invalid URL parameter provided"
          }
        }
      }
    }
  }
};

export const SWAGGER_SAMPLE_PRESETS = [
  {
    name: "Default Mystery.com + Website Badge",
    description: "The requested default endpoint configuration with auto-normalized URL and globe logo.",
    params: {
      url: "mystery.com",
      centerlogo: "website",
      format: "view",
      ec: "H",
      color: "0f172a",
      bg: "ffffff",
      size: 512
    }
  },
  {
    name: "Google Play Store Official (Verified 2022 Logo)",
    description: "Deep link to Google Play Store package with emerald styling and the 2022 brand triangle.",
    params: {
      url: "https://play.google.com/store/apps/details?id=com.instagram.android",
      centerlogo: "google-play",
      format: "view",
      ec: "H",
      color: "01875F",
      bg: "ffffff",
      size: 512
    }
  },
  {
    name: "Apple App Store Direct",
    description: "iOS App Store product link with classic Cupertino blue and centered App Store weave.",
    params: {
      url: "https://apps.apple.com/app/id1234567890",
      centerlogo: "apple",
      format: "view",
      ec: "H",
      color: "0071E3",
      bg: "ffffff",
      size: 512
    }
  },
  {
    name: "WhatsApp Quick Chat Order",
    description: "Pre-filled WhatsApp click-to-chat URL with green styling and messenger badge.",
    params: {
      url: "https://wa.me/15550192834?text=Hello%20AmirulQR",
      centerlogo: "whatsapp",
      format: "view",
      ec: "H",
      color: "075E54",
      bg: "ffffff",
      size: 512
    }
  },
  {
    name: "RESTful JSON Metadata Payload",
    description: "Returns structured JSON including Base64 PNG, raw SVG markup, and generation metrics.",
    params: {
      url: "mystery.com",
      centerlogo: "website",
      format: "json",
      ec: "H",
      color: "0f172a",
      bg: "ffffff",
      size: 512
    }
  },
  {
    name: "Transparent Vector SVG Stream",
    description: "Direct vector graphic stream with transparent background, perfect for vector illustrators & plotters.",
    params: {
      url: "https://github.com",
      centerlogo: "github",
      format: "svg",
      ec: "H",
      color: "24292E",
      bg: "transparent",
      size: 512
    }
  },
  {
    name: "Custom Remote SVG Logo",
    description: "Embeds an arbitrary external HTTPS SVG icon with automatic CORS handling.",
    params: {
      url: "https://stripe.com",
      centerlogo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/stripe/stripe-original.svg",
      format: "view",
      ec: "H",
      color: "635BFF",
      bg: "ffffff",
      size: 512
    }
  }
];
