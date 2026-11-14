import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CarFront, LoaderCircle } from 'lucide-react';

import type { Vehicle } from '../types/vehicle.types';
import type {
  VehicleDocument,
  VehicleDocumentType,
} from '../types/vehicle-document.types';

import { getVehicleById } from '../api/vehicle.api';
import {
  getVehicleDocuments,
  uploadVehicleDocument,
  verifyVehicleDocument,
} from '../api/vehicle-documents.api';

import VehicleDocumentCard from '../components/documents/VehicleDocumentCard';
import DocumentUploadForm from '../components/documents/DocumentUploadForm';
import VehicleStatusBadge from '../components/VehicleStatusBadge';

const REQUIRED_DOCUMENTS: VehicleDocumentType[] = [
  'registration_certificate',
  'insurance',
  'pollution_certificate',
];

export default function VehicleDocumentsPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [uploadingType, setUploadingType] =
    useState<VehicleDocumentType | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!vehicleId) return;

    try {
      const [vehicleData, documentData] = await Promise.all([
        getVehicleById(vehicleId),
        getVehicleDocuments(vehicleId),
      ]);

      setError(null);
      setVehicle(vehicleData);
      setDocuments(documentData);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Unable to load vehicle documents.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!vehicleId) return;

      try {
        const [vehicleData, documentData] = await Promise.all([
          getVehicleById(vehicleId),
          getVehicleDocuments(vehicleId),
        ]);

        if (!isMounted) return;

        setError(null);
        setVehicle(vehicleData);
        setDocuments(documentData);
      } catch (error) {
        if (!isMounted) return;

        setError(
          error instanceof Error
            ? error.message
            : 'Unable to load vehicle documents.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, [vehicleId]);

  const latestDocuments = REQUIRED_DOCUMENTS.map(
    (type) =>
      documents
        .filter((document) => document.documentType === type)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0] ?? null,
  );

  async function handleUpload(documentType: VehicleDocumentType, file: File) {
    if (!vehicleId) return;

    setUploadingType(documentType);

    try {
      await uploadVehicleDocument(vehicleId, documentType, file);
      await loadData();
    } finally {
      setUploadingType(null);
    }
  }

  async function handleVerify(documentId: string) {
    if (!vehicleId) return;

    setVerifyingId(documentId);

    try {
      await verifyVehicleDocument(vehicleId, documentId);
      await loadData();
    } finally {
      setVerifyingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="animate-spin text-[#a99aff]" size={28} />
      </div>
    );
  }

  if (!vehicle || error) {
    return (
      <div className="rounded-xl border border-[#252e3e] bg-[#111722] p-6 text-center">
        <p className="text-sm text-red-400">{error || 'Vehicle not found.'}</p>

        <button
          type="button"
          onClick={() => navigate('/vehicles')}
          className="mt-4 text-xs text-[#a99aff]"
        >
          Back to vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <button
        type="button"
        onClick={() => navigate('/vehicles')}
        className="inline-flex items-center gap-2 text-xs text-[#929bad] hover:text-white"
      >
        <ArrowLeft size={15} />
        Back to vehicles
      </button>

      <div className="rounded-xl border border-[#252e3e] bg-[#111722] p-5">
        <div className="flex items-center gap-3">
          <CarFront size={25} className="text-[#a99aff]" />

          <div>
            <h1 className="text-lg font-bold text-white">
              {vehicle.brand} {vehicle.model}
            </h1>

            <p className="mt-1 text-xs text-[#929bad]">
              {vehicle.registrationNumber}
            </p>
          </div>

          <div className="ml-auto">
            <VehicleStatusBadge status={vehicle.verificationStatus} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-white">
          Vehicle Documents
        </h2>

        <p className="mt-1 text-xs text-[#929bad]">
          Upload and verify your vehicle documents before offering rides.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {latestDocuments.map((document, index) => (
          <VehicleDocumentCard
            key={REQUIRED_DOCUMENTS[index]}
            documentType={REQUIRED_DOCUMENTS[index]}
            document={document}
            onUpload={setUploadingType}
            onVerify={handleVerify}
            isUploading={uploadingType === REQUIRED_DOCUMENTS[index]}
            isVerifying={document !== null && verifyingId === document.id}
          />
        ))}
      </div>

      {uploadingType && (
        <DocumentUploadForm
          documentType={uploadingType}
          onUpload={handleUpload}
          onClose={() => setUploadingType(null)}
        />
      )}
    </div>
  );
}
