// Automatically provided by base44 platform

/**
 * Creates a URL for a page in your app
 * @param {string} pageName - Name of the page (without .js extension)
 * @param {object} params - Optional query parameters
 * @returns {string} - Full URL path
 */
export function createPageUrl(pageName, params = {}) {
  let url = `/${pageName}`;
  
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
}

// Usage examples:
// createPageUrl("Dashboard") → "/Dashboard"
// createPageUrl("Chat", { appointmentId: "123" }) → "/Chat?appointmentId=123"

import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

// In your component
{/* <Link to={createPageUrl("BookAppointment")}>Book Appointment</Link>
<Link to={createPageUrl("Chat", { appointmentId: apt.id })}>Open Chat</Link> */}

// Or with navigate
navigate(createPageUrl("Dashboard"));