// Automatically provided by base44 platform
// These are serverless functions that run on base44 infrastructure

import { base44 } from '@/api/base44Client';

/**
 * Invoke AI/LLM for intelligent responses
 */
export async function InvokeLLM({
  prompt,
  add_context_from_internet = false,
  response_json_schema = null,
  file_urls = null
}) {
  return await base44.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet,
    response_json_schema,
    file_urls
  });
}

/**
 * Upload file to cloud storage
 */
export async function UploadFile({ file }) {
  return await base44.integrations.Core.UploadFile({ file });
  // Returns: { file_url: "https://..." }
}

/**
 * Send email notification
 */
export async function SendEmail({ 
  to, 
  subject, 
  body, 
  from_name = null 
}) {
  return await base44.integrations.Core.SendEmail({
    to,
    subject,
    body,
    from_name
  });
}

/**
 * Generate AI image
 */
export async function GenerateImage({ prompt }) {
  return await base44.integrations.Core.GenerateImage({ prompt });
  // Returns: { url: "https://..." }
}

/**
 * Extract data from uploaded file (OCR, CSV parsing, etc.)
 */
export async function ExtractDataFromUploadedFile({ 
  file_url, 
  json_schema 
}) {
  return await base44.integrations.Core.ExtractDataFromUploadedFile({
    file_url,
    json_schema
  });
  // Returns: { status: "success", output: [...] }
}

/**
 * Create signed URL for private files
 */
export async function CreateFileSignedUrl({ 
  file_uri, 
  expires_in = 300 
}) {
  return await base44.integrations.Core.CreateFileSignedUrl({
    file_uri,
    expires_in
  });
  // Returns: { signed_url: "https://..." }
}

/**
 * Upload private file
 */
export async function UploadPrivateFile({ file }) {
  return await base44.integrations.Core.UploadPrivateFile({ file });
  // Returns: { file_uri: "private://..." }
}

import { InvokeLLM, UploadFile, SendEmail } from "@/integrations/Core";

// AI consultation
const response = await InvokeLLM({
  prompt: "Analyze these symptoms: fever, headache",
  response_json_schema: {
    type: "object",
    properties: {
      diagnosis: { type: "string" },
      severity: { type: "string" }
    }
  }
});

// File upload
const { file_url } = await UploadFile({ file: selectedFile });

// Send email
await SendEmail({
  to: "patient@example.com",
  subject: "Appointment Confirmed",
  body: "Your appointment is scheduled..."
});