// This file is automatically provided by base44 platform
// You don't need to create or modify this file

import { Base44Client } from '@base44/sdk';

// Pre-initialized client with your app credentials
export const base44 = new Base44Client({
  appId: process.env.BASE44_APP_ID,
  apiKey: process.env.BASE44_API_KEY,
  environment: process.env.NODE_ENV
});

import { base44 } from '@/api/base44Client';

// Entity operations
await base44.entities.Doctor.list();
await base44.entities.Appointment.create(data);

// // Auth operations
// const user = await base44.auth.me();
// await base44.auth.updateMe(data);

// Integrations
await base44.integrations.Core.InvokeLLM({ prompt: "..." });

import { base44 } from "@/api/base44Client";

// CRUD Operations
const doctors = await base44.entities.Doctor.list();
const appointment = await base44.entities.Appointment.create(appointmentData);
const user = await base44.auth.me();