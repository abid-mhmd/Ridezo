import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, LoaderCircle, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getMyProfile,
  removeProfilePhoto,
  updateMyProfile,
  uploadProfilePhoto,
} from '../api/profile.api';
import type { UserProfile, UserPreferences } from '../types/profile.type';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-[#30394b] bg-[#080b12] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-[#657086] focus:border-[#8b78ff]';

const labelClass = 'text-xs font-medium text-[#c7cddd]';

const defaultPreferences: UserPreferences = {
  smoking: 'no-preference',
  pets: 'no-preference',
  seatingComfort: 'no-preference',
  climateControl: 'no-preference',
};

export default function EditProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [about, setAbout] = useState('');
  const [phone, setPhone] = useState('');
  const [languages, setLanguages] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const user = await getMyProfile();

        if (!active) return;

        setProfile(user);
        setFirstName(user.firstName ?? '');
        setLastName(user.lastName ?? '');
        setAbout(user.about ?? '');
        setPhone(user.phone ?? '');
        setLanguages(user.languages?.join(', ') ?? '');

        setCity(
          typeof user.location === 'object'
            ? (user.location?.city ?? '')
            : (user.location ?? ''),
        );

        setState(
          typeof user.location === 'object' ? (user.location?.state ?? '') : '',
        );

        setPreferences({
          ...defaultPreferences,
          ...user.preferences,
        });
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Unable to load your profile.',
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    const normalizedPhone = phone.trim();

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSaving(true);

    try {
      await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        about: about.trim(),
        phone: phone.trim(),
        languages: languages
          .split(',')
          .map((language) => language.trim())
          .filter(Boolean),
        location: {
          city: city.trim(),
          state: state.trim(),
        },
        preferences,
      });

      setSuccess('Profile updated successfully.');
      navigate('/profile', { replace: true });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to update your profile.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhotoChange(file?: File) {
    if (!file) return;

    setError(null);
    setSuccess(null);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('The image must be smaller than 5 MB.');
      return;
    }

    setIsPhotoSaving(true);

    try {
      const result = await uploadProfilePhoto(file);

      setProfile((current) =>
        current ? { ...current, profilePhoto: result.profilePhoto } : current,
      );

      setSuccess('Profile photo updated successfully.');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to upload your photo.',
      );
    } finally {
      setIsPhotoSaving(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleRemovePhoto() {
    setError(null);
    setSuccess(null);
    setIsPhotoSaving(true);

    try {
      await removeProfilePhoto();

      setProfile((current) =>
        current ? { ...current, profilePhoto: undefined } : current,
      );

      setSuccess('Profile photo removed.');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to remove your photo.',
      );
    } finally {
      setIsPhotoSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse rounded-2xl border border-[#252e3e] bg-[#111722] p-8">
        <div className="h-6 w-48 rounded bg-[#252e3e]" />
        <div className="mt-6 h-32 rounded-xl bg-[#1b2030]" />
        <div className="mt-6 h-64 rounded-xl bg-[#1b2030]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <section className="mx-auto max-w-4xl rounded-2xl border border-[#252e3e] bg-[#111722] p-6">
        <p className="text-sm text-rose-400">
          {error ?? 'Unable to load your profile.'}
        </p>
        <Link
          to="/profile"
          className="mt-4 inline-flex text-sm text-[#b6a8ff] hover:underline"
        >
          Back to profile
        </Link>
      </section>
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <main className="mx-auto max-w-4xl space-y-6 pb-12">
      <header>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 text-sm text-[#929bad] transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to profile
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-white">Edit profile</h1>
        <p className="mt-2 text-sm text-[#929bad]">
          Keep your personal details and travel preferences up to date.
        </p>
      </header>

      {(error || success) && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? 'border-rose-400/20 bg-rose-400/10 text-rose-300'
              : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
          }`}
        >
          {error ?? success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-7">
          <h2 className="text-sm font-semibold text-white">Profile photo</h2>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={fullName || 'Profile photo'}
                className="h-24 w-24 rounded-2xl border border-[#30394b] object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[#30394b] bg-[#1b2030] text-3xl font-semibold text-[#b6a8ff]">
                {firstName.charAt(0).toUpperCase() || '?'}
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-white">
                Choose a profile picture
              </p>
              <p className="mt-1 text-xs text-[#929bad]">
                JPEG, PNG or WebP. Maximum size: 5 MB.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isPhotoSaving}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#8b78ff] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#7965ed] disabled:opacity-50"
                >
                  {isPhotoSaving ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Camera size={15} />
                  )}
                  {profile.profilePhoto ? 'Change photo' : 'Upload photo'}
                </button>

                {profile.profilePhoto && (
                  <button
                    type="button"
                    disabled={isPhotoSaving}
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#30394b] px-3.5 py-2.5 text-xs text-[#c7cddd] transition hover:bg-[#202838] disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) =>
                  void handlePhotoChange(event.target.files?.[0])
                }
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-7">
          <h2 className="text-sm font-semibold text-white">Personal details</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              First name
              <input
                className={inputClass}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                maxLength={50}
                required
                autoComplete="given-name"
              />
            </label>
            <label className={labelClass}>
              Last name
              <input
                className={inputClass}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                maxLength={50}
                required
                autoComplete="family-name"
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              About
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                value={about}
                onChange={(event) => setAbout(event.target.value)}
                maxLength={300}
                placeholder="Tell other travellers a little about yourself..."
              />
              <span className="mt-1 block text-right text-[11px] text-[#657086]">
                {about.length}/300
              </span>
            </label>
            <label className={labelClass}>
              Email address
              <input
                className={`${inputClass} cursor-not-allowed opacity-60`}
                value={profile.email}
                readOnly
                type="email"
              />
              <span className="mt-1 block text-[11px] text-[#657086]">
                Email cannot be changed here.
              </span>
            </label>

            <label className={labelClass}>
              Phone number
              <input
                className={inputClass}
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={15}
                placeholder="Enter your phone number"
                autoComplete="tel"
              />
            </label>

            <label className={labelClass}>
              City
              <input
                className={inputClass}
                value={city}
                onChange={(event) => setCity(event.target.value)}
                maxLength={100}
                placeholder="Your city"
              />
            </label>
            <label className={labelClass}>
              State
              <input
                className={inputClass}
                value={state}
                onChange={(event) => setState(event.target.value)}
                maxLength={100}
                placeholder="Your state"
              />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>
              Languages
              <input
                className={inputClass}
                value={languages}
                onChange={(event) => setLanguages(event.target.value)}
                placeholder="English, Malayalam, Hindi"
              />
              <span className="mt-1 block text-[11px] text-[#657086]">
                Separate languages with commas.
              </span>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-[#252e3e] bg-[#111722] p-5 sm:p-7">
          <h2 className="text-sm font-semibold text-white">
            Travel preferences
          </h2>
          <p className="mt-1 text-xs text-[#929bad]">
            Help other travellers understand your preferences.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className={labelClass}>
              Smoking
              <select
                className={inputClass}
                value={preferences.smoking}
                onChange={(event) =>
                  updatePreference(
                    'smoking',
                    event.target.value as UserPreferences['smoking'],
                  )
                }
              >
                <option value="no-preference">No preference</option>
                <option value="non-smoking">Non-smoking</option>
                <option value="smoking-allowed">Smoking allowed</option>
              </select>
            </label>

            <label className={labelClass}>
              Pets
              <select
                className={inputClass}
                value={preferences.pets}
                onChange={(event) =>
                  updatePreference(
                    'pets',
                    event.target.value as UserPreferences['pets'],
                  )
                }
              >
                <option value="no-preference">No preference</option>
                <option value="allowed">Allowed</option>
                <option value="not-allowed">Not allowed</option>
              </select>
            </label>

            <label className={labelClass}>
              Seating comfort
              <select
                className={inputClass}
                value={preferences.seatingComfort}
                onChange={(event) =>
                  updatePreference(
                    'seatingComfort',
                    event.target.value as UserPreferences['seatingComfort'],
                  )
                }
              >
                <option value="no-preference">No preference</option>
                <option value="window">Window</option>
                <option value="middle">Middle</option>
                <option value="aisle">Aisle</option>
              </select>
            </label>

            <label className={labelClass}>
              Climate control
              <select
                className={inputClass}
                value={preferences.climateControl}
                onChange={(event) =>
                  updatePreference(
                    'climateControl',
                    event.target.value as UserPreferences['climateControl'],
                  )
                }
              >
                <option value="no-preference">No preference</option>
                <option value="ac-preferred">AC preferred</option>
                <option value="non-ac-preferred">Non-AC preferred</option>
              </select>
            </label>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/profile"
            className="rounded-xl border border-[#30394b] px-5 py-3 text-center text-sm font-medium text-[#c7cddd] transition hover:bg-[#202838]"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8b78ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#7965ed] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </main>
  );
}
