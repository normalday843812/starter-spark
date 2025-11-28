-- Seed initial products for StarterSpark
-- This migration adds the 4DOF Robotic Arm kit and related products

INSERT INTO products (slug, name, description, price_cents, is_featured, specs) VALUES
(
  '4dof-arm',
  'The 4DOF Robotic Arm',
  'Build a fully functional robotic arm from scratch. Learn mechanical assembly, electronics wiring, and Arduino programming—skills that transfer directly to real engineering projects. Each kit includes everything you need: pre-cut acrylic parts, high-torque servos, an Arduino Nano, and our step-by-step digital curriculum with interactive wiring diagrams.',
  4900,
  true,
  '{
    "Microcontroller": "Arduino Nano (ATmega328P)",
    "Servos": "2× SG90, 3× MG996R",
    "Degrees of Freedom": "4 (Base, Shoulder, Elbow, Gripper)",
    "Power": "4× AA Battery Pack",
    "Build Time": "~3 hours",
    "Skill Level": "Beginner friendly"
  }'::jsonb
),
(
  'servo-expansion',
  'Servo Expansion Pack',
  'Add more movement to your projects with this expansion pack featuring 4 additional SG90 micro servos and mounting hardware. Perfect for adding fingers to your robotic arm or building multi-axis platforms.',
  1499,
  false,
  '{
    "Contents": "4× SG90 Micro Servos",
    "Includes": "Mounting brackets, screws, wiring",
    "Compatible": "All StarterSpark kits",
    "Skill Level": "Beginner"
  }'::jsonb
),
(
  'sensor-kit',
  'Sensor Starter Kit',
  'Expand your robotics projects with essential sensors. Includes ultrasonic distance sensor, IR line followers, and a joystick module for manual control. Great for adding autonomous behavior to your robotic arm.',
  1999,
  false,
  '{
    "Ultrasonic": "HC-SR04 Distance Sensor",
    "IR Sensors": "2× Line Following Modules",
    "Control": "Analog Joystick Module",
    "Extras": "Jumper wires, breadboard",
    "Skill Level": "Beginner to Intermediate"
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  is_featured = EXCLUDED.is_featured,
  specs = EXCLUDED.specs;
