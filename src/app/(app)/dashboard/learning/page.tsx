"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import { coursesApi, coursesCsv, enrollmentsApi, type Course, type Enrollment, type EnrollmentStatus } from "@/lib/talent-api";
import { employeesApi, type Employee } from "@/lib/people-api";

const COURSE_REQUIRED_FIELDS = ["title"];

const statusTone: Record<EnrollmentStatus, string> = {
  "Not Started": "bg-cream-dim text-ink-soft",
  "In Progress": "bg-amber-soft text-amber",
  Completed: "bg-primary/15 text-primary",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

export default function LearningPage() {
  const { withAuth } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null);

  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", duration_hours: "4", link: "" });
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ employee: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [c, en, e] = await withAuth((token) =>
        Promise.all([coursesApi.list(token), enrollmentsApi.list(token), employeesApi.list(token)])
      );
      setCourses(c);
      setEnrollments(en);
      setEmployees(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = courses.find((c) => c.id === activeId) ?? null;
  const activeEnrollments = enrollments.filter((e) => e.course === activeId);

  function openCreateCourse() {
    setCourseForm({ title: "", description: "", duration_hours: "4", link: "" });
    setShowCourseForm(true);
  }

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await withAuth((token) =>
        coursesApi.create(token, {
          title: courseForm.title,
          description: courseForm.description,
          duration_hours: Number(courseForm.duration_hours),
          link: courseForm.link,
        })
      );
      setShowCourseForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCourse(c: Course) {
    if (!confirm(`Delete course "${c.title}"?`)) return;
    await withAuth((token) => coursesApi.remove(token, c.id));
    if (activeId === c.id) setActiveId(null);
    await load();
  }

  function openEnroll() {
    setEnrollForm({ employee: employees[0] ? String(employees[0].id) : "" });
    setShowEnrollForm(true);
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    setSaving(true);
    try {
      await withAuth((token) => enrollmentsApi.create(token, { course: active.id, employee: Number(enrollForm.employee) }));
      setShowEnrollForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function cycleStatus(en: Enrollment) {
    const next: Record<EnrollmentStatus, EnrollmentStatus> = { "Not Started": "In Progress", "In Progress": "Completed", Completed: "Not Started" };
    const status = next[en.status];
    await withAuth((token) =>
      enrollmentsApi.update(token, en.id, { status, completed_at: status === "Completed" ? new Date().toISOString().slice(0, 10) : null })
    );
    await load();
  }

  async function handleUnenroll(en: Enrollment) {
    if (!confirm(`Remove ${en.employee_detail.name} from this course?`)) return;
    await withAuth((token) => enrollmentsApi.remove(token, en.id));
    await load();
  }

  if (active) {
    return (
      <div className="mx-auto max-w-4xl">
        <button onClick={() => setActiveId(null)} className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> All courses
        </button>

        <div className="mb-6 rounded-2xl border border-line bg-card p-6">
          <h1 className="font-display text-xl font-bold text-ink">{active.title}</h1>
          <p className="mt-1 text-sm text-ink-soft">{active.description || "No description."}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
            <span>{active.duration_hours}h · {active.enrolled_count} enrolled</span>
            {active.link && (
              <a
                href={active.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-dark"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Join course
              </a>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-ink">Enrollments</h2>
          <button onClick={openEnroll} className="flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-cream hover:bg-primary-dark">
            <Plus className="h-3.5 w-3.5" /> Enroll employee
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {activeEnrollments.map((en) => (
            <div key={en.id} className="group flex items-center justify-between gap-2 rounded-xl border border-line bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                  {en.employee_detail.initials}
                </span>
                <span className="font-semibold text-ink">{en.employee_detail.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => cycleStatus(en)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[en.status]}`}>
                  {en.status}
                </button>
                <button onClick={() => handleUnenroll(en)} aria-label={`Remove ${en.employee_detail.name}`} className="rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {activeEnrollments.length === 0 && (
            <div className="rounded-xl border border-line bg-card p-8 text-center text-sm text-ink-soft">No one enrolled yet.</div>
          )}
        </div>

        {showEnrollForm && (
          <Modal title="Enroll employee" onClose={() => setShowEnrollForm(false)}>
            <form onSubmit={handleEnroll}>
              <div className="mb-6">
                <label className={labelClass}>Employee</label>
                <select required value={enrollForm.employee} onChange={(e) => setEnrollForm({ employee: e.target.value })} className={inputClass}>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60">
                {saving ? "Enrolling…" : "Enroll"}
              </button>
            </form>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Training & Learning Management System</h1>
          <p className="mt-1 text-sm text-ink-soft">Course delivery and enrollment tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar csv={coursesCsv} resourceLabel="courses" requiredFields={COURSE_REQUIRED_FIELDS} onImported={load} />
          <button onClick={openCreateCourse} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark">
            <Plus className="h-4 w-4" /> New course
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">No courses yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="group relative cursor-pointer rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md" onClick={() => setActiveId(c.id)}>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteCourse(c); }}
                aria-label={`Delete ${c.title}`}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <h3 className="flex items-center gap-1.5 font-display text-base font-bold text-ink">
                {c.title}
                {c.link && <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{c.description || "No description."}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-soft">
                <span>{c.duration_hours}h</span>
                <span>{c.enrolled_count} enrolled</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCourseForm && (
        <Modal title="New course" onClose={() => setShowCourseForm(false)}>
          <form onSubmit={handleCreateCourse}>
            <div className="mb-4">
              <label className={labelClass}>Title</label>
              <input required value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} className={inputClass} />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Description</label>
              <textarea rows={2} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} className={inputClass} />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Duration (hours)</label>
              <input type="number" min="1" value={courseForm.duration_hours} onChange={(e) => setCourseForm({ ...courseForm, duration_hours: e.target.value })} className={inputClass} />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Course link</label>
              <input
                type="url"
                value={courseForm.link}
                onChange={(e) => setCourseForm({ ...courseForm, link: e.target.value })}
                placeholder="Google Meet, Udemy Business, LinkedIn Learning…"
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60">
              {saving ? "Creating…" : "Create course"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
