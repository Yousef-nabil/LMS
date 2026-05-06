import React, { useEffect, useState } from 'react';
import { instructorService } from '../api';
import Loading from '../components/Loading';
import AlertCard from '../components/AlertCard';

function StatCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="p-4 bg-surface rounded-lg shadow-sm">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

export function InstructorDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [overview, setOverview] = useState<any | null>(null);
  const [students, setStudents] = useState<any[] | null>(null);
  const [payments, setPayments] = useState<any[] | null>(null);
  const [showOverview, setShowOverview] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await instructorService.getCourses();
        const data = resp?.data ?? resp;
        setCourses(
          Array.isArray(data) ? data : (data?.courses ?? data?.data ?? []),
        );
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const selectCourse = (course: any) => {
    setSelectedCourse(course);
    setOverview(null);
    setStudents(null);
    setPayments(null);
    setShowOverview(false);
    setShowStudents(false);
    setShowPayments(false);
  };

  const fetchOverview = async () => {
    if (!selectedCourse) return;
    if (showOverview) {
      setShowOverview(false);
      return;
    }
    setLoading(true);
    try {
      const resp = await instructorService.getCourseOverview(selectedCourse.id);
      const data = resp?.data ?? resp;
      setOverview(data);
      setShowOverview(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!selectedCourse) return;
    if (showStudents) {
      setShowStudents(false);
      return;
    }
    setLoading(true);
    try {
      const resp = await instructorService.getCourseStudents(
        selectedCourse.id,
        10,
        1,
      );
      const data = resp?.data ?? resp;
      setStudents(
        Array.isArray(data) ? data : (data?.students ?? data?.data ?? []),
      );
      setShowStudents(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    if (!selectedCourse) return;
    if (showPayments) {
      setShowPayments(false);
      return;
    }
    setLoading(true);
    try {
      const resp = await instructorService.getCoursePayments(selectedCourse.id);
      const data = resp?.data ?? resp;
      setPayments(
        Array.isArray(data) ? data : (data?.payments ?? data?.data ?? []),
      );
      setShowPayments(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const renderOverview = () => {
    if (!overview) return null;
    if (typeof overview !== 'object') return <div>{String(overview)}</div>;

    // If overview is an object with numeric stats, render stat cards
    const entries = Object.entries(overview).filter(
      ([, v]) => typeof v !== 'object' || Array.isArray(v),
    );

    return (
      <div className="grid grid-cols-3 gap-4">
        {entries.map(([k, v]) => (
          <StatCard
            key={k}
            title={k.replace(/_/g, ' ')}
            value={Array.isArray(v) ? v.length : String(v)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Instructor Dashboard</h1>

      {error && (
        <AlertCard
          variant="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {loading && <Loading />}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <h2 className="font-semibold mb-2">Your Courses</h2>
          <div className="space-y-3">
            {courses.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No courses found.
              </div>
            )}
            {courses.map((c) => (
              <div
                key={c.id}
                onClick={() => selectCourse(c)}
                className={`p-4 rounded-lg border cursor-pointer ${selectedCourse?.id === c.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'}`}
              >
                <div className="font-medium">
                  {c.title || c.name || `Course ${c.id}`}
                </div>
                <div className="text-sm text-muted-foreground">
                  {c.description || ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <h2 className="font-semibold mb-2">Course Details</h2>
          {!selectedCourse && (
            <div className="text-sm text-muted-foreground">
              Select a course to see details
            </div>
          )}

          {selectedCourse && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedCourse.title || selectedCourse.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {selectedCourse.id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={fetchOverview}
                    className={`px-3 py-1 rounded ${showOverview ? 'bg-primary text-primary-foreground' : 'bg-primary/30 text-primary-foreground'}`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={fetchStudents}
                    className={`px-3 py-1 rounded ${showStudents ? 'bg-primary text-primary-foreground' : 'bg-primary/30 text-primary-foreground'}`}
                  >
                    Students
                  </button>
                  <button
                    onClick={fetchPayments}
                    className={`px-3 py-1 rounded ${showPayments ? 'bg-primary text-primary-foreground' : 'bg-primary/30 text-primary-foreground'}`}
                  >
                    Payments
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {overview && showOverview && (
                  <div>
                    <h4 className="font-semibold mb-2">Overview</h4>
                    {renderOverview()}
                  </div>
                )}

                {students && showStudents && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Students ({students.length})
                    </h4>
                    <div className="bg-surface rounded-lg overflow-hidden border">
                      <table className="w-full">
                        <thead className="text-left text-sm text-muted-foreground">
                          <tr>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Student ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((s: any) => (
                            <tr key={s.id} className="border-t">
                              <td className="px-4 py-2">
                                {s.name || s.fullName || s.email || `#${s.id}`}
                              </td>
                              <td className="px-4 py-2">{s.email || '-'}</td>
                              <td className="px-4 py-2">
                                {s.studentId || s.id || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {payments && showPayments && (
                  <div>
                    <h4 className="font-semibold mb-2">
                      Payments ({payments.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {payments.map((p: any) => (
                        <div
                          key={p.id || p.transactionId}
                          className="p-4 bg-surface rounded-lg border"
                        >
                          <div className="text-sm text-muted-foreground">
                            Student
                          </div>
                          <div className="font-medium">
                            {p.studentName || p.payer || p.email || '-'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Student ID
                          </div>
                          <div className="text-sm mb-2">
                            {p.studentId ??
                              p.student_id ??
                              p.student?.id ??
                              '-'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Amount
                          </div>
                          <div className="font-semibold">
                            {p.amount ? `$${p.amount}` : p.total || '-'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Status
                          </div>
                          <div className="text-sm mb-2 capitalize">
                            {p.status || '-'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Date
                          </div>
                          <div className="text-sm">
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleString()
                              : p.date || '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InstructorDashboard;
