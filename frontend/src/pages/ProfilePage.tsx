import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Loader2, Camera, User, Upload } from 'lucide-react';
import FormInput from '../components/FormInput';
import AlertCard from '../components/AlertCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { authService } from '../api';
import { setCredentials } from '../store/slices/authSlice';
import type { UpdateProfileErrors } from '../types/auth';
import { validateProfileUpdate } from '../utils/helper';

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name ?? '');
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null,
  );
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<UpdateProfileErrors>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user]);

  useEffect(() => {
    if (profilePictureFile) {
      const objectUrl = URL.createObjectURL(profilePictureFile);
      setProfilePicturePreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    }

    setProfilePicturePreview(user?.profilePictureUrl ?? '');
  }, [profilePictureFile, user?.profilePictureUrl]);

  const previewImage = useMemo(
    () => profilePicturePreview || user?.profilePictureUrl || '',
    [profilePicturePreview, user?.profilePictureUrl],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateProfileUpdate(
      name,
      oldPassword,
      newPassword,
      confirmNewPassword,
    );
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatedUser = await authService.updateProfile({
        name,
        profilePictureFile,
        oldPassword: oldPassword || undefined,
        newPassword: newPassword || undefined,
        confirmNewPassword: confirmNewPassword || undefined,
      });

      dispatch(setCredentials({ user: updatedUser }));
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setProfilePictureFile(null);
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border bg-card overflow-hidden"
      >
        <div className="grid lg:grid-cols-[320px_1fr]">
          <div className="p-8 border-b lg:border-b-0 lg:border-r border-border bg-gradient-to-br from-primary/10 via-background to-background">
            <div className="flex items-center gap-3 text-sm font-medium text-primary mb-6">
              <User className="size-4" />
              Profile
            </div>

            <div className="space-y-5">
              <div className="relative w-40 h-40 mx-auto rounded-full border border-border bg-muted overflow-hidden shadow-xl">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={user?.name || 'Profile picture preview'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-background text-5xl font-bold text-primary">
                    {(user?.name ?? 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-1 text-center">
                <h1 className="text-3xl font-semibold text-foreground">
                  {user?.name || 'User profile'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Update your name, photo, or password from this page.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">
                Account settings
              </p>
              <h2 className="text-2xl font-semibold text-foreground">
                Edit your profile
              </h2>
            </div>

            {error && (
              <AlertCard
                variant="error"
                message={error}
                onClose={() => setError('')}
              />
            )}

            {success && (
              <AlertCard
                variant="success"
                message={success}
                onClose={() => setSuccess('')}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormInput
                  id="name"
                  name="name"
                  label="Full name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  placeholder="John Doe"
                  error={fieldErrors.name}
                />

                <FormInput
                  id="email"
                  name="email"
                  label="Email"
                  value={user?.email ?? ''}
                  onChange={() => undefined}
                  placeholder="Email"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label className="block mb-2">Profile picture</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-card border border-border hover:bg-accent transition-colors cursor-pointer font-medium">
                    <Upload className="size-4" />
                    Choose image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        setProfilePictureFile(file);
                      }}
                    />
                  </label>
                  <div className="text-sm text-muted-foreground">
                    JPG, PNG, GIF, or WebP. Leave unchanged to keep your current
                    picture.
                  </div>
                </div>
                {fieldErrors.profilePictureFile && (
                  <p className="text-red-500 text-sm mt-1">
                    {fieldErrors.profilePictureFile}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Change password
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Enter your current password first, then choose a new one
                    that matches signup rules.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput
                    id="oldPassword"
                    name="oldPassword"
                    label="Current password"
                    type="password"
                    value={oldPassword}
                    onChange={(event) => {
                      setOldPassword(event.target.value);
                      if (fieldErrors.oldPassword) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          oldPassword: undefined,
                        }));
                      }
                    }}
                    placeholder="••••••••"
                    showPassword={showPasswords}
                    onTogglePassword={() => setShowPasswords(!showPasswords)}
                    error={fieldErrors.oldPassword}
                  />

                  <FormInput
                    id="newPassword"
                    name="newPassword"
                    label="New password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      if (fieldErrors.newPassword) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          newPassword: undefined,
                        }));
                      }
                    }}
                    placeholder="••••••••"
                    showPassword={showPasswords}
                    onTogglePassword={() => setShowPasswords(!showPasswords)}
                    error={fieldErrors.newPassword}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormInput
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    label="Confirm new password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(event) => {
                      setConfirmNewPassword(event.target.value);
                      if (fieldErrors.confirmNewPassword) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          confirmNewPassword: undefined,
                        }));
                      }
                    }}
                    placeholder="••••••••"
                    showPassword={showPasswords}
                    onTogglePassword={() => setShowPasswords(!showPasswords)}
                    error={fieldErrors.confirmNewPassword}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-muted-foreground">
                  {[
                    { label: '8+ characters', met: newPassword.length >= 8 },
                    { label: '1 lowercase', met: /[a-z]/.test(newPassword) },
                    { label: '1 uppercase', met: /[A-Z]/.test(newPassword) },
                    { label: '1 number', met: /[0-9]/.test(newPassword) },
                    {
                      label: '1 symbol',
                      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                        newPassword,
                      ),
                    },
                  ].map((rule) => (
                    <div
                      key={rule.label}
                      className={`rounded-xl border px-3 py-2 ${rule.met ? 'border-success/30 bg-success/10 text-success' : 'border-border bg-card'}`}
                    >
                      {rule.label}
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                {loading ? 'Saving changes...' : 'Save profile'}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
