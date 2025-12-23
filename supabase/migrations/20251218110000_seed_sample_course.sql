-- Phase 21: Seed Sample Learning Course
-- Creates a sample course with modules and lessons for the 4DOF Robotic Arm

-- Only insert if no courses exist yet
DO $$
DECLARE
  v_product_id UUID;
  v_course_id UUID;
  v_module_1_id UUID;
  v_module_2_id UUID;
  v_module_3_id UUID;
BEGIN
  -- Get the 4DOF Arm product ID
  SELECT id INTO v_product_id FROM public.products WHERE slug = '4dof-arm' LIMIT 1;

  -- Exit if no product found
  IF v_product_id IS NULL THEN
    RAISE NOTICE 'No product found with slug 4dof-arm, skipping course seed';
    RETURN;
  END IF;

  -- Check if a course already exists for this product
  IF EXISTS (SELECT 1 FROM public.courses WHERE product_id = v_product_id) THEN
    RAISE NOTICE 'Course already exists for this product, skipping seed';
    RETURN;
  END IF;

  -- Create the course
  INSERT INTO public.courses (
    product_id,
    title,
    slug,
    description,
    difficulty,
    duration_minutes,
    is_published,
    icon
  ) VALUES (
    v_product_id,
    'Introduction to the 4DOF Robotic Arm',
    'intro-4dof-arm',
    'Learn everything you need to know to get started with your 4DOF Robotic Arm. From unboxing to advanced programming techniques.',
    'beginner',
    120,
    true,
    'cpu'
  ) RETURNING id INTO v_course_id;

  -- Module 1: Getting Started
  INSERT INTO public.modules (
    course_id,
    title,
    slug,
    description,
    sort_order,
    is_published,
    icon
  ) VALUES (
    v_course_id,
    'Getting Started',
    'getting-started',
    'Unbox and set up your robotic arm',
    0,
    true,
    'box'
  ) RETURNING id INTO v_module_1_id;

  -- Module 1 Lessons
  INSERT INTO public.lessons (module_id, title, slug, description, lesson_type, difficulty, estimated_minutes, is_published, sort_order, content)
  VALUES (
    v_module_1_id,
    'Welcome & Overview',
    'welcome',
    'Introduction to your 4DOF Robotic Arm kit',
    'content',
    'beginner',
    5,
    true,
    0,
    E'# Welcome to Your 4DOF Robotic Arm

Congratulations on your new robotic arm! In this course, you''ll learn everything you need to know to bring your robot to life.

## What You''ll Learn

- **Hardware Assembly**: How to properly assemble and connect your arm
- **Software Setup**: Installing the IDE and required libraries
- **Basic Programming**: Writing your first robot control programs
- **Advanced Techniques**: Smooth motion, sequences, and automation

## Prerequisites

Before we begin, make sure you have:

- Your 4DOF Robotic Arm kit (all parts included)
- A computer with a USB port
- The Arduino IDE (we''ll show you how to install it)

:::tip
Keep all the small screws and parts organized. We recommend using a small container or the original packaging compartments.
:::

## Course Structure

This course is divided into three main modules:

1. **Getting Started** - Assembly and software setup
2. **Basic Programming** - Your first programs
3. **Advanced Techniques** - Taking it to the next level

Let''s get started!'
  );

  INSERT INTO public.lessons (module_id, title, slug, description, lesson_type, difficulty, estimated_minutes, is_published, sort_order, content)
  VALUES (
    v_module_1_id,
    'Assembly Guide',
    'assembly',
    'Step-by-step assembly instructions',
    'content',
    'beginner',
    20,
    true,
    1,
    E'# Assembly Guide

Follow these steps to assemble your 4DOF Robotic Arm.

## Parts Checklist

Before starting, verify you have all parts:

- [ ] Base servo motor
- [ ] Shoulder servo motor
- [ ] Elbow servo motor
- [ ] Gripper servo motor
- [ ] Arm segments (3 pieces)
- [ ] Base plate
- [ ] Mounting screws (12x)
- [ ] Servo horns (4x)
- [ ] Control board
- [ ] USB cable

## Step 1: Mount the Base

1. Place the base plate on a flat surface
2. Attach the base servo motor using 4 screws
3. Connect the first servo horn

:::warning
Do not overtighten the screws! This can damage the plastic components.
:::

## Step 2: Attach the Shoulder

1. Connect the shoulder segment to the base servo horn
2. Mount the shoulder servo motor
3. Secure with screws

## Step 3: Connect the Elbow

1. Attach the elbow segment
2. Mount the elbow servo
3. Verify free movement

## Step 4: Install the Gripper

1. Attach the gripper mechanism
2. Connect the gripper servo
3. Test open/close manually

:::tip
Take photos at each step in case you need to troubleshoot later!
:::

## Final Check

Before powering on:

- All screws are secure but not overtightened
- Servo wires are not pinched or twisted
- All joints move freely by hand'
  );

  INSERT INTO public.lessons (module_id, title, slug, description, lesson_type, difficulty, estimated_minutes, is_published, sort_order, content)
  VALUES (
    v_module_1_id,
    'Software Setup',
    'software-setup',
    'Installing Arduino IDE and libraries',
    'content',
    'beginner',
    15,
    true,
    2,
    E'# Software Setup

Let''s get your development environment ready.

## Installing Arduino IDE

1. Visit [arduino.cc/en/software](https://www.arduino.cc/en/software)
2. Download the version for your operating system
3. Run the installer with default settings

## Installing Required Libraries

Open Arduino IDE and go to **Sketch > Include Library > Manage Libraries**

Search for and install:

- **Servo** (should be built-in)
- **Wire** (should be built-in)

## Connecting Your Board

1. Connect the USB cable from your computer to the control board
2. In Arduino IDE, go to **Tools > Board** and select **Arduino Uno**
3. Go to **Tools > Port** and select the port (usually COM3 on Windows or /dev/ttyUSB0 on Linux)

## Test Connection

Upload this simple test sketch:

```cpp
void setup() {
  Serial.begin(9600);
  Serial.println("Connection successful!");
}

void loop() {
  // Nothing here yet
}
```

Open the Serial Monitor (**Tools > Serial Monitor**) and you should see the message.

:::info
If you don''t see a port, you may need to install USB drivers. Check our troubleshooting guide for help.
:::'
  );

  -- Module 2: Basic Programming
  INSERT INTO public.modules (
    course_id,
    title,
    slug,
    description,
    sort_order,
    is_published,
    icon
  ) VALUES (
    v_course_id,
    'Basic Programming',
    'basic-programming',
    'Write your first robot control programs',
    1,
    true,
    'code'
  ) RETURNING id INTO v_module_2_id;

  -- Module 2 Lessons
  INSERT INTO public.lessons (module_id, title, slug, description, lesson_type, difficulty, estimated_minutes, is_published, sort_order, content, code_starter, code_solution)
  VALUES (
    v_module_2_id,
    'Moving Your First Servo',
    'first-servo',
    'Learn to control a single servo motor',
    'code_challenge',
    'beginner',
    15,
    true,
    0,
    E'# Moving Your First Servo

In this lesson, you''ll write code to control a single servo motor.

## Understanding Servos

Servo motors can rotate to a specific angle (usually 0-180 degrees). They''re perfect for robot arms because we can precisely control the position of each joint.

## The Servo Library

Arduino has a built-in Servo library that makes control easy:

```cpp
#include <Servo.h>

Servo myServo;  // Create a servo object

void setup() {
  myServo.attach(9);  // Attach to pin 9
}

void loop() {
  myServo.write(90);  // Move to 90 degrees
  delay(1000);        // Wait 1 second
  myServo.write(0);   // Move to 0 degrees
  delay(1000);        // Wait 1 second
}
```

## Your Challenge

Write a program that:
1. Moves the servo to 0 degrees
2. Waits half a second
3. Moves to 90 degrees
4. Waits half a second
5. Moves to 180 degrees
6. Waits half a second
7. Repeats

:::tip
Use `delay(500)` for half a second pauses.
:::',
    E'#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);
}

void loop() {
  // Your code here
  // Move to 0, 90, and 180 degrees with 500ms delays

}',
    E'#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);
}

