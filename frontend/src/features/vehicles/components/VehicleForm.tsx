import { useEffect, useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { CarFront, UploadCloud, X, CheckCircle2 } from 'lucide-react';

import {
  vehicleSchema,
  type VehicleFormValues,
} from '../schemas/vehicle.schema';
import { uploadVehiclePhoto } from '../api/vehicle.api';

export type VehicleFormSubmitValues = Omit<VehicleFormValues, 'vehiclePhoto'> & {
  vehiclePhotoKey?: string;
};

interface VehicleFormProps {
  initialValues?: VehicleFormValues;
  submitLabel: string;
  onSubmit: (values: VehicleFormSubmitValues) => Promise<void>;
}

const defaultValues: VehicleFormValues = {
  vehicleType: 'hatchback',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  registrationNumber: '',
  seatCapacity: 3,
  fuelType: 'petrol',
  vehiclePhoto: '',
};

const vehicleTypes = ['hatchback', 'sedan', 'suv', 'muv', 'van'] as const;
const fuelTypes = ['petrol', 'diesel', 'cng', 'electric', 'hybrid'] as const;

export default function VehicleForm({
  initialValues,
  submitLabel,
  onSubmit,
}: VehicleFormProps) {
  const [values, setValues] = useState<VehicleFormValues>(
    initialValues ?? defaultValues,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof VehicleFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(
    initialValues?.vehiclePhoto ?? '',
  );
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setValues((previous) => ({
      ...previous,
      [name]:
        name === 'year' || name === 'seatCapacity' ? Number(value) : value,
    }));

    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setSubmitError('Please select a PNG, JPG, or WEBP image.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Image size must not exceed 5MB.');
      event.target.value = '';
      return;
    }

    setSubmitError('');

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);

    previewUrlRef.current = objectUrl;
    setPhotoPreviewUrl(objectUrl);
    setSelectedFile(file);
  };

  const removePhoto = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setSelectedFile(null);
    setPhotoPreviewUrl('');
    setValues((previous) => ({ ...previous, vehiclePhoto: '' }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = vehicleSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof VehicleFormValues, string>> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof VehicleFormValues;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      setErrors({});

      let vehiclePhotoKey: string | undefined;

      // Upload selected image to S3.
      if (selectedFile) {
        const uploaded = await uploadVehiclePhoto(selectedFile);

        vehiclePhotoKey = uploaded.vehiclePhotoKey;

        // Keep the preview URL for display.
        setPhotoPreviewUrl(uploaded.vehiclePhoto);
      }

      // Exclude the display URL from the API payload.
      const { vehiclePhoto: _vehiclePhoto, ...vehicleDetails } = result.data;

      await onSubmit({
        ...vehicleDetails,
        vehiclePhotoKey,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to save vehicle. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-[#252e3e] bg-[#080b12] px-3 py-2 text-xs text-white outline-none placeholder:text-gray-600 focus:border-[#8b78ff]';

  const renderError = (field: keyof VehicleFormValues) =>
    errors[field] ? (
      <p className="mt-1 text-[11px] text-red-400">{errors[field]}</p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12"
    >
      <div className="space-y-5 lg:col-span-8">
        <section className="space-y-4 rounded-xl border border-[#252e3e] bg-[#111722] p-4 sm:p-5">
          <div className="border-b border-[#252e3e] pb-3">
            <h2 className="text-sm font-semibold text-white">
              Vehicle Information
            </h2>
            <p className="mt-1 text-[11px] text-[#929bad]">
              Enter your vehicle details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#c7cddd]">
                Vehicle Type *
              </label>
              <select
                name="vehicleType"
                value={values.vehicleType}
                onChange={handleChange}
                className={inputClass}
              >
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
              {renderError('vehicleType')}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#c7cddd]">
                Manufacturer *
              </label>
              <input
                name="brand"
                value={values.brand}
                onChange={handleChange}
                placeholder="e.g. Hyundai"
                maxLength={50}
                className={inputClass}
              />
              {renderError('brand')}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#c7cddd]">
                Model *
              </label>
              <input
                name="model"
                value={values.model}
                onChange={handleChange}
                placeholder="e.g. i20 Sportz"
                maxLength={50}
                className={inputClass}
              />
              {renderError('model')}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#c7cddd]">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={values.year}
                onChange={handleChange}
                className={inputClass}
              />
              {renderError('year')}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#c7cddd]">
                Exterior Color *
              </label>
              <input
                name="color"
                value={values.color}
                onChange={handleChange}
                placeholder="e.g. White"
                maxLength={30}
                className={inputClass}
              />
              {renderError('color')}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#c7cddd]">
                Registration Number *
              </label>
              <input
                name="registrationNumber"
                value={values.registrationNumber}
                onChange={handleChange}
                placeholder="KL 14 Z 4519"
                maxLength={20}
                className={`${inputClass} font-mono`}
              />
              {renderError('registrationNumber')}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#c7cddd]">
                Fuel Type *
              </label>
              <select
                name="fuelType"
                value={values.fuelType}
                onChange={handleChange}
                className={inputClass}
              >
                {fuelTypes.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel.toUpperCase()}
                  </option>
                ))}
              </select>
              {renderError('fuelType')}
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] text-[#c7cddd]">
                Passenger Seat Capacity *
              </label>
              <input
                type="number"
                name="seatCapacity"
                min={1}
                max={8}
                value={values.seatCapacity}
                onChange={handleChange}
                className={inputClass}
              />
              {renderError('seatCapacity')}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-[#252e3e] bg-[#111722] p-4 sm:p-5">
          <div className="border-b border-[#252e3e] pb-3">
            <h2 className="text-sm font-semibold text-white">
              Vehicle Photograph
            </h2>
            <p className="mt-1 text-[11px] text-[#929bad]">
              Add a photo to help passengers identify your vehicle.
            </p>
          </div>

          {photoPreviewUrl ? (
            <div className="relative overflow-hidden rounded-lg border border-[#252e3e]">
              <img
                src={photoPreviewUrl}
                alt="Vehicle preview"
                className="aspect-[2/1] w-full object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute right-2 top-2 rounded-lg bg-black/70 p-2 text-white hover:bg-red-500"
                title="Remove photo"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#30394b] bg-[#080b12] p-6 text-center transition hover:border-[#8b78ff]">
              <UploadCloud size={24} className="text-[#b6a8ff]" />
              <p className="mt-2 text-xs font-medium text-white">
                Upload Vehicle Photo
              </p>
              <p className="mt-1 text-[10px] text-[#929bad]">
                PNG, JPG or WEBP · Maximum 5MB
              </p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </section>

        {submitError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
            {submitError}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            disabled={isSubmitting}
            className="rounded-lg border border-[#252e3e] px-4 py-2 text-xs text-[#929bad] hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gradient-to-r from-[#8b78ff] to-[#ec4899] px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:col-span-4">
        <div className="overflow-hidden rounded-xl border border-[#252e3e] bg-[#111722]">
          <div className="flex items-center justify-between border-b border-[#252e3e] bg-[#1b2230] px-4 py-3">
            <span className="text-xs font-semibold text-white">
              Vehicle Summary
            </span>
            <span className="text-[10px] text-[#36e0c0]">LIVE PREVIEW</span>
          </div>

          <div className="flex h-36 items-center justify-center bg-[#080b12]">
            {photoPreviewUrl ? (
              <img
                src={photoPreviewUrl}
                alt="Vehicle preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <CarFront
                size={42}
                strokeWidth={1.2}
                className="text-[#657086]"
              />
            )}
          </div>

          <div className="space-y-3 p-4 text-xs">
            {[
              ['Make & Model', `${values.brand} ${values.model}`],
              ['Year & Type', `${values.year} · ${values.vehicleType}`],
              ['Color', values.color],
              ['Registration', values.registrationNumber],
              ['Fuel Type', values.fuelType],
              ['Passenger Seats', `${values.seatCapacity} Seats`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between gap-3 border-b border-[#252e3e] pb-2"
              >
                <span className="text-[#929bad]">{label}</span>
                <span className="text-right font-medium text-white">
                  {value || '—'}
                </span>
              </div>
            ))}

            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-[10px] text-amber-300">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              <span>
                Verification Pending. Vehicle documents must be verified before
                offering rides.
              </span>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
