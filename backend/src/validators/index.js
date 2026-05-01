const { z } = require('zod');

// Indian state / UT RTO codes (2 letters)
const INDIAN_STATE_CODES = [
  'AN', 'AP', 'AR', 'AS', 'BR', 'CG', 'CH', 'DD', 'DL', 'DN',
  'GA', 'GJ', 'HP', 'HR', 'JH', 'JK', 'KA', 'KL', 'LA', 'LD',
  'MH', 'ML', 'MN', 'MP', 'MZ', 'NL', 'OD', 'OR', 'PB', 'PY',
  'RJ', 'SK', 'TN', 'TR', 'TS', 'UK', 'UA', 'UP', 'WB',
];

// Format: "TN 20 BC 3424" — state(2) RTO(1-2 digits) segment(1-3 letters) number(1-4 digits)
const LICENSE_PLATE_REGEX = /^([A-Z]{2})\s\d{1,2}\s[A-Z]{1,3}\s\d{1,4}$/;

// VIN: 17 alphanumerics, excluding I, O, Q
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

// Phone: exactly 10 digits
const PHONE_REGEX = /^\d{10}$/;

const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, 'Phone must be exactly 10 digits');

const licensePlateSchema = z
  .string()
  .regex(LICENSE_PLATE_REGEX, 'License plate must look like "TN 20 BC 3424"')
  .refine(
    (v) => INDIAN_STATE_CODES.includes(v.slice(0, 2)),
    { message: 'License plate must start with a valid Indian state code (e.g. TN, KA, MH)' }
  );

const vinSchema = z
  .string()
  .regex(VIN_REGEX, 'VIN must be 17 alphanumeric characters (no I, O, or Q)');

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  // role intentionally NOT accepted from public registration — always set to USER server-side
  phone: phoneSchema.optional(),
  address: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const vehicleSchema = z.object({
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  licensePlate: licensePlateSchema,
  vin: vinSchema,
});

const vehicleUpdateSchema = vehicleSchema.partial();

const SERVICE_TYPES = ['REGULAR', 'OIL', 'TIRE', 'BRAKE', 'BATTERY', 'ALIGNMENT', 'INSPECTION'];
const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

const serviceRequestSchema = z.object({
  vehicleId: z.string().uuid(),
  issueDescription: z.string().min(1),
  serviceType: z.enum(SERVICE_TYPES),
  scheduledDate: z.string().datetime().or(z.string().min(1)),
});

const serviceRequestUpdateSchema = z.object({
  issueDescription: z.string().min(1).optional(),
  serviceType: z.enum(SERVICE_TYPES).optional(),
  scheduledDate: z.string().min(1).optional(),
  status: z.enum(STATUSES).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  vehicleSchema,
  vehicleUpdateSchema,
  serviceRequestSchema,
  serviceRequestUpdateSchema,
  INDIAN_STATE_CODES,
};