void loop() {
  myServo.write(0);
  delay(500);

  myServo.write(90);
  delay(500);

  myServo.write(180);
  delay(500);
}'
  );

  INSERT INTO public.lessons (module_id, title, slug, description, lesson_type, difficulty, estimated_minutes, is_published, sort_order, content, code_starter, code_solution)
  VALUES (
    v_module_2_id,
    'Controlling All Joints',
    'all-joints',
    'Control all four servos together',
    'code_challenge',
    'intermediate',
    20,
    true,
    1,
    E'# Controlling All Joints

Now let''s control all four servo motors simultaneously.

## Pin Assignments

On the 4DOF Arm, the servos are connected to:

| Joint    | Pin |
|----------|-----|
| Base     | 3   |
| Shoulder | 5   |
| Elbow    | 6   |
| Gripper  | 9   |

## Setting Up Multiple Servos

```cpp
#include <Servo.h>

Servo base;
Servo shoulder;
Servo elbow;
Servo gripper;

void setup() {
  base.attach(3);
  shoulder.attach(5);
  elbow.attach(6);
  gripper.attach(9);
}
```

## Your Challenge

Create a "wave" animation where:
1. All joints start at 90 degrees
2. Base rotates left (45 degrees), then right (135 degrees)
3. Shoulder lifts up (60 degrees), then down (120 degrees)
4. Gripper opens (180 degrees) and closes (10 degrees)
5. Return all to center (90 degrees)',
    E'#include <Servo.h>

Servo base;
Servo shoulder;
Servo elbow;
Servo gripper;

void setup() {
  base.attach(3);
  shoulder.attach(5);
  elbow.attach(6);
  gripper.attach(9);

  // Start at center position
  base.write(90);
  shoulder.write(90);
  elbow.write(90);
  gripper.write(90);
  delay(1000);
}

void loop() {
  // Your wave animation code here

}',
    E'#include <Servo.h>

Servo base;
Servo shoulder;
Servo elbow;
Servo gripper;

void setup() {
  base.attach(3);
  shoulder.attach(5);
  elbow.attach(6);
  gripper.attach(9);

  // Start at center position
  base.write(90);
  shoulder.write(90);
  elbow.write(90);
  gripper.write(90);
  delay(1000);
}

void loop() {
  // Base rotation
  base.write(45);
  delay(500);
  base.write(135);
  delay(500);
  base.write(90);
  delay(500);

  // Shoulder movement
  shoulder.write(60);
  delay(500);
  shoulder.write(120);
  delay(500);
  shoulder.write(90);
  delay(500);

  // Gripper
  gripper.write(180);  // Open
  delay(500);
  gripper.write(10);   // Close
  delay(500);
  gripper.write(90);
  delay(500);

  // Pause before repeating
  delay(2000);
}'
  );

  -- Module 3: Advanced Techniques
  INSERT INTO public.modules (
    course_id,
    title,
    slug,
    description,
    sort_order,
    is_published,
    icon
  ) VALUES (
    v_course_id,
    'Advanced Techniques',
    'advanced-techniques',
    'Master smooth motion and automation',
    2,
    true,
    'sparkles'
  ) RETURNING id INTO v_module_3_id;

  -- Module 3 Lessons
  INSERT INTO public.lessons (module_id, title, slug, description, lesson_type, difficulty, estimated_minutes, is_published, sort_order, content)
  VALUES (
    v_module_3_id,
    'Smooth Motion',
    'smooth-motion',
    'Create fluid, natural-looking movements',
    'content',
    'intermediate',
    15,
    true,
    0,
    E'# Smooth Motion

Abrupt servo movements look robotic and can strain the motors. Let''s learn to create smooth, natural motion.

## The Problem

Using `servo.write()` immediately jumps to the target position. This looks jerky and can cause:

- Mechanical stress on joints
- Power supply voltage dips
- Unnatural appearance

## The Solution: Incremental Movement

Instead of jumping directly, we move in small steps:

```cpp
void smoothMove(Servo &servo, int targetAngle, int delayTime) {
  int currentAngle = servo.read();

  if (currentAngle < targetAngle) {
    for (int i = currentAngle; i <= targetAngle; i++) {
      servo.write(i);
      delay(delayTime);
    }
  } else {
    for (int i = currentAngle; i >= targetAngle; i--) {
      servo.write(i);
      delay(delayTime);
    }
  }
}
```

## Using the Function

```cpp
smoothMove(base, 45, 15);  // Move to 45 degrees, 15ms per step
```

The `delayTime` controls speed:
- Lower value = faster movement
- Higher value = slower, smoother movement

:::tip
Start with 15ms delay and adjust based on what looks best for your project.
:::'
  );

  INSERT INTO public.lessons (module_id, title, slug, description, lesson_type, difficulty, estimated_minutes, is_published, sort_order, content)
  VALUES (
    v_module_3_id,
    'Recording & Playback',
    'recording-playback',
    'Record movements and play them back',
    'content',
    'advanced',
    20,
    true,
    1,
    E'# Recording & Playback

Learn to record a sequence of positions and play them back automatically.

## The Concept

We''ll:
1. Manually move the arm to positions
2. Store each position in an array
3. Play back the sequence

## Position Structure

```cpp
struct Position {
  int base;
  int shoulder;
  int elbow;
  int gripper;
};

Position sequence[20];  // Store up to 20 positions
int sequenceLength = 0;
```

## Recording a Position

```cpp
void recordPosition() {
  if (sequenceLength < 20) {
    sequence[sequenceLength].base = base.read();
    sequence[sequenceLength].shoulder = shoulder.read();
    sequence[sequenceLength].elbow = elbow.read();
    sequence[sequenceLength].gripper = gripper.read();
    sequenceLength++;
    Serial.println("Position recorded!");
  }
}
```

## Playing Back

```cpp
void playSequence() {
  for (int i = 0; i < sequenceLength; i++) {
    smoothMove(base, sequence[i].base, 15);
    smoothMove(shoulder, sequence[i].shoulder, 15);
    smoothMove(elbow, sequence[i].elbow, 15);
    smoothMove(gripper, sequence[i].gripper, 15);
    delay(500);  // Pause between positions
  }
}
```

## Next Steps

Try adding:
- Serial commands to control recording/playback
- Save sequences to EEPROM for persistence
- Variable speed playback'
  );

  RAISE NOTICE 'Sample course created successfully!';
END $$;
