import { z } from "zod";

import type { Course } from "@/lib/types";

export const COURSE_TITLE_MAX = 100;
export const COURSE_DESCRIPTION_MAX = 100;
export const MAX_INSTRUCTORS = 3;

export const courseFormSchema = z.object({
  courseId: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "รหัสวิชาต้องเป็นตัวเลข 6 หลัก"),
  courseTitle: z
    .string()
    .trim()
    .min(1, "กรอกชื่อวิชา")
    .max(
      COURSE_TITLE_MAX,
      `ชื่อวิชายาวได้ไม่เกิน ${COURSE_TITLE_MAX} ตัวอักษร`,
    ),
  program: z.enum(["CPE", "ISNE"], { message: "เลือกหลักสูตร" }),
  semester: z.enum(["1", "2", "3"], { message: "เลือกภาคการศึกษา" }),
  description: z
    .string()
    .trim()
    .max(
      COURSE_DESCRIPTION_MAX,
      `รายละเอียดต้องยาวไม่เกิน ${COURSE_DESCRIPTION_MAX} ตัวอักษร`,
    ),
  notifyByEmail: z.boolean(),
  instructors: z
    .array(
      z.object({
        name: z.string().trim().min(1, "กรอกชื่อผู้สอน"),
        email: z
          .string()
          .trim()
          .email("อีเมลไม่ถูกต้อง")
          .refine(
            (email) => email.toLowerCase().endsWith("@cmu.ac.th"),
            "ต้องเป็นอีเมล @cmu.ac.th",
          ),
      }),
    )
    .min(1, "ต้องมีผู้สอนอย่างน้อย 1 คน")
    .max(MAX_INSTRUCTORS, `มีผู้สอนได้ไม่เกิน ${MAX_INSTRUCTORS} คน`)
    .refine(
      (items) =>
        new Set(items.map((item) => item.email.toLowerCase())).size ===
        items.length,
      "อีเมลผู้สอนซ้ำกัน",
    ),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;
export const emptyCourseForm = {
  courseId: "",
  courseTitle: "",
  program: undefined,
  semester: undefined,
  description: "",
  notifyByEmail: false,
  instructors: [{ name: "", email: "" }],
};

export function createCourseFormSchema(existingCourses: Course[]) {
  return courseFormSchema.refine(
    (data) =>
      !existingCourses.some((course) => course.courseId === data.courseId),
    {
      message: "รหัสวิชานี้มีอยู่แล้ว",
      path: ["courseId"],
    },
  );
}
